import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserMarketInvestments } from "@/lib/market/actions/investments"
import { formatCurrency } from "@/lib/utils"
import { InvestmentStatus } from "@prisma/client"
import { LineChart, TrendingUp, Clock, Calendar, PlusCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/**
 * Loading component for the portfolio page
 */
function PortfolioLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[60px] w-full max-w-md rounded-lg" />
      <div className="grid gap-6">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[150px] rounded-lg" />
          ))}
      </div>
    </div>
  )
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
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Markets Portfolio page
 * Displays the user's market investments
 */
export default async function PortfolioPage() {
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

  const investmentsResponse = await getUserMarketInvestments()

  if (!investmentsResponse.success || !investmentsResponse.data) {
    throw new Error(investmentsResponse.error || "Failed to fetch investments")
  }

  const investments = investmentsResponse.data

  // Calculate portfolio statistics
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalExpectedReturn = investments.reduce((sum, inv) => sum + inv.expectedReturn, 0)
  const activeInvestments = investments.filter(inv => inv.status === InvestmentStatus.ACTIVE).length
  const maturedInvestments = investments.filter(inv => inv.status === InvestmentStatus.MATURED).length

  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Market Portfolio</h1>
          <p className="text-muted-foreground">Track your market investments and returns</p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{investments.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Total value: {formatCurrency(totalInvested)}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalExpectedReturn)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Across all investments
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Active / Matured</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{activeInvestments} / {maturedInvestments}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Investment status
              </p>
            </CardContent>
          </Card>
        </div>

        <Suspense fallback={<PortfolioLoading />}>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Market Investments</CardTitle>
                <CardDescription>Track your investments in market plans</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                asChild
              >
                <Link href="/markets/shares">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Invest More
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-muted-foreground">You haven't made any market investments yet.</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/markets/shares">
                      Browse Investment Opportunities
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Plan</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Expected Return</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Start Date</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Progress</th>
                        <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((investment) => {
                        const progress = calculateProgress(
                          typeof investment.startDate === 'string' ? investment.startDate : investment.startDate.toISOString(),
                          investment.endDate ? (typeof investment.endDate === 'string' ? investment.endDate : investment.endDate.toISOString()) : undefined,
                          investment.status
                        );
                        
                        return (
                          <tr key={investment.id} className="border-b">
                            <td className="p-4 align-middle font-medium">{investment.plan?.name || "Investment Plan"}</td>
                            <td className="p-4 align-middle">
                              {investment.plan?.type === "SEMI_ANNUAL" ? "6 months" : "12 months"}
                            </td>
                            <td className="p-4 align-middle">{formatCurrency(investment.amount)}</td>
                            <td className="p-4 align-middle text-emerald-600 font-medium">
                              <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                {formatCurrency(investment.expectedReturn)}
                              </div>
                            </td>
                            <td className="p-4 align-middle">{formatDate(investment.startDate)}</td>
                            <td className="p-4 align-middle">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                investment.status === InvestmentStatus.ACTIVE 
                                  ? "bg-emerald-100 text-emerald-800" 
                                  : investment.status === InvestmentStatus.MATURED
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                {investment.status}
                              </span>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="w-full space-y-1">
                                <Progress value={progress} className="h-2" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{progress}%</span>
// eslint-disable-next-line react/no-unescaped-entities
                                  <span>
                                    {investment.endDate ? formatDate(investment.endDate) : "In progress"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 align-middle text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <Link href={`/markets/portfolio/${investment.id}`}>
                                  <Clock className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </div>
  )
} 