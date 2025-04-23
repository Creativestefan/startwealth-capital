"use client"

import { useState } from "react"
import { KycStatus, User } from "@prisma/client"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Edit, Save, X, Mail, Phone, Calendar, MapPin, CheckCircle, XCircle, User as UserIcon, Shield, AlertCircle, Calendar as CalendarIcon, DollarSign, Ban, Trash2, Upload, Key } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// Extend the User type with KYC information
interface ExtendedUser extends User {
  kyc?: {
    status: KycStatus
    submittedAt: Date
    country: string
  } | null
  wallet?: {
    balance: number
    id: string
  } | null
}

interface UserDetailProps {
  user: ExtendedUser
}

export default function UserDetail({ user }: UserDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user.image || null)
  const [adminPassword, setAdminPassword] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const updateUserMutation = useMutation({
    mutationFn: async (userData: { 
      firstName: string; 
      lastName: string; 
      email: string; 
      password?: string;
      image?: string;
      adminPassword: string 
    }) => {
      // Create FormData if we have a profile image
      if (profileImage) {
        const formData = new FormData();
        formData.append('image', profileImage);
        
        // Upload image first
        const uploadResponse = await fetch(`/api/admin/upload`, {
          method: "POST",
          body: formData
        });
        
        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.message || "Failed to upload profile image");
        }
        
        const { imageUrl } = await uploadResponse.json();
        userData.image = imageUrl;
      }
      
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update user details")
      }

      return response.json()
    },
    onSuccess: () => {
      setIsEditing(false)
      setShowPasswordDialog(false)
      setShowEditDialog(false)
      setAdminPassword("")
      setPassword("")
      toast.success("User details updated successfully")
      // Reload the page to refresh the data
      window.location.reload()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user details")
    },
  })

  const banUserMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to ban user")
      }

      return response.json()
    },
    onSuccess: () => {
      setShowBanDialog(false)
      toast.success(`User ${user.isBanned ? 'unbanned' : 'banned'} successfully`)
      // Reload the page to refresh the data
      window.location.reload()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to ban user")
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete user")
      }

      return response.json()
    },
    onSuccess: () => {
      setShowDeleteDialog(false)
      toast.success("User deleted successfully")
      // Redirect to users list
      window.location.href = "/admin/users/all"
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user")
    },
  })

  const handleSave = () => {
    setShowPasswordDialog(true)
  }

  const confirmSave = () => {
    const userData: unknown = {
      firstName,
      lastName,
      email,
      adminPassword,
    }
    
    if (password) {
      userData.password = password;
    }
    
    updateUserMutation.mutate(userData)
  }

  const handleBanUser = () => {
    setShowBanDialog(true)
  }

  const confirmBanUser = () => {
    banUserMutation.mutate()
  }

  const handleDeleteUser = () => {
    setShowDeleteDialog(true)
  }

  const confirmDeleteUser = () => {
    deleteUserMutation.mutate()
  }

  const handleCancel = () => {
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setEmail(user.email)
    setPassword("")
    setProfileImage(null)
    setProfileImagePreview(user.image || null)
    setShowEditDialog(false)
  }
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const renderKycBadge = (status?: KycStatus | null) => {
    if (!status) {
      return (
        <Badge variant="outline" className="text-gray-500 bg-gray-100">
          Not Started
        </Badge>
      )
    }

    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="outline" className="text-green-600 bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
            <AlertCircle className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="text-red-600 bg-red-50">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-500 bg-gray-100">
            {status}
          </Badge>
        )
    }
  }

  // Format date to locale string
  const formatDate = (date?: Date | string | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <>
      <Card className="overflow-hidden" id="user-info-display">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              <AvatarImage src={user.image || undefined} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-lg bg-primary/10">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                <h1>{`${user.firstName} ${user.lastName}`}</h1>
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Mail className="mr-1 h-3 w-3" /> {user.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="text-sm font-medium mb-3 text-blue-900 flex items-center">
                <UserIcon className="w-4 h-4 mr-2 text-blue-600" />
                Account Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Role</span>
                  <Badge 
                    variant={user.role === "ADMIN" ? "destructive" : "default"}
                    className="capitalize"
                  >
                    {user.role.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account Created</span>
                  <span className="flex items-center">
                    <CalendarIcon className="mr-1 h-3 w-3" /> {formatDate(user.createdAt)}
                  </span>
                </div>
                {user.emailVerified && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Email Verified</span>
                    <span className="flex items-center">
                      <CheckCircle className="mr-1 h-3 w-3 text-green-500" /> {formatDate(user.emailVerified)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account Status</span>
                  {user.isBanned ? (
                    <Badge variant="destructive" className="capitalize">
                      Banned
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 bg-green-50">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="text-sm font-medium mb-3 text-blue-900 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-600" />
                Verification Status
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">KYC Status</span>
                  {renderKycBadge(user.kyc?.status)}
                </div>
                {user.kyc && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Country</span>
                      <span>{user.kyc.country}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Submitted On</span>
                      <span>{formatDate(user.kyc.submittedAt)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="text-sm font-medium mb-3 text-blue-900 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                Wallet Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Wallet Status</span>
                  {user.wallet ? (
                    <Badge variant="outline" className="text-green-600 bg-green-50">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500 bg-gray-100">
                      Not Created
                    </Badge>
                  )}
                </div>
                {user.wallet && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="font-medium">${user.wallet.balance.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gradient-to-r from-blue-50/80 to-indigo-50/80 px-6 py-4">
          <div className="flex flex-wrap gap-2 w-full justify-between">
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <a href={`/admin/users/kyc?userId=${user.id}`}>
                  <Shield className="h-4 w-4 mr-1" /> View KYC Details
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit Details
              </Button>
            </div>
            <div className="space-x-2">
              <Button 
                variant={user.isBanned ? "outline" : "destructive"} 
                size="sm"
                onClick={handleBanUser}
              >
                <Ban className="h-4 w-4 mr-1" /> {user.isBanned ? 'Unban User' : 'Ban User'}
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDeleteUser}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete User
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>
              Make changes to the user's profile details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary/10">
                  <AvatarImage src={profileImagePreview || undefined} alt={`${firstName} ${lastName}`} />
                  <AvatarFallback className="text-xl bg-primary/10">
                    {firstName[0]}{lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="profile-image-upload" 
                  className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer shadow-md"
                >
                  <Upload className="h-4 w-4" />
                  <input 
                    id="profile-image-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">
                New Password <span className="text-xs text-muted-foreground">(leave blank to keep current password)</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                />
                <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Saving..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Password Confirmation Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Admin Password</DialogTitle>
            <DialogDescription>
              Please enter your admin password to confirm these changes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="adminPassword">Admin Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button 
              onClick={confirmSave}
              disabled={updateUserMutation.isPending || !adminPassword}
            >
              {updateUserMutation.isPending ? "Confirming..." : "Confirm Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Confirmation Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{user.isBanned ? 'Unban' : 'Ban'} User Account</AlertDialogTitle>
            <AlertDialogDescription>
              {user.isBanned 
                ? `This will allow ${user.firstName} ${user.lastName} to login and use the platform again.` 
                : `This action will prevent ${user.firstName} ${user.lastName} from logging in to the platform. They will be immediately logged out of any active sessions.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={user.isBanned ? "" : "bg-destructive hover:bg-destructive/90"}
              onClick={confirmBanUser}
            >
              {banUserMutation.isPending 
                ? "Processing..." 
                : user.isBanned 
                  ? "Unban User" 
                  : "Ban User"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {user.firstName} {user.lastName}'s account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDeleteUser}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 