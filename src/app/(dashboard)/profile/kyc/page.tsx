import { Suspense } from "react"
import { requireAuth } from "@/lib/auth-utils"
import { Separator } from "@/components/ui/separator"
import { Metadata } from "next"
import { KycForm } from "@/components/dashboard/profile/kyc-form"
import { prisma } from "@/lib/prisma"
import { BackButton } from "@/components/ui/back-button"

export const metadata: Metadata = {
  title: "KYC Verification | StartWealth Capital",
  description: "Complete your KYC verification",
}

export default async function KycPage({
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
          <h2 className="text-2xl font-bold tracking-tight">KYC Verification</h2>
          <p className="text-muted-foreground">
            Complete your identity verification
          </p>
        </div>
        <BackButton />
      </div>
      <Separator className="my-6" />
      <Suspense>
        <KycForm user={user} />
      </Suspense>
    </div>
  )
} 