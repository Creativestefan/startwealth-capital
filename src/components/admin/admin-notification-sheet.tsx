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
  Settings,
  DollarSign,
  UserCheck,
  CreditCard,
  Wallet
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

interface AdminNotificationSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminNotificationSheet({ isOpen, onOpenChange }: AdminNotificationSheetProps) {
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery<NotificationResponse>({
    queryKey: ["admin-notifications", page],
    queryFn: async () => {
      const response = await fetch(`/api/admin/notifications?page=${page}&limit=10`)
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
      
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
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
      const response = await fetch("/api/admin/notifications/read-all", {
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
            <UserCheck className="h-5 w-5 text-amber-500" />
          </div>
        )
      case NotificationType.INVESTMENT_MATURED:
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
        )
      case NotificationType.COMMISSION_EARNED:
      case NotificationType.COMMISSION_PAID:
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100">
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
        )
      case NotificationType.WALLET_UPDATED:
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100">
            <Wallet className="h-5 w-5 text-blue-500" />
          </div>
        )
      case NotificationType.PAYMENT_DUE:
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-100">
            <CreditCard className="h-5 w-5 text-orange-500" />
          </div>
        )
      case NotificationType.PASSWORD_CHANGED:
      case NotificationType.PROFILE_UPDATED:
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
              Admin Notifications 
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
            
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading && (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {isError && (
            <div className="flex flex-col items-center justify-center h-60">
              <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-lg font-semibold">Error loading notifications</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => refetch()}
              >
                Try again
              </Button>
            </div>
          )}
          
          {!isLoading && !isError && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-60">
              <Bell className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
              <p className="text-lg font-semibold">No notifications</p>
              <p className="text-sm text-muted-foreground max-w-[250px] text-center">
                You're all caught up! New system alerts and user activity will appear here.
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
                  accentColor = "border-gray-300";
                  accentBgColor = "bg-gray-50";
                  borderColor = "border-gray-100";
                  statusColor = "bg-gray-500";
                  break;
              }
              
              return (
                <div 
                  key={notification.id} 
                  className={cn(
                    "flex gap-3 rounded-lg border p-3 relative overflow-hidden transition-all",
                    notification.read ? borderColor : `${accentColor} shadow-sm`,
                    notification.read ? accentBgColor : "bg-white"
                  )}
                >
                  {/* Left border accent for unread notifications */}
                  {!notification.read && (
                    <div className={`absolute left-0 top-0 h-full w-1 ${statusColor}`} />
                  )}
                  
                  {/* Notification icon */}
                  {getNotificationIcon(notification.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={cn(
                        "text-sm font-medium",
                        notification.read ? "text-foreground/80" : "text-foreground"
                      )}>
                        {notification.title}
                      </h4>
                      
                      {/* Time */}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    
                    {/* Message */}
                    <p className={cn(
                      "text-xs mt-1 break-words",
                      notification.read ? "text-muted-foreground" : "text-foreground/90"
                    )}>
                      {notification.message}
                    </p>
                    
                    {/* Action buttons */}
                    <div className="flex justify-between items-center mt-2">
                      {notification.actionUrl && (
                        <Button
                          variant="link"
                          className="h-auto p-0 text-xs"
                          asChild
                        >
                          <a href={notification.actionUrl} target="_blank" rel="noopener noreferrer">
                            View details
                          </a>
                        </Button>
                      )}
                      
                      {/* Mark as read button for unread notifications */}
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 ml-auto text-xs"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markingAsRead.has(notification.id)}
                        >
                          {markingAsRead.has(notification.id) ? (
                            <Skeleton className="h-3 w-3 rounded-full" />
                          ) : (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              Mark as read
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-1 mt-6">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                &lt;
              </Button>
              
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page === pagination.pages}
                onClick={() => handlePageChange(page + 1)}
              >
                &gt;
              </Button>
            </div>
          )}
        </div>
        
        <SheetFooter className="pt-2 border-t">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
} 