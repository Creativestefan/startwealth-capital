import { Suspense } from "react"
import { Metadata } from "next"
import { requireAdmin } from "@/lib/auth-utils"
import { KycReviewList } from "@/components/admin/kyc-review-list"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "KYC Review | Admin Dashboard",
  description: "Review and manage KYC verification submissions",
}

export default async function AdminKycPage() {
  // Require admin authentication for this page
  await requireAdmin()

  return (
    <div className="container py-8 max-w-7xl">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">KYC Verification Review</h2>
        <p className="text-muted-foreground">
          Review and approve or reject user KYC verification submissions
        </p>
      </div>
      <Separator className="my-6" />
      <Suspense fallback={<div>Loading KYC submissions...</div>}>
        <KycReviewList />
      </Suspense>
    </div>
  )
}
