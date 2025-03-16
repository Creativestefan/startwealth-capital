import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getMarketInvestmentById } from "@/lib/market/actions/investments"
import { InvestmentStatus } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { formatDate } from "@/lib/utils/formatting"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Transaction Details",
  description: "View details of market investment transactions",
}

interface TransactionDetailPageProps {
  params: {
    id: string
  }
}

export default async function TransactionDetailPage({ 
  params 
}: TransactionDetailPageProps) {
  // In Next.js 15, we need to await the params object
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  // Fetch investment details
  const investmentResult = await getMarketInvestmentById(id)
  
  if (!investmentResult.success || !investmentResult.data) {
    notFound()
  }
  
  const investment = investmentResult.data
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Market Investment Details</h1>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/admin/markets/transactions">Back to Transactions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/users/${investment.userId}`}>View Customer Profile</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Details</CardTitle>
            <CardDescription>
              Transaction ID: {investment.id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusBadgeColor(investment.status)}>
                  {investment.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount:</span>
                <span>{formatCurrency(Number(investment.amount))}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Expected Return:</span>
                <span>{formatCurrency(Number(investment.expectedReturn))}</span>
              </div>

              {investment.actualReturn && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Actual Return:</span>
                  <span>{formatCurrency(Number(investment.actualReturn))}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Start Date:</span>
                <span>{formatDate(investment.startDate)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">End Date:</span>
                <span>{investment.endDate ? formatDate(investment.endDate) : "N/A"}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Created:</span>
                <span>{formatDate(investment.createdAt)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Auto Reinvest:</span>
                <span>{investment.reinvest ? "Yes" : "No"}</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              {/* Action Buttons */}
              {investment.status === InvestmentStatus.ACTIVE && (
                <>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    asChild
                  >
                    <Link href={`/admin/markets/transactions/${investment.id}/mark-matured`}>
                      Mark as Matured
                    </Link>
                  </Button>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    asChild
                  >
                    <Link href={`/admin/markets/transactions/${investment.id}/cancel-refund`}>
                      Cancel & Refund
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>
              User ID: {investment.userId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investment.user && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Name:</span>
                    <span>{investment.user.firstName} {investment.user.lastName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Email:</span>
                    <span>{investment.user.email}</span>
                  </div>
                </>
              )}
              
              {investment.plan && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-2">Investment Plan</h3>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Plan:</span>
                      <span>{investment.plan.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium">Type:</span>
                      <span>{investment.plan.type}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium">Duration:</span>
                      <span>{investment.plan.durationMonths} months</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium">Return Rate:</span>
                      <span>{Number(investment.plan.returnRate) * 100}%</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getStatusBadgeColor(status: InvestmentStatus) {
  switch (status) {
    case InvestmentStatus.ACTIVE:
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    case InvestmentStatus.MATURED:
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
    case InvestmentStatus.CANCELLED:
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
  }
} 