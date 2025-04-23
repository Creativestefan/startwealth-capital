export const dynamic = 'force-dynamic';
import { Suspense } from "react"
import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AdminDashboardContent } from "@/components/admin/dashboard/admin-dashboard-content"
import { DashboardSkeleton } from "@/components/admin/dashboard/dashboard-skeleton"

export const metadata: Metadata = {
  title: "Admin Dashboard - StartWealth Capital",
  description: "Administrative dashboard for StartWealth Capital platform management",
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect("/login")
  }

  // Ensure user is admin
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <div className="container mx-auto py-8 flex-1 flex flex-col space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor platform metrics and user activity in real time
          </p>
        </div>
        <Suspense fallback={<DashboardSkeleton />}>
          <AdminDashboardContent />
        </Suspense>
      </div>
    </div>
  )
} 