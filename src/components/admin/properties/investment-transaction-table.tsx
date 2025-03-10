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
import { cancelInvestment, matureInvestment } from "@/lib/real-estate/actions/investments"
import type { RealEstateInvestment } from "@/lib/real-estate/types"

interface InvestmentTransactionTableProps {
  investments: RealEstateInvestment[]
}

export function InvestmentTransactionTable({ investments }: InvestmentTransactionTableProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({})

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>
      case "MATURED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Matured</Badge>
      case "WITHDRAWN":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Withdrawn</Badge>
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Function to get investment type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "SEMI_ANNUAL":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Semi-Annual</Badge>
      case "ANNUAL":
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Annual</Badge>
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

  // Function to format the end date display
  const formatEndDate = (investment: RealEstateInvestment) => {
    // For active investments, show "Active" instead of the projected end date
    if (investment.status === "ACTIVE") {
      return <span className="text-blue-600">Active</span>;
    }
    
    // For matured or cancelled investments, show the actual end date
    return new Date(investment.endDate).toLocaleDateString();
  };

  // Function to mark an investment as matured
  async function handleMarkAsMatured(id: string, expectedReturn: number) {
    if (confirm("Are you sure you want to mark this investment as matured?")) {
      setIsProcessing((prev) => ({ ...prev, [id]: true }))
      
      try {
        // Call the matureInvestment function with the investment ID and expected return
        const response = await matureInvestment(id, expectedReturn)
        
        if (!response.success) {
          throw new Error(response.error || "Failed to mark investment as matured")
        }
        
        toast.success("Investment marked as matured successfully")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "An error occurred while updating the investment")
        console.error(error)
      } finally {
        setIsProcessing((prev) => ({ ...prev, [id]: false }))
      }
    }
  }

  // Function to cancel an investment
  async function handleCancel(id: string, amount: number) {
    if (confirm("Are you sure you want to cancel this investment? This will refund the user without any profit return.")) {
      setIsProcessing((prev) => ({ ...prev, [id]: true }))
      
      try {
        // Call the cancelInvestment function with the investment ID and refund amount
        const response = await cancelInvestment(id, amount)
        
        if (!response.success) {
          throw new Error(response.error || "Failed to cancel investment")
        }
        
        toast.success("Investment cancelled successfully. User has been refunded.")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "An error occurred while cancelling the investment")
        console.error(error)
      } finally {
        setIsProcessing((prev) => ({ ...prev, [id]: false }))
      }
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Type</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Expected Return</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No investments found
              </TableCell>
            </TableRow>
          ) : (
            investments.map((investment) => (
              <TableRow key={investment.id}>
                <TableCell>{getTypeBadge(investment.type)}</TableCell>
                <TableCell>{investment.user ? formatUserName(investment.user) : investment.userId.slice(0, 8)}</TableCell>
                <TableCell>{formatCurrency(Number(investment.amount))}</TableCell>
                <TableCell>{formatCurrency(Number(investment.expectedReturn))}</TableCell>
                <TableCell>{getStatusBadge(investment.status)}</TableCell>
                <TableCell>{new Date(investment.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{formatEndDate(investment)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isProcessing[investment.id]}>
                        <MoreHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/properties/investments/${investment.id}`}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {investment.status === "ACTIVE" && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsMatured(investment.id, Number(investment.expectedReturn))}
                            disabled={isProcessing[investment.id]}
                          >
                            <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
                            Mark as Matured
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCancel(investment.id, Number(investment.amount))}
                            disabled={isProcessing[investment.id]}
                            className="text-destructive focus:text-destructive"
                          >
                            <XIcon className="mr-2 h-4 w-4" />
                            Cancel & Refund
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