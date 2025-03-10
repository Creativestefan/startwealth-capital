import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { getUserPortfolio } from "@/lib/real-estate/actions/portfolio"
import { PortfolioDashboard } from "@/components/real-estate/portfolio/portfolio-dashboard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default async function PortfolioPage() {
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

  // Fetch portfolio data
  const response = await getUserPortfolio()

  // Handle error in fetching portfolio data
  if (!response.success || !response.data) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {response.error || "Failed to load portfolio data. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { properties, investments, totalValue, totalReturn } = response.data

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Real Estate Portfolio</h1>
        <p className="text-muted-foreground mt-2">
          Track your real estate investments and properties in one place
        </p>
      </div>
      
      <Separator />
      
      <PortfolioDashboard
        properties={properties}
        investments={investments}
        totalValue={totalValue}
        totalReturn={totalReturn}
      />
    </div>
  )
} 