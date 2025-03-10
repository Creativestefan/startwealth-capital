import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { getUserInvestmentById } from "@/lib/real-estate/actions/investments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InvestmentStatusBadge } from "@/components/real-estate/shared/investment-status-badge"
import { getInvestmentSummary } from "@/components/real-estate/shared/investment-utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

interface InvestmentDetailPageProps {
  params: {
    id: string
  }
}

export default async function InvestmentDetailPage(props: InvestmentDetailPageProps) {
  // Await the params object before accessing its properties
  const params = await Promise.resolve(props.params);
  const investmentId = params.id;
  
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

  const { data: investment, success, error } = await getUserInvestmentById(investmentId)

  if (!success || !investment) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Investment Not Found</h1>
        <p className="text-muted-foreground">
          {error || "The investment you are looking for could not be found."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/real-estate/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
      </div>
    )
  }

  const summary = getInvestmentSummary(investment)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Investment Details</h1>
        <Button asChild variant="outline">
          <Link href="/real-estate/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Investment Summary</CardTitle>
            <CardDescription>Details about your investment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{summary.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <InvestmentStatusBadge status={investment.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">{summary.amount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Return</p>
                <p className="font-medium">{summary.expectedReturn}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{summary.investedOn}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{summary.endDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {investment.property && (
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>Information about the property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property Name</p>
                  <p className="font-medium">{investment.property?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{investment.property?.location || "N/A"}</p>
                </div>
                {/* <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-medium">{investment.property?.type || "N/A"}</p>
                </div> */}
                {/* <div>
                  <p className="text-sm text-muted-foreground">Property Value</p>
                  <p className="font-medium">
                    {investment.property?.value 
                      ? `$${investment.property.value.toLocaleString()}` 
                      : "N/A"}
                  </p>
                </div> */}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 