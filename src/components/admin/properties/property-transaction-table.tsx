// This component displays a table of property transactions for admin users
// Updated to fix TypeScript import issues
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { MoreHorizontalIcon, EyeIcon, CheckIcon, XIcon } from "lucide-react"
import type { PropertyTransaction } from "@/lib/real-estate/types"

interface PropertyTransactionTableProps {
  transactions: PropertyTransaction[]
}

export function PropertyTransactionTable({ transactions }: PropertyTransactionTableProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
      case "FAILED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>
      case "CANCELLED":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Function to get transaction type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "FULL":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Full Payment</Badge>
      case "INSTALLMENT":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Installment</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Function to format user name (First Name + Last Initial)
  const formatUserName = (user: any) => {
    if (!user) return "Unknown User";
    
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    
    // If we have both first and last name, show first name and last initial
    if (firstName && lastName) {
      return `${firstName} ${lastName.charAt(0)}.`;
    }
    
    // If we only have first name, show it
    if (firstName) {
      return firstName;
    }
    
    // If we only have last name, show it
    if (lastName) {
      return lastName;
    }
    
    // If we have neither, show email or ID
    return user.email || user.id?.slice(0, 8) || "Unknown User";
  };

  // Function to approve a transaction
  async function handleApprove(id: string) {
    if (confirm("Are you sure you want to approve this transaction?")) {
      setIsProcessing(id)
      
      try {
        // In a real application, you would call an API to approve the transaction
        // For now, we'll just simulate a successful response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        toast.success("Transaction approved successfully")
        router.refresh()
      } catch (error) {
        toast.error("An error occurred while approving the transaction")
        console.error(error)
      } finally {
        setIsProcessing(null)
      }
    }
  }

  // Function to reject a transaction
  async function handleReject(id: string) {
    if (confirm("Are you sure you want to reject this transaction?")) {
      setIsProcessing(id)
      
      try {
        // In a real application, you would call an API to reject the transaction
        // For now, we'll just simulate a successful response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        toast.success("Transaction rejected successfully")
        router.refresh()
      } catch (error) {
        toast.error("An error occurred while rejecting the transaction")
        console.error(error)
      } finally {
        setIsProcessing(null)
      }
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.property?.name || `Property ${transaction.propertyId.slice(0, 8)}`}
                </TableCell>
                <TableCell>{transaction.user ? formatUserName(transaction.user) : transaction.userId.slice(0, 8)}</TableCell>
                <TableCell>{formatCurrency(Number(transaction.amount))}</TableCell>
                <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/properties/transactions/${transaction.id}`}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {transaction.status === "PENDING" && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => handleApprove(transaction.id)}
                            disabled={isProcessing === transaction.id}
                          >
                            <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleReject(transaction.id)}
                            disabled={isProcessing === transaction.id}
                            className="text-destructive focus:text-destructive"
                          >
                            <XIcon className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 