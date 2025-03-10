import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin")
  }

  // Ensure user is admin
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Admin sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <AdminSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={session.user} isAdmin={true} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 