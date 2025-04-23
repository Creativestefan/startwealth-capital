import { Suspense } from "react"
import { requireAuth } from "@/lib/auth-utils"
import { Separator } from "@/components/ui/separator"
import { Metadata } from "next"
import { ReferralForm } from "@/components/dashboard/profile/referral-form"
import { prisma } from "@/lib/prisma"
import { BackButton } from "@/components/ui/back-button"

export const metadata: Metadata = {
  title: "Referral Program | StartWealth Capital",
  description: "Invite friends and earn commissions",
}

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams?: Promise<any>
}) {
  // Require authentication for this page
  const session = await requireAuth()
  
  // Fetch the latest user data from the database
  const latestUserData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      kyc: true,
    },
  })

  // Use the latest user data
  const user = {
    ...session.user,
    kycStatus: latestUserData?.kyc?.status || undefined
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Referral Program</h2>
          <p className="text-muted-foreground">
            Invite friends and earn commission on their investments
          </p>
        </div>
        <BackButton />
      </div>
      <Separator className="my-6" />
      <Suspense>
        <ReferralForm user={user} />
      </Suspense>
    </div>
  )
} 