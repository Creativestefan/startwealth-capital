import { Suspense } from "react"
import { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { CommissionManagement } from "@/components/admin/commissions/commission-management"

export const metadata: Metadata = {
  title: "Referral Commissions | Admin Dashboard",
  description: "Manage referral commissions for users",
}

export default async function CommissionsPage() {
  return (
    <div className="container py-8 max-w-7xl">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Referral Commissions</h2>
        <p className="text-muted-foreground">
          Manage and process referral commission payouts
        </p>
      </div>
      <Separator className="my-6" />
      <Suspense fallback={<div>Loading commissions data...</div>}>
        <CommissionManagement />
      </Suspense>
    </div>
  )
} 