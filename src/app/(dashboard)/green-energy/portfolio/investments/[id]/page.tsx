import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { getGreenEnergyInvestmentById } from "@/lib/green-energy/actions/investments"
import { formatCurrency, formatDate } from "@/lib/green-energy/utils/formatting"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Leaf, TrendingUp, Calendar, Clock, ArrowRight, CheckCircle2 } from "lucide-react"
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

export default async function InvestmentDetailPage({ params }: InvestmentDetailPageProps) {
  // Await the params object before accessing its properties
  const { id } = await params;
  
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
  const result = await getGreenEnergyInvestmentById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  const investment = result.data
  
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
          <Link href="/green-energy/portfolio">
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
              <Leaf className="mr-2 h-5 w-5 text-primary" />
              {investment.plan?.name || "Investment Plan"}
            </CardTitle>
            <CardDescription>{investment.plan?.description || "Green energy investment"}</CardDescription>
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
                {investment.status === InvestmentStatus.MATURED && investment.actualReturn && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Actual Return</span>
                    <span className="text-sm font-medium text-emerald-600">{formatCurrency(investment.actualReturn)}</span>
                  </div>
                )}
                {investment.status === InvestmentStatus.MATURED && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Returned</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {formatCurrency(Number(investment.amount) + Number(investment.actualReturn || investment.expectedReturn))}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
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
                    Your investment is actively generating returns. You'll receive {formatCurrency(investment.expectedReturn)} at maturity.
                  </p>
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/green-energy/shares">
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