import { requireAuth } from "@/lib/auth-utils";
import NotificationPreferencesForm from "./notification-preferences-form";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Notification Preferences | StartWealth Capital",
  description: "Manage your notification preferences",
};

export default async function NotificationPreferencesPage() {
  // Verify user is authenticated
  const session = await requireAuth();
  
  // Get full user data needed for the form
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      role: true
    }
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return (
    <div className="container">
      <div className="mx-auto my-6 max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground">
            Manage how and when you receive notifications from StartWealth Capital
          </p>
        </div>
        
        <NotificationPreferencesForm user={user} />
      </div>
    </div>
  );
} 