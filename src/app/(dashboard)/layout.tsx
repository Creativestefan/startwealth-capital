import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Sonner } from "@/components/ui/sonner"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)

  if (!session || !session.user) {
    redirect("/login")
  }

  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <Sonner />
    </>
  )
}

