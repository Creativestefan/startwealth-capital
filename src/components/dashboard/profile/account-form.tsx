"use client"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { User } from "next-auth"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Upload, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useUser } from "@/providers/user-provider"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const accountFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

interface AccountFormProps {
  user: User
}

export function AccountForm({ user }: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState<string>(user.image || "")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { updateUserAvatar } = useUser()

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
    },
  })

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Maximum size is 5MB.")
      return
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPEG, PNG, or WebP images.")
      return
    }

    setIsUploading(true)
    
    try {
      // Create FormData
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/users/upload-avatar", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload profile picture")
      }
      
      const data = await response.json()
      setAvatarSrc(data.imageUrl)
      // Update avatar in context so all components using it will update
      updateUserAvatar(data.imageUrl)
      toast.success("Profile picture updated successfully")
    } catch (error) {
      console.error("Profile picture upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload profile picture")
    } finally {
      setIsUploading(false)
    }
  }

  const removeProfilePicture = async () => {
    if (!avatarSrc) return
    
    try {
      setIsUploading(true)
      const response = await fetch("/api/users/remove-avatar", {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to remove profile picture")
      }
      
      setAvatarSrc("")
      // Update avatar in context so all components using it will update
      updateUserAvatar(null)
      toast.success("Profile picture removed")
    } catch (error) {
      console.error("Profile picture removal error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to remove profile picture")
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(values: AccountFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const response = await fetch("/api/users/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      setSubmitSuccess(true)
      toast.success("Account information updated successfully")
    } catch (error) {
      console.error("Profile update error:", error)
      setSubmitError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate user initials for avatar fallback
  const getUserInitials = () => {
    const firstName = form.watch("firstName") || user.firstName || ""
    const lastName = form.watch("lastName") || user.lastName || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Update your personal information and profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Profile Picture Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarSrc} alt={getUserInitials()} />
              <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button 
                type="button" 
                variant="outline" 
                onClick={triggerFileInput}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Upload New Picture
                  </>
                )}
              </Button>
              {avatarSrc && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={removeProfilePicture}
                  disabled={isUploading}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" /> Remove Picture
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Upload a profile picture in JPEG, PNG, or WebP format. Maximum file size is 5MB.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} disabled />
                  </FormControl>
                  <FormDescription>
                    Your email address cannot be changed directly. Contact support if you need to update it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
            {submitSuccess && (
              <Alert className="bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your account information has been updated successfully.
                </AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
