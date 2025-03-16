import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getEquipmentTransactionById } from "@/lib/green-energy/actions/equipment"
import { getGreenEnergyInvestmentById } from "@/lib/green-energy/actions/investments"
import { TransactionStatus, InvestmentStatus } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { formatDate } from "@/lib/real-estate/utils/formatting"
import Link from "next/link"
import { StatusUpdateButton, AddressUpdateButton } from "./client-components"

export const metadata: Metadata = {
  title: "Transaction Details",
  description: "View details of green energy transactions",
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
  
  // Try to fetch as equipment transaction first
  const equipmentResult = await getEquipmentTransactionById(id)
  
  // If equipment transaction not found, try as investment
  if (!equipmentResult.success || !equipmentResult.data) {
    const investmentResult = await getGreenEnergyInvestmentById(id)
    
    if (!investmentResult.success || !investmentResult.data) {
      notFound()
    }
    
    // Handle investment transaction
    const investment = investmentResult.data
    
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Investment Transaction Details</h1>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/admin/green-energy/transactions">Back to Transactions</Link>
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
                  <span>{formatCurrency(investment.amount)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Expected Return:</span>
                  <span>{formatCurrency(investment.expectedReturn)}</span>
                </div>
                
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
                      <Link href={`/admin/green-energy/transactions/${investment.id}/mark-matured`}>
                        Mark as Matured
                      </Link>
                    </Button>
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      asChild
                    >
                      <Link href={`/admin/green-energy/transactions/${investment.id}/cancel-refund`}>
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
  
  // Handle equipment transaction
  const transaction = equipmentResult.data
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Equipment Purchase Details</h1>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/admin/green-energy/transactions">Back to Transactions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/users/${transaction.userId}`}>View Customer Profile</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              Transaction ID: {transaction.id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusBadgeColor(transaction.status)}>
                  {transaction.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount:</span>
                <span>{formatCurrency(transaction.totalAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Quantity:</span>
                <span>{transaction.quantity}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Date:</span>
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Equipment ID:</span>
                <span>{transaction.equipmentId}</span>
              </div>
              
              {transaction.trackingNumber && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tracking Number:</span>
                  <span>{transaction.trackingNumber}</span>
                </div>
              )}
              
              {transaction.deliveryDate && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Delivery Date:</span>
                  <span>{formatDate(transaction.deliveryDate)}</span>
                </div>
              )}
              
              {transaction.deliveryPin && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Delivery PIN:</span>
                  <span>{transaction.deliveryPin}</span>
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-2">
              <StatusUpdateButton 
                transactionId={transaction.id}
                currentStatus={transaction.status}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Customer and Delivery Details */}
        <div className="space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>
                User ID: {transaction.userId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transaction.user && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Name:</span>
                      <span>{transaction.user.firstName} {transaction.user.lastName}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Email:</span>
                      <span>{transaction.user.email}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
              <CardDescription>
                Shipping information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transaction.deliveryAddress ? (
                <div className="space-y-2">
                  <p>{transaction.deliveryAddress.street}</p>
                  <p>{transaction.deliveryAddress.city}, {transaction.deliveryAddress.state} {transaction.deliveryAddress.postalCode}</p>
                  <p>{transaction.deliveryAddress.country}</p>
                  
                  <AddressUpdateButton 
                    transactionId={transaction.id}
                    currentAddress={transaction.deliveryAddress}
                  />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">No delivery address provided</p>
                  <AddressUpdateButton 
                    transactionId={transaction.id}
                    currentAddress={null}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Equipment Details */}
          {transaction.equipment && (
            <Card>
              <CardHeader>
                <CardTitle>Equipment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Name:</span>
                    <span>{transaction.equipment.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Type:</span>
                    <span>{transaction.equipment.type}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Unit Price:</span>
                    <span>{formatCurrency(transaction.equipment.price)}</span>
                  </div>
                  
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/admin/green-energy/equipment/${transaction.equipment.id}`}>
                      View Equipment Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 

// Helper function to determine badge color based on status
function getStatusBadgeColor(status: TransactionStatus | InvestmentStatus) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800";
    case "ACCEPTED":
      return "bg-blue-100 text-blue-800";
    case "PROCESSING":
      return "bg-indigo-100 text-indigo-800";
    case "OUT_FOR_DELIVERY":
      return "bg-purple-100 text-purple-800";
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "MATURED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
} 