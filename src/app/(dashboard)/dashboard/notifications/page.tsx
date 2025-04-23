import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Notifications | StartWealth Capital",
  description: "View your notifications and alerts",
};

export default async function NotificationsPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  // Fetch user's notifications
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Filter read/unread notifications
  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const readNotifications = notifications.filter((notification) => notification.read);

  // Get notification type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "INVESTMENT_MATURED":
        return "bg-green-500";
      case "PAYMENT_DUE":
        return "bg-yellow-500";
      case "WALLET_UPDATED":
        return "bg-blue-500";
      case "KYC_STATUS":
        return "bg-purple-500";
      case "SYSTEM_UPDATE":
        return "bg-slate-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get notification type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "INVESTMENT_MATURED":
        return "Investment";
      case "PAYMENT_DUE":
        return "Payment";
      case "WALLET_UPDATED":
        return "Wallet";
      case "KYC_STATUS":
        return "KYC";
      case "SYSTEM_UPDATE":
        return "System";
      case "REFERRAL_COMPLETED":
        return "Referral";
      case "COMMISSION_EARNED":
      case "COMMISSION_PAID":
        return "Commission";
      case "PASSWORD_CHANGED":
      case "PROFILE_UPDATED":
        return "Security";
      default:
        return type.replace(/_/g, " ").toLowerCase();
    }
  };

  return (
    <div className="container mt-4">
      <div className="my-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          
          <div className="flex gap-2">
            <Link href="/profile/notification-preferences">
              <Button variant="outline" size="sm">
                Notification Settings
              </Button>
            </Link>
            {unreadNotifications.length > 0 && (
              <form action="/api/notifications/read-all" method="POST">
                <Button type="submit" variant="outline" size="sm">
                  Mark All as Read
                </Button>
              </form>
            )}
          </div>
        </div>

        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="unread">
              Unread {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
            </TabsTrigger>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="read">Read ({readNotifications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="unread">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No unread notifications
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {unreadNotifications.map((notification) => (
                  <Card key={notification.id} className="relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getTypeColor(notification.type)}>
                              {getTypeLabel(notification.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                        <div className="flex gap-2 items-start">
                          {notification.actionUrl && (
                            <Link href={notification.actionUrl}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          )}
                          <form action={`/api/notifications/${notification.id}/read`} method="POST">
                            <Button type="submit" variant="ghost" size="sm">
                              Mark Read
                            </Button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No notifications yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={`relative overflow-hidden ${!notification.read ? "bg-gray-50" : ""}`}>
                    {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getTypeColor(notification.type)}>
                              {getTypeLabel(notification.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                        <div className="flex gap-2 items-start">
                          {notification.actionUrl && (
                            <Link href={notification.actionUrl}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          )}
                          {!notification.read && (
                            <form action={`/api/notifications/${notification.id}/read`} method="POST">
                              <Button type="submit" variant="ghost" size="sm">
                                Mark Read
                              </Button>
                            </form>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="read">
            {readNotifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No read notifications
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {readNotifications.map((notification) => (
                  <Card key={notification.id} className="relative overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getTypeColor(notification.type)}>
                              {getTypeLabel(notification.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                        {notification.actionUrl && (
                          <Link href={notification.actionUrl}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 