import { Suspense } from "react"
import { requireAuth } from "@/lib/auth-utils"
import { ProfileTabs } from "@/components/dashboard/profile/profile-tabs"
import { Separator } from "@/components/ui/separator"
import { ProfileSkeleton } from "@/components/dashboard/profile/profile-skeleton"
import { Metadata } from "next"

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
  
  return (
    <div className="container py-8 max-w-5xl">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Complete your KYC verification
        </p>
      </div>
      <Separator className="my-6" />
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileTabs activeTab="kyc" user={session.user} />
      </Suspense>
    </div>
  )
} 