import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { getAllGreenEnergyPlans } from "@/lib/green-energy/actions/investments"
import { GreenEnergyInvestmentPlanCard } from "@/components/green-energy/investments/investment-plan-card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { WhyInvestSection } from "@/components/green-energy/why-invest-section"

/**
 * Loading component for the shares page
 */
function SharesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Separator />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[350px] rounded-lg" />
          ))}
      </div>
    </div>
  )
}

/**
 * Green Energy Shares page
 * Displays available investment plans for green energy
 */
export default async function SharesPage({
  searchParams,
}: {
  searchParams: { page?: string; type?: string }
}) {
  const session = await getServerSession(authConfig)

  if (!session || !session.user) {
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

  // Await searchParams before accessing its properties
  const searchParamsData = await searchParams

  // Parse pagination params
  const page = searchParamsData.page ? parseInt(searchParamsData.page) : 1
  const pageSize = 6
  const skip = (page - 1) * pageSize

  const plansResponse = await getAllGreenEnergyPlans({
    take: pageSize,
    skip,
    filter: searchParamsData.type ? { type: searchParamsData.type as any } : undefined
  })

  if (!plansResponse.success || !plansResponse.data) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {plansResponse.error || "Failed to load investment plans. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const plans = plansResponse.data

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Green Energy Investment Plans</h1>
        <p className="text-muted-foreground">Invest in sustainable energy and earn competitive returns</p>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Investment Plans</h2>
        <Suspense fallback={<SharesLoading />}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.length > 0 ? (
              plans.map((plan) => (
                <GreenEnergyInvestmentPlanCard key={plan.id} plan={plan} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No investment plans available at the moment.</p>
                <p className="text-sm text-muted-foreground mt-1">Please check back later for new opportunities.</p>
              </div>
            )}
          </div>
        </Suspense>
      </div>
      
      {/* Why Invest Section - Moved to a client component */}
      <WhyInvestSection />
    </div>
  )
} 