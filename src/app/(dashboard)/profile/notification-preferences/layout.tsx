import { requireAuth } from "@/lib/auth-utils";

export default async function NotificationPreferencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <>{children}</>;
} 