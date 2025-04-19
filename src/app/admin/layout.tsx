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
    <div className="flex h-screen bg-background">
      {/* Admin sidebar - fixed on desktop */}
      <div className="fixed inset-y-0 left-0 z-30 w-64 hidden md:flex flex-col">
        <AdminSidebar />
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <DashboardHeader user={session.user} isAdmin={true} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 