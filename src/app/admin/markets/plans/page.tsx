export const dynamic = 'force-dynamic';
import { Metadata } from "next"
import { getMarketPlans } from "@/lib/market/actions/plans"
import { PlansList } from "@/components/admin/markets/plans-list"

export const metadata: Metadata = {
  title: "Market Plans",
  description: "Manage market investment plans",
}

export default async function MarketPlansPage() {
  const plansData = await getMarketPlans()
  
  // Convert Decimal values to numbers
  const plans = plansData.map(plan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    minAmount: Number(plan.minAmount),
    maxAmount: Number(plan.maxAmount),
    returnRate: Number(plan.returnRate),
    durationMonths: plan.durationMonths,
  }))
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <div className="container mx-auto py-8 flex-1 flex flex-col space-y-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Market Investment Plans</h1>
          <p className="text-muted-foreground">
            Create and manage market investment plans for users.
          </p>
        </div>
        <PlansList initialPlans={plans} />
      </div>
    </div>
  )
} 