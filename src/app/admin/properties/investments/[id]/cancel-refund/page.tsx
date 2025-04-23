export const dynamic = 'force-dynamic';
import { notFound, redirect } from "next/navigation"
import { getInvestmentById, cancelInvestment } from "@/lib/real-estate/actions/investments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface CancelRefundPageProps {
  params: {
    id: string
  }
}

export default async function CancelRefundPage({ params }: CancelRefundPageProps) {
  const { id } = await params
  
  // Get investment details
  const result = await getInvestmentById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  const investment = result.data
  
  // Only allow cancelling if investment is active
  if (investment.status !== "ACTIVE") {
    redirect(`/admin/properties/investments/${id}`)
  }
  
  async function handleCancelRefund() {
    "use server"
    
    const result = await cancelInvestment(id)
    
    if (!result.success) {
      throw new Error(result.error || "Failed to cancel and refund investment")
    }
    
    redirect(`/admin/properties/investments/${id}`)
  }
  
  // Format dates
  const startDate = new Date(investment.startDate).toLocaleDateString()
  const endDate = investment.endDate ? new Date(investment.endDate).toLocaleDateString() : "N/A"
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cancel & Refund Investment</h1>
        <Button variant="outline" asChild>
          <Link href={`/admin/properties/investments/${id}`}>Cancel</Link>
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
                  <span>{formatCurrency(Number(investment.amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Return:</span>
                  <span>{formatCurrency(Number(investment.expectedReturn))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span>{startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span>{endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{investment.type === "SEMI_ANNUAL" ? "Semi-Annual" : "Annual"}</span>
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