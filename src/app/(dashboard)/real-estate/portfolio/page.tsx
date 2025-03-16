import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { getUserPortfolio } from "@/lib/real-estate/actions/portfolio"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Building, TrendingUp, Clock, Calendar, Eye, PlusCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/real-estate/utils/formatting"
import { InvestmentStatusBadge } from "@/components/real-estate/shared/investment-status-badge"
import { getInvestmentSummary } from "@/components/real-estate/shared/investment-utils"
import { Progress } from "@/components/ui/progress"
import { InvestmentStatus } from "@prisma/client"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

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
  
  // Calculate portfolio statistics
  const activeInvestments = investments.filter(inv => inv.status === InvestmentStatus.ACTIVE).length
  const maturedInvestments = investments.filter(inv => inv.status === InvestmentStatus.MATURED).length
  const totalExpectedReturn = investments.reduce((sum, inv) => sum + Number(inv.expectedReturn || 0), 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Real Estate Portfolio</h1>
        <p className="text-muted-foreground">Track your real estate investments and properties</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-3 gap-4 mb-2">
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <p className="text-2xl font-bold">{investments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalExpectedReturn)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Active / Matured</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <p className="text-2xl font-bold">{activeInvestments} / {maturedInvestments}</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="investments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>
        
        <TabsContent value="investments">
          <Suspense fallback={<PortfolioLoading />}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Real Estate Investments</CardTitle>
                  <CardDescription>Track your investments in real estate projects</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  asChild
                >
                  <Link href="/real-estate/shares">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Invest More
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-sm text-muted-foreground">You haven't made any real estate investments yet.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/real-estate/shares">
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
                          const summary = getInvestmentSummary(investment);
                          const progress = calculateProgress(investment.startDate, investment.endDate, investment.status);
                          
                          return (
                            <tr key={investment.id} className="border-b">
                              <td className="p-4 align-middle font-medium">{investment.property?.name || "Investment Plan"}</td>
                              <td className="p-4 align-middle">
                                {investment.type === "SEMI_ANNUAL" ? "6 months" : "12 months"}
                              </td>
                              <td className="p-4 align-middle">{summary.amount}</td>
                              <td className="p-4 align-middle text-emerald-600 font-medium">
                                <div className="flex items-center">
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                  {summary.expectedReturn}
                                </div>
                              </td>
                              <td className="p-4 align-middle">{summary.investedOn}</td>
                              <td className="p-4 align-middle">
                                <InvestmentStatusBadge status={investment.status} />
                              </td>
                              <td className="p-4 align-middle">
                                <div className="w-full space-y-1">
                                  <Progress value={progress} className="h-2" />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{progress}%</span>
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
                                  <Link href={`/real-estate/shares/${investment.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
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
        </TabsContent>
        
        <TabsContent value="properties">
          <Suspense fallback={<PortfolioLoading />}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Properties</CardTitle>
                  <CardDescription>Properties you've purchased or invested in</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  asChild
                >
                  <Link href="/real-estate/properties">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Browse Properties
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-sm text-muted-foreground">You haven't purchased any properties yet.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/real-estate/properties">
                        Browse Available Properties
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Property</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Purchase Date</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                          <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.map((property) => (
                          <tr key={property.id} className="border-b">
                            <td className="p-4 align-middle font-medium">{property.property?.name || "Property"}</td>
                            <td className="p-4 align-middle">{property.property?.location || "N/A"}</td>
                            <td className="p-4 align-middle">{formatDate(property.createdAt)}</td>
                            <td className="p-4 align-middle">{formatCurrency(property.totalAmount)}</td>
                            <td className="p-4 align-middle">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                property.status === "COMPLETED" 
                                  ? "bg-green-100 text-green-800" 
                                  : property.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {property.status}
                              </span>
                            </td>
                            <td className="p-4 align-middle text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <Link href={`/real-estate/property/${property.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
} 