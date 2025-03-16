import { notFound, redirect } from "next/navigation"
import { getGreenEnergyInvestmentById, cancelGreenEnergyInvestment } from "@/lib/green-energy/actions/investments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { formatDate } from "@/lib/real-estate/utils/formatting"
import Link from "next/link"
import { InvestmentStatus } from "@prisma/client"

interface CancelRefundPageProps {
  params: {
    id: string
  }
}

export default async function CancelRefundPage({ params }: CancelRefundPageProps) {
  const { id } = await params
  
  // Get investment details
  const result = await getGreenEnergyInvestmentById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  const investment = result.data
  
  // Only allow cancelling if investment is active
  if (investment.status !== InvestmentStatus.ACTIVE) {
    redirect(`/admin/green-energy/transactions/${id}`)
  }
  
  async function handleCancelRefund() {
    "use server"
    
    const result = await cancelGreenEnergyInvestment(id)
    
    if (!result.success) {
      throw new Error(result.error || "Failed to cancel and refund investment")
    }
    
    redirect(`/admin/green-energy/transactions/${id}`)
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cancel & Refund Investment</h1>
        <Button variant="outline" asChild>
          <Link href={`/admin/green-energy/transactions/${id}`}>Cancel</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Confirm Action</CardTitle>
          <CardDescription>
            Please review the investment details before cancelling and refunding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Investment Details</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span>{formatCurrency(investment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Return:</span>
                  <span>{formatCurrency(investment.expectedReturn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span>{formatDate(investment.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span>{investment.endDate ? formatDate(investment.endDate) : "N/A"}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Investor</h3>
              {investment.user && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{investment.user.firstName} {investment.user.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{investment.user.email}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">
                  Warning: This action will cancel the investment and refund the full amount to the user's wallet. This action cannot be undone.
                </p>
              </div>
              <form action={handleCancelRefund}>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Cancel & Refund Investment
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 