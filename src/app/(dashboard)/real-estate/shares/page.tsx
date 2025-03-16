import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getInvestmentPlans } from "@/lib/real-estate/actions/investments"
import { InvestmentPlanCard } from "@/components/real-estate/investments/investment-plan-card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RealEstateInvestmentType } from "@prisma/client"

// Loading component for the Shares page
function SharesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// Main Shares page component
export default async function SharesPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect("/login")
  }

  // Ensure email is verified
  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${session.user.email}`)
  }

  // Check KYC status
  if (!session.user.kycStatus || session.user.kycStatus === "PENDING") {
    redirect("/dashboard?kyc=required")
  }

  // Fetch investment plans
  const response = await getInvestmentPlans()
  
  // Handle error in fetching plans
  if (!response.success) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {response.error || "Failed to load investment plans. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Use default plans if no plans are returned
  const plans = (response.data && response.data.length > 0) 
    ? response.data 
    : [
        {
          id: "semi-annual",
          name: "Semi-Annual Plan",
          description: "6-month investment with 15% return",
          type: "SEMI_ANNUAL" as RealEstateInvestmentType,
          minAmount: 300000,
          maxAmount: 700000,
          durationMonths: 6,
          returnRate: 0.15,
        },
        {
          id: "annual",
          name: "Annual Plan",
          description: "12-month investment with 30% return",
          type: "ANNUAL" as RealEstateInvestmentType,
          minAmount: 1500000,
          maxAmount: 2000000,
          durationMonths: 12,
          returnRate: 0.3,
        },
      ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Real Estate Shares</h1>
        <p className="text-muted-foreground mt-2">
          Invest in our real estate shares and earn returns on your investment. Choose from our available investment plans below.
        </p>
      </div>
      
      <Separator />
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Investment Plans</h2>
        <Suspense fallback={<SharesLoading />}>
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <InvestmentPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </Suspense>
      </div>
      
      {/* Information Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Why Invest in Real Estate?</CardTitle>
          <CardDescription>
            Secure investments for long-term wealth building
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold">Stable Returns</h3>
              <p className="text-sm text-muted-foreground">
                Real estate investments historically provide stable and predictable returns, offering a reliable income stream and protection against market volatility.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Appreciation Potential</h3>
              <p className="text-sm text-muted-foreground">
                Our carefully selected properties are located in high-growth areas, providing excellent potential for capital appreciation over time.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Portfolio Diversification</h3>
              <p className="text-sm text-muted-foreground">
                Adding real estate to your investment portfolio provides diversification benefits, reducing overall risk and enhancing long-term financial security.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

