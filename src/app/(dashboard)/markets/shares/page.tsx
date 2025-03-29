export const dynamic = 'force-dynamic';
import { Metadata } from "next"
import { Suspense } from "react"
import { getAllMarketPlans } from "@/lib/market/actions/plans"
import { InvestmentPlanCard } from "@/components/markets/investments/investment-plan-card"
import { Separator } from "@/components/ui/separator"
import { MarketPlanType } from "@prisma/client"
import { WhyInvestSection } from "@/components/markets/why-invest-section"

export const metadata: Metadata = {
  title: "Market Investment Plans",
  description: "Invest in our market investment plans",
}

function PlansLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded bg-muted"></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-96 animate-pulse rounded-lg bg-muted"></div>
        <div className="h-96 animate-pulse rounded-lg bg-muted"></div>
        <div className="h-96 animate-pulse rounded-lg bg-muted"></div>
      </div>
    </div>
  )
}

export default async function MarketSharesPage() {
  // Fetch all market plans
  const plansResult = await getAllMarketPlans()
  const plans = plansResult.success && plansResult.data ? plansResult.data : []

  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Market Investment Plans</h1>
          <p className="text-muted-foreground mt-2">
            Choose from our range of market investment plans and start earning returns
          </p>
        </div>
        
        <Separator />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<PlansLoading />}>
            {plans.map((plan) => (
              <InvestmentPlanCard key={plan.id} plan={plan} />
            ))}
          </Suspense>
        </div>
        
        {/* Why Invest Section */}
        <WhyInvestSection />
      </div>
    </div>
  )
} 