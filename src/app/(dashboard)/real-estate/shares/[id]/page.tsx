export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { getUserInvestmentById } from "@/lib/real-estate/actions/investments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InvestmentStatusBadge } from "@/components/real-estate/shared/investment-status-badge"
import { getInvestmentSummary } from "@/components/real-estate/shared/investment-utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Building, TrendingUp, Calendar, Clock, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { InvestmentStatus } from "@prisma/client"

interface InvestmentDetailPageProps {
  params: {
    id: string
  }
}

/**
 * Calculates the progress of an investment based on start and end dates
 */
function calculateProgress(startDate: string, endDate: string | null | undefined, status: InvestmentStatus): number {
  if (status === InvestmentStatus.MATURED) {
    return 100
  }
  
  if (!endDate) {
    return 0
  }
  
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = Date.now()
  
  if (now >= end) {
    return 100
  }
  
  if (now <= start) {
    return 0
  }
  
  const total = end - start
  const elapsed = now - start
  return Math.round((elapsed / total) * 100)
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
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
      </div>
    )
  }

  const summary = getInvestmentSummary(investment)
  
  // Calculate progress
  const progress = calculateProgress(investment.startDate, investment.endDate, investment.status)
  
  // Calculate days remaining
  const daysRemaining = investment.endDate 
    ? Math.max(0, Math.ceil((new Date(investment.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/real-estate/portfolio">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to My Investments
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Investment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5 text-primary" />
              {investment.property?.name || "Investment Plan"}
            </CardTitle>
            <CardDescription>{investment.property?.description || "Real estate investment"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">Invested Amount</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-2xl font-bold">{summary.amount}</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-none">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">Expected Return</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-2xl font-bold text-emerald-600">{summary.expectedReturn}</p>
                </CardContent>
              </Card>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Investment Status</h3>
              <div className="flex items-center gap-2 mb-3">
                <InvestmentStatusBadge status={investment.status} />
                <span className="text-sm text-muted-foreground">
                  {investment.type === "SEMI_ANNUAL" ? "6 months contract" : "12 months contract"}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{summary.investedOn}</span>
                  <span>{summary.endDate}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Start Date</div>
                  <div className="text-sm text-muted-foreground">{summary.investedOn}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">
                    {investment.status === InvestmentStatus.MATURED ? "Matured On" : "Maturity Date"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {summary.endDate}
                  </div>
                </div>
              </div>
              
              {investment.status === InvestmentStatus.ACTIVE && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Time Remaining</div>
                    <div className="text-sm text-muted-foreground">
                      {daysRemaining > 0 ? `${daysRemaining} days` : "Maturity pending"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Investment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Investment ID</span>
                <span className="text-sm font-medium">{investment.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Investment Type</span>
                <span className="text-sm font-medium">
                  {investment.type === "SEMI_ANNUAL" ? "Semi-Annual (6 months)" : "Annual (12 months)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created On</span>
                <span className="text-sm font-medium">{summary.investedOn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Auto-Reinvest</span>
                <span className="text-sm font-medium">{investment.reinvest ? "Yes" : "No"}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Return Calculation</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Principal Amount</span>
                  <span className="text-sm font-medium">{summary.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Return Rate</span>
                  <span className="text-sm font-medium">
                    {investment.returnRate ? `${investment.returnRate}%` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Duration</span>
                  <span className="text-sm font-medium">
                    {investment.type === "SEMI_ANNUAL" ? "6 months" : "12 months"}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Expected Return</span>
                  <span className="text-sm font-medium text-emerald-600">{summary.expectedReturn}</span>
                </div>
                {investment.status === InvestmentStatus.MATURED && investment.actualReturn && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Actual Return</span>
                    <span className="text-sm font-medium text-emerald-600">{summary.actualReturn}</span>
                  </div>
                )}
                {investment.status === InvestmentStatus.MATURED && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Returned</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {investment.amount && investment.actualReturn 
                        ? `$${(Number(investment.amount) + Number(investment.actualReturn)).toLocaleString()}`
                        : summary.expectedReturn}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {investment.property && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Property Information</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Property Name</span>
                    <span className="text-sm font-medium">{investment.property.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Location</span>
                    <span className="text-sm font-medium">{investment.property.location}</span>
                  </div>
                  {investment.property.type && (
                    <div className="flex justify-between">
                      <span className="text-sm">Property Type</span>
                      <span className="text-sm font-medium">{investment.property.type}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {investment.status === InvestmentStatus.MATURED ? (
              <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Investment Matured</h4>
                  <p className="text-xs text-blue-600">
                    This investment has matured and returns have been processed.
                    {investment.reinvest 
                      ? " Funds have been reinvested automatically." 
                      : " Funds have been returned to your wallet."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 p-4 rounded-lg flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-medium text-emerald-800">Investment Active</h4>
                  <p className="text-xs text-emerald-600">
                    Your investment is actively generating returns. You'll receive {summary.expectedReturn} at maturity.
                  </p>
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/real-estate/shares">
                  Invest More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 