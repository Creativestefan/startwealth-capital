export const dynamic = 'force-dynamic';
import { notFound, redirect } from "next/navigation"
import { getInvestmentById, matureInvestment } from "@/lib/real-estate/actions/investments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface MarkMaturedPageProps {
  params: {
    id: string
  }
}

export default async function MarkMaturedPage({ params }: MarkMaturedPageProps) {
  const { id } = await params
  
  // Get investment details
  const result = await getInvestmentById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  const investment = result.data
  
  // Only allow marking as matured if investment is active
  if (investment.status !== "ACTIVE") {
    redirect(`/admin/properties/investments/${id}`)
  }
  
  async function handleMarkMatured() {
    "use server"
    
    // Calculate actual return based on investment amount and expected return
    const actualReturn = investment.expectedReturn
    
    const result = await matureInvestment(id, actualReturn)
    
    if (!result.success) {
      throw new Error(result.error || "Failed to mark investment as matured")
    }
    
    redirect(`/admin/properties/investments/${id}`)
  }
  
  // Format dates
  const startDate = new Date(investment.startDate).toLocaleDateString()
  const endDate = investment.endDate ? new Date(investment.endDate).toLocaleDateString() : "N/A"
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mark Investment as Matured</h1>
        <Button variant="outline" asChild>
          <Link href={`/admin/properties/investments/${id}`}>Cancel</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Confirm Action</CardTitle>
          <CardDescription>
            Please review the investment details before marking it as matured
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
              <form action={handleMarkMatured}>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Mark as Matured
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 