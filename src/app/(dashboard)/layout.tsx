import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Sonner } from "@/components/ui/sonner"
import { prisma } from "@/lib/prisma"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Check if user exists and is not banned
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, isBanned: true },
  })
  if (!user || user.isBanned) {
    redirect("/login")
  }

  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <Sonner />
    </>
  )
}

