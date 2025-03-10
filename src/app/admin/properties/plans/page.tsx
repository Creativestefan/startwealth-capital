import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PlusIcon, TrendingUpIcon, CalendarIcon, BarChart3Icon, SearchIcon } from "lucide-react"
import { getInvestmentPlans } from "@/lib/real-estate/actions/investments"
import { InvestmentPlanTable } from "@/components/admin/properties/investment-plan-table"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"

function InvestmentPlansLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 animate-pulse rounded bg-muted"></div>
        <div className="h-10 w-32 animate-pulse rounded bg-muted"></div>
      </div>
      <div className="h-96 animate-pulse rounded-lg bg-muted"></div>
    </div>
  )
}

export default async function AdminInvestmentPlansPage() {
  const { data: plans = [], success } = await getInvestmentPlans()
  
  // Calculate statistics
  const semiAnnualPlans = plans.filter(plan => plan.type === "SEMI_ANNUAL")
  const annualPlans = plans.filter(plan => plan.type === "ANNUAL")
  
  // Calculate average return rates
  const avgSemiAnnualReturn = semiAnnualPlans.length 
    ? semiAnnualPlans.reduce((sum, plan) => sum + plan.returnRate, 0) / semiAnnualPlans.length 
    : 0
  
  const avgAnnualReturn = annualPlans.length 
    ? annualPlans.reduce((sum, plan) => sum + plan.returnRate, 0) / annualPlans.length 
    : 0

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <TrendingUpIcon className="mr-2 h-6 w-6 text-primary" />
            Investment Plans
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage real estate investment plans available to users
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/properties/plans/new">
            <PlusIcon className="mr-2 h-5 w-5" />
            Create New Plan
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription>Total Plans</CardDescription>
            <CardTitle className="text-3xl">{plans.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Investment plans in your portfolio
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/30">
          <CardHeader className="pb-2">
            <CardDescription>Semi-Annual Plans</CardDescription>
            <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">
              {semiAnnualPlans.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1 text-blue-500" />
              Avg. Return: {(avgSemiAnnualReturn * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30">
          <CardHeader className="pb-2">
            <CardDescription>Annual Plans</CardDescription>
            <CardTitle className="text-3xl text-amber-600 dark:text-amber-400">
              {annualPlans.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1 text-amber-500" />
              Avg. Return: {(avgAnnualReturn * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30">
          <CardHeader className="pb-2">
            <CardDescription>Highest Return Plan</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">
              {plans.length ? (Math.max(...plans.map(p => p.returnRate)) * 100).toFixed(1) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center">
              <BarChart3Icon className="h-4 w-4 mr-1 text-green-500" />
              Best performing plan
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Investment Plans</h2>
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search plans..." 
            className="pl-9" 
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <Suspense fallback={<InvestmentPlansLoading />}>
          <InvestmentPlanTable plans={plans} />
        </Suspense>
      </div>
    </div>
  )
} 