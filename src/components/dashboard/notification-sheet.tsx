"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { 
  Bell, 
  X, 
  Check, 
  Info, 
  AlertTriangle, 
  CheckCircle2,
  ShieldAlert,
  Settings
} from "lucide-react"
import { toast } from "sonner"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { NotificationType } from "@prisma/client"

type Notification = {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  pages: number
}

interface NotificationResponse {
  notifications: Notification[]
  pagination: PaginationInfo
}

interface NotificationSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationSheet({ isOpen, onOpenChange }: NotificationSheetProps) {
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery<NotificationResponse>({
    queryKey: ["notifications", page],
    queryFn: async () => {
      const response = await fetch(`/api/notifications?page=${page}&limit=10`)
      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }
      return response.json()
    },
    enabled: isOpen, // Only fetch when sheet is open
  })

  const notifications = data?.notifications || []
  const pagination = data?.pagination

  const handleMarkAsRead = async (id: string) => {
    try {
      setMarkingAsRead(prev => new Set(prev).add(id))
      
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      })
      
      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }
      
      await refetch()
    } catch (error) {
      toast.error("Failed to mark notification as read")
    } finally {
      setMarkingAsRead(prev => {
        const updated = new Set(prev)
        updated.delete(id)
        return updated
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      })
      
      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }
      
      await refetch()
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all notifications as read")
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ADMIN_ALERT:
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100">
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </div>
        )
      case NotificationType.SYSTEM_UPDATE:
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-100">
            <Settings className="h-5 w-5 text-purple-500" />
          </div>
        )
      case NotificationType.KYC_STATUS:
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
        )
      case NotificationType.INVESTMENT_MATURED:
      case NotificationType.COMMISSION_EARNED:
      case NotificationType.COMMISSION_PAID:
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
        )
      case NotificationType.WALLET_UPDATED:
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100">
            <Info className="h-5 w-5 text-blue-500" />
          </div>
        )
      case NotificationType.PASSWORD_CHANGED:
      case NotificationType.PROFILE_UPDATED:
      case NotificationType.PAYMENT_DUE:
      case NotificationType.REFERRAL_COMPLETED:
      default:
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100">
            <Info className="h-5 w-5 text-gray-500" />
          </div>
        )
    }
  }

  // Count unread notifications
  const unreadCount = notifications?.filter(n => !n.read).length || 0

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.pages)) return
    setPage(newPage)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md" side="right">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications 
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
            
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading && (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {isError && (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">
                Failed to load notifications
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          )}
          
          {!isLoading && !isError && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Notifications</h3>
              <p className="text-sm text-muted-foreground">
                You don't have any notifications at this time
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            {!isLoading && !isError && notifications.map((notification) => {
              // Define accent color based on notification type
              let accentColor = "";
              let accentBgColor = "";
              let borderColor = "";
              let statusColor = "";
              
              switch (notification.type) {
                case NotificationType.ADMIN_ALERT:
                  accentColor = "border-red-500";
                  accentBgColor = "bg-red-50";
                  borderColor = "border-red-100";
                  statusColor = "bg-red-500";
                  break;
                case NotificationType.SYSTEM_UPDATE:
                  accentColor = "border-purple-500";
                  accentBgColor = "bg-purple-50";
                  borderColor = "border-purple-100";
                  statusColor = "bg-purple-500";
                  break;
                case NotificationType.KYC_STATUS:
                  accentColor = "border-amber-500";
                  accentBgColor = "bg-amber-50";
                  borderColor = "border-amber-100";
                  statusColor = "bg-amber-500";
                  break;
                case NotificationType.INVESTMENT_MATURED:
                case NotificationType.COMMISSION_EARNED:
                case NotificationType.COMMISSION_PAID:
                  accentColor = "border-green-500";
                  accentBgColor = "bg-green-50";
                  borderColor = "border-green-100";
                  statusColor = "bg-green-500";
                  break;
                case NotificationType.WALLET_UPDATED:
                  accentColor = "border-blue-500";
                  accentBgColor = "bg-blue-50";
                  borderColor = "border-blue-100";
                  statusColor = "bg-blue-500";
                  break;
                default:
                  accentColor = "border-gray-400";
                  accentBgColor = notification.read ? "bg-white" : "bg-gray-50";
                  borderColor = "border-gray-200";
                  statusColor = "bg-gray-400";
              }
              
              return (
                <div 
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-4 border rounded-lg transition-colors relative overflow-hidden shadow-sm hover:shadow",
                    notification.read ? "border-muted bg-white opacity-90" : borderColor,
                    notification.read ? "" : accentBgColor
                  )}
                >
                  {/* Left accent border */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5 rounded-l",
                    notification.read ? "bg-gray-200" : accentColor.replace("border-", "bg-")
                  )}></div>
                  
                  {/* Status indicator */}
                  {!notification.read && (
                    <div className="absolute right-2 top-2 flex items-center">
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full animate-pulse",
                        statusColor
                      )}></div>
                    </div>
                  )}
                  
                  <div className="flex-shrink-0 ml-2">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start pr-6">
                      <h4 className={cn(
                        "text-sm",
                        notification.read ? "font-medium" : "font-semibold"
                      )}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.createdAt), "MMM dd, HH:mm")}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm mt-1",
                      notification.read ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      {notification.actionUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-medium"
                          asChild
                        >
                          <a href={notification.actionUrl}>View details</a>
                        </Button>
                      )}
                      
                      {/* Mark as read button */}
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "h-8 text-xs font-medium",
                            accentColor.replace("border-", "text-"),
                            accentColor.replace("border-", "hover:text-"),
                            notification.actionUrl ? "ml-2" : ""
                          )}
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markingAsRead.has(notification.id)}
                        >
                          {markingAsRead.has(notification.id) ? (
                            <span className="flex items-center">
                              <Skeleton className="h-3 w-3 mr-2 rounded-full animate-pulse" />
                              Marking as read...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Check className="h-3 w-3 mr-2" />
                              Mark as read
                            </span>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-1 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <div className="flex items-center text-sm px-2">
                Page {page} of {pagination.pages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
        
        <SheetFooter className="border-t pt-4">
          {unreadCount > 0 ? (
            <Button 
              className="w-full gap-2 relative overflow-hidden group" 
              variant="default"
              onClick={handleMarkAllAsRead}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 transform -translate-x-full animate-shimmer group-hover:animate-shimmer"></span>
              <Check className="h-4 w-4" />
              <span>Mark all {unreadCount} as read</span>
            </Button>
          ) : (
            <div className="w-full text-center py-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
} 