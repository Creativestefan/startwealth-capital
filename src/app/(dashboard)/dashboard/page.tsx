import { auth } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return <DashboardContent kycStatus={session.user.kycStatus} />
}

