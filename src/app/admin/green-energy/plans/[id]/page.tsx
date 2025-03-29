export const dynamic = 'force-dynamic';
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getGreenEnergyPlanById, getAllGreenEnergyInvestments } from "@/lib/green-energy/actions/investments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Pencil, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { 
  formatCurrency, 
  formatDate, 
  formatInvestmentType,
  formatInvestmentDuration,
  formatReturnRate
} from "@/lib/green-energy/utils/formatting"

export const metadata: Metadata = {
  title: "Investment Plan Details",
  description: "View green energy investment plan details",
}

interface PlanDetailsPageProps {
  params: {
    id: string
  }
}

export default async function PlanDetailsPage({ params }: PlanDetailsPageProps) {
  // Await the params object before accessing its properties
  const { id } = await params;
  
  const result = await getGreenEnergyPlanById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  const plan = result.data
  
  // Get all investments for this plan
  const investmentsResult = await getAllGreenEnergyInvestments()
  const planInvestments = investmentsResult.success && investmentsResult.data
    ? investmentsResult.data.filter(inv => inv.planId === plan.id)
    : []
  
  // Calculate total invested amount
  const totalInvested = planInvestments.reduce((sum, inv) => sum + inv.amount, 0)
  
  // Count active investments
  const activeInvestments = planInvestments.filter(inv => inv.status === "ACTIVE").length
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/green-energy/plans">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/admin/green-energy/plans/${plan.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Plan
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan Image */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Image</CardTitle>
          </CardHeader>
          <CardContent>
            {plan.image ? (
              <div className="relative aspect-video overflow-hidden rounded-md">
                {/* eslint-disable @next/next/no-img-element */}
<img
                  src={plan.image}
                  alt={plan.name}
                  className="object-cover"
                  width={600}
                  height={400}
                />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">No image available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Plan Details */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>Basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="text-lg font-semibold">{plan.name}</p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <p>{formatInvestmentType(plan.type)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                  <p>{formatInvestmentDuration(plan.durationMonths)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Return Rate</h3>
                  <p>{formatReturnRate(plan.returnRate)}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Min Amount</h3>
                  <p>{formatCurrency(plan.minAmount)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Max Amount</h3>
                  <p>{formatCurrency(plan.maxAmount)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p>{formatDate(plan.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Investment Statistics</CardTitle>
              <CardDescription>Current investment data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Investments</h3>
                  <p className="text-lg font-semibold">{planInvestments.length}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Active Investments</h3>
                  <p className="text-lg font-semibold">{activeInvestments}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Invested</h3>
                  <p className="text-lg font-semibold">{formatCurrency(totalInvested)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Expected Returns</h3>
                  <p className="text-lg font-semibold">{formatCurrency(totalInvested * (plan.returnRate / 100))}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/green-energy/transactions">
                    <Users className="mr-2 h-4 w-4" />
                    View All Investments
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{plan.description}</p>
        </CardContent>
      </Card>
    </div>
  )
} 