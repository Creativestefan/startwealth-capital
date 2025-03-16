import { Suspense } from "react"
import { Metadata } from "next"
import { getAllGreenEnergyPlans } from "@/lib/green-energy/actions/investments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3Icon, CalendarIcon, LeafIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { PlanCard } from "@/components/admin/green-energy/plan-card"
import { SerializedGreenEnergyPlan } from "@/lib/green-energy/types"

export const metadata: Metadata = {
  title: "Green Energy Investment Plans",
  description: "Manage green energy investment plans",
}

function PlansLoading() {
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

export default async function AdminGreenEnergyPlansPage() {
  const { data: plans = [], success } = await getAllGreenEnergyPlans()
  
  // Calculate statistics
  const totalPlans = plans.length
  
  // Filter plans by type
  const semiAnnualPlans = plans.filter((plan: SerializedGreenEnergyPlan) => plan.type === "SEMI_ANNUAL")
  const annualPlans = plans.filter((plan: SerializedGreenEnergyPlan) => plan.type === "ANNUAL")
  
  // Calculate average return rates
  const avgSemiAnnualReturn = semiAnnualPlans.length 
    ? semiAnnualPlans.reduce((sum: number, plan: SerializedGreenEnergyPlan) => sum + plan.returnRate, 0) / semiAnnualPlans.length 
    : 0
  
  const avgAnnualReturn = annualPlans.length 
    ? annualPlans.reduce((sum: number, plan: SerializedGreenEnergyPlan) => sum + plan.returnRate, 0) / annualPlans.length 
    : 0
  
  // Find highest return plan
  const highestReturnRate = plans.length > 0 
    ? Math.max(...plans.map((p: SerializedGreenEnergyPlan) => p.returnRate))
    : 0
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <LeafIcon className="mr-2 h-6 w-6 text-green-500" />
            Green Energy Plans
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage green energy investment plans available to users
          </p>
        </div>
        
        <Button asChild size="lg">
          <Link href="/admin/green-energy/plans/new">
            <PlusIcon className="mr-2 h-5 w-5" />
            Create New Plan
          </Link>
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30">
          <CardHeader className="pb-2">
            <CardDescription>Total Plans</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">{totalPlans}</CardTitle>
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
        
        <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/30">
          <CardHeader className="pb-2">
            <CardDescription>Highest Return Plan</CardDescription>
            <CardTitle className="text-3xl text-emerald-600 dark:text-emerald-400">
              {(highestReturnRate * 100).toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center">
              <BarChart3Icon className="h-4 w-4 mr-1 text-emerald-500" />
              Best performing plan
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Investment Plans</h2>
      </div>
      
      {/* Plans Table */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan: SerializedGreenEnergyPlan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            onUpdate={async () => {
              'use server'
              // This will trigger a server-side revalidation
              const result = await getAllGreenEnergyPlans()
              return result.data || []
            }} 
          />
        ))}

        {plans.length === 0 && (
          <div className="col-span-full flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed">
            <h3 className="text-lg font-medium">No plans found</h3>
            <p className="text-sm text-muted-foreground">
              Create a new plan to get started.
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin/green-energy/plans/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Plan
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 