"use client"

import { Bell, ChevronsUpDown, Lock, LogOut, Shield, Sparkles, User, Settings } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useUser } from "@/providers/user-provider"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { NotificationSheet } from "@/components/dashboard/notification-sheet"

interface UserProps {
  firstName: string
  lastName: string
  email: string
  image?: string | null
  role?: string
}

export function NavUser({ user }: { user: UserProps }) {
  const { collapsed } = useSidebar()
  const { userAvatar, avatarTimestamp } = useUser()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  
  // Use context avatar if available, otherwise fall back to user.image
  const avatarSrc = userAvatar !== null ? userAvatar : user.image
  
  // Add a cache-busting timestamp query parameter
  const avatarWithTimestamp = avatarSrc ? `${avatarSrc}?t=${avatarTimestamp}` : ""
  
  // Add fallbacks for empty names
  const firstName = user.firstName || "U"
  const lastName = user.lastName || ""
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || "User"

  // Get initials - fallback to "U" if no name available
  const initials = firstName ? firstName.charAt(0).toUpperCase() : "U"
  
  // Check if user is admin
  const isAdmin = user.role === "ADMIN"

  return (
    <div className="flex items-center gap-2">
      <div className="mt-auto px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {collapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-white">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={avatarWithTimestamp} alt={displayName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" className="ml-1">
                    {displayName}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-900">
                <div className="flex items-center gap-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={avatarWithTimestamp} alt={displayName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{displayName}</span>
                    <span className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</span>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4" />
              </button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56" 
            align="end" 
            side="top"
            sideOffset={collapsed ? 12 : 0}
          >
            <DropdownMenuLabel className="flex items-center gap-3 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarWithTimestamp} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{displayName}</span>
                <span className="text-xs text-gray-500 truncate max-w-[180px]">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile/account" className="flex cursor-pointer items-center">
                  <User className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              {/* Only show KYC and Referral Program for non-admin users */}
              {!isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/kyc" className="flex cursor-pointer items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      KYC Verification
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/password" className="flex cursor-pointer items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/referrals" className="flex cursor-pointer items-center">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Referral Program
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem 
                onClick={() => setNotificationsOpen(true)} 
                className="flex cursor-pointer items-center"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/notification-preferences" className="flex cursor-pointer items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Notification Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Add the NotificationSheet component */}
      <NotificationSheet 
        isOpen={notificationsOpen} 
        onOpenChange={setNotificationsOpen} 
      />
    </div>
  )
}

