"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, DollarSign, Home, MapPin, Receipt, Download, ExternalLink } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/real-estate/utils/formatting"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { useReceipt } from "@/providers/receipt-provider"

interface PropertyTransactionDetailProps {
  transaction: any
}

export function PropertyTransactionDetail({ transaction }: PropertyTransactionDetailProps) {
  const router = useRouter()
  const { viewReceipt } = useReceipt()
  
  // Format transaction data for display
  const formattedDate = formatDate(transaction.createdAt)
  const formattedAmount = formatCurrency(transaction.totalAmount || transaction.amount)
  const property = transaction.property
  const user = transaction.user
  
  // Calculate remaining installments if applicable
  const totalInstallments = transaction.installments || 1
  const paidInstallments = transaction.paidInstallments || 1
  const remainingInstallments = totalInstallments - paidInstallments
  
  // Format next payment date if applicable
  const nextPaymentDate = transaction.nextPaymentDue 
    ? formatDate(transaction.nextPaymentDue)
    : "N/A"
    
  // Calculate payment progress
  const paymentProgress = Math.round((paidInstallments / totalInstallments) * 100)
  
  // Generate installment data
  const installmentAmount = transaction.installmentAmount || transaction.totalAmount || transaction.amount
  const installments = Array.from({ length: totalInstallments }, (_, index) => {
    // Calculate due date (mock - would come from backend in real app)
    const dueDate = new Date(transaction.createdAt || new Date())
    
    // Safely add months to the date
    try {
      dueDate.setMonth(dueDate.getMonth() + index)
      return {
        number: index + 1,
        dueDate: formatDate(dueDate.toISOString()),
        amount: formatCurrency(installmentAmount),
        status: index < paidInstallments ? "Paid" : index === paidInstallments ? "Upcoming" : "Pending"
      }
    } catch (error) {
      // Fallback if date is invalid
      return {
        number: index + 1,
        dueDate: "Date unavailable",
        amount: formatCurrency(installmentAmount),
        status: index < paidInstallments ? "Paid" : index === paidInstallments ? "Upcoming" : "Pending"
      }
    }
  })

  // Handle receipt download
  const handleDownloadReceipt = () => {
    // Ensure all necessary property data is included
    const receiptData = {
      ...transaction,
      // Ensure property data is complete
      property: {
        ...property,
        // Make sure location is explicitly included
        location: property.location || '',
        name: property.name || 'Property'
      },
      // Format user data consistently
      user: user || { firstName: '', lastName: '' }
    };
    
    viewReceipt(receiptData, user ? `${user.firstName} ${user.lastName}` : '');
  }

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-2 flex items-center gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-3 w-3" />
        <span className="text-xs">Back to portfolio</span>
      </Button>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Property Purchase</h1>
          <p className="text-xs text-muted-foreground">Transaction #{transaction.id.substring(0, 8)}</p>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-8"
            onClick={handleDownloadReceipt}
          >
            <Download className="h-3 w-3 mr-1" />
            Receipt
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-8"
            asChild
          >
            <Link href={`/real-estate/property/${property.id}`}>
              <ExternalLink className="h-3 w-3 mr-1" />
              View Property
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Property Summary */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Property Details</CardTitle>
            <CardDescription className="text-xs">Information about the property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex flex-col sm:flex-row gap-4">
              {property.mainImage && (
                <div className="relative w-full sm:w-1/3 h-36 rounded-md overflow-hidden">
                  <Image 
                    src={property.mainImage} 
                    alt={property.name} 
                    fill 
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-sm font-semibold">{property.name}</h2>
                <div className="flex items-center text-muted-foreground mt-1 mb-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="text-xs">{property.location}</span>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{property.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {property.features && Array.isArray(property.features) && property.features.slice(0, 3).map((feature: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">{feature}</Badge>
                  ))}
                  {property.features && Array.isArray(property.features) && property.features.length > 3 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">+{property.features.length - 3} more</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transaction Summary</CardTitle>
            <CardDescription className="text-xs">Purchase information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge 
                className={`text-xs px-1.5 py-0.5 ${
                  transaction.status === "COMPLETED" 
                    ? "bg-green-100 text-green-800 hover:bg-green-100" 
                    : transaction.status === "PENDING"
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }`}
              >
                {transaction.status}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Purchase Date</span>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span className="text-xs">{formattedDate}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Total Amount</span>
              <div className="flex items-center font-medium">
                <DollarSign className="h-3 w-3 mr-1" />
                <span className="text-xs">{formattedAmount}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Payment Type</span>
              <span className="text-xs">{totalInstallments > 1 ? `Installments (${totalInstallments})` : "Full Payment"}</span>
            </div>
            
            {totalInstallments > 1 && (
              <>
                <Separator className="my-1" />
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium">Payment Progress</span>
                    <span className="text-xs font-medium">{paymentProgress}%</span>
                  </div>
                  <Progress value={paymentProgress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground text-right">
                    {paidInstallments} of {totalInstallments} payments completed
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Next Payment</span>
                  <span className="text-xs font-medium">{remainingInstallments > 0 ? nextPaymentDate : "Completed"}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Remaining</span>
                  <span className="text-xs">{remainingInstallments > 0 ? `${remainingInstallments} installments` : "None"}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Payment History */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Payment History</CardTitle>
          <CardDescription className="text-xs">
            {totalInstallments > 1 
              ? `Track your installment payments for this property` 
              : `Details of your property purchase`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Payment</TableHead>
                  <TableHead className="text-xs">Due Date</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments.map((installment, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs font-medium">
                      {totalInstallments > 1 ? `Installment ${installment.number}` : "Full Payment"}
                    </TableCell>
                    <TableCell className="text-xs">{installment.dueDate}</TableCell>
                    <TableCell className="text-xs">{installment.amount}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-1.5 py-0.5 ${
                          installment.status === "Paid" 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : installment.status === "Upcoming"
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                            : "bg-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        {installment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
          {transaction.status !== "COMPLETED" && remainingInstallments > 0 && (
            <Button variant="default" size="sm" className="w-full sm:w-auto text-xs h-8">
              <DollarSign className="h-3 w-3 mr-1" />
              Make Payment
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto text-xs h-8"
            onClick={handleDownloadReceipt}
          >
            <Receipt className="h-3 w-3 mr-1" />
            Download Receipt
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 