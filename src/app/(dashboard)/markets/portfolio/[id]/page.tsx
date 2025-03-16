import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { getMarketInvestmentById } from "@/lib/market/actions/investments"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, LineChart, TrendingUp, Calendar, Clock, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { InvestmentStatus } from "@prisma/client"
import { Progress } from "@/components/ui/progress"

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

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

export default async function InvestmentDetailPage({ params }: InvestmentDetailPageProps) {
  const { id } = params;
  
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

  // Get investment details
  const result = await getMarketInvestmentById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  const investment = result.data
  
  // Calculate progress
  const progress = calculateProgress(
    typeof investment.startDate === 'string' ? investment.startDate : investment.startDate.toISOString(),
    investment.endDate ? (typeof investment.endDate === 'string' ? investment.endDate : investment.endDate.toISOString()) : undefined,
    investment.status
  )
  
  // Calculate days remaining
  const daysRemaining = investment.endDate 
    ? Math.max(0, Math.ceil((new Date(typeof investment.endDate === 'string' ? investment.endDate : investment.endDate.toISOString()).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
  
  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/markets/portfolio">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to My Investments
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Investment Summary */}
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="mr-2 h-5 w-5 text-primary" />
                {investment.plan?.name || "Market Investment Plan"}
              </CardTitle>
              <CardDescription>{investment.plan?.description || "Market investment"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 shadow-none">
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm font-medium">Invested Amount</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-2xl font-bold">{formatCurrency(investment.amount)}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-none">
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm font-medium">Expected Return</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(investment.expectedReturn)}</p>
                  </CardContent>
                </Card>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Investment Status</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    investment.status === InvestmentStatus.ACTIVE 
                      ? "bg-emerald-100 text-emerald-800" 
                      : investment.status === InvestmentStatus.MATURED
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {investment.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {investment.plan?.type === "SEMI_ANNUAL" ? "6 months contract" : "12 months contract"}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatDate(investment.startDate)}</span>
                    <span>{investment.endDate ? formatDate(investment.endDate) : "N/A"}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Start Date</div>
                    <div className="text-sm text-muted-foreground">{formatDate(investment.startDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">
                      {investment.status === InvestmentStatus.MATURED ? "Matured On" : "Maturity Date"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {investment.endDate ? formatDate(investment.endDate) : "Not set"}
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
          <Card className="shadow-sm hover:shadow transition-shadow">
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
                    {investment.plan?.type === "SEMI_ANNUAL" ? "Semi-Annual (6 months)" : "Annual (12 months)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created On</span>
                  <span className="text-sm font-medium">{formatDate(investment.createdAt)}</span>
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
                    <span className="text-sm font-medium">{formatCurrency(investment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Return Rate</span>
                    <span className="text-sm font-medium">
                      {investment.plan?.returnRate ? `${investment.plan.returnRate}%` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Duration</span>
                    <span className="text-sm font-medium">
                      {investment.plan?.durationMonths ? `${investment.plan.durationMonths} months` : "N/A"}
                    </span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Expected Return</span>
                    <span className="text-sm font-medium text-emerald-600">{formatCurrency(investment.expectedReturn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total at Maturity</span>
                    <span className="text-sm font-medium">{formatCurrency(investment.amount + investment.expectedReturn)}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {investment.status === InvestmentStatus.MATURED ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Investment Matured</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        This investment has reached maturity. The principal amount and returns have been credited to your wallet.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-emerald-800">Active Investment</h3>
                      <p className="text-sm text-emerald-700 mt-1">
                        Your investment is active and generating returns. You will be notified when it reaches maturity.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {investment.status === InvestmentStatus.MATURED && (
                <Button className="w-full" asChild>
                  <Link href="/markets/shares">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Invest Again
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 