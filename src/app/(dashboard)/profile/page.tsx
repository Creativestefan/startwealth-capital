import { Suspense } from "react"
import { requireAuth } from "@/lib/auth-utils"
import { ProfileTabs } from "@/components/dashboard/profile/profile-tabs"
import { Separator } from "@/components/ui/separator"
import { ProfileSkeleton } from "@/components/dashboard/profile/profile-skeleton"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | StartWealth Capital",
  description: "Manage your profile and account settings",
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  // Require authentication for this page
  const session = await requireAuth()
  const params = await searchParams
  const activeTab = params?.tab || "account"

  return (
    <div className="container py-8 max-w-5xl">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your account settings and KYC verification
        </p>
      </div>
      <Separator className="my-6" />
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileTabs activeTab={activeTab} user={session.user} />
      </Suspense>
    </div>
  )
} 