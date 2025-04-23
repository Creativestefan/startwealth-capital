"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MoreHorizontal, 
  Eye, 
  CheckCircle,
  XCircle
} from "lucide-react"
import { 
  formatCurrency, 
  formatDate, 
  formatInvestmentStatus,
  formatInvestmentType,
  formatUserName
} from "@/lib/green-energy/utils/formatting"
import { SerializedGreenEnergyInvestment } from "@/lib/green-energy/types"
import { matureGreenEnergyInvestment, cancelGreenEnergyInvestment } from "@/lib/green-energy/actions/investments"
import { useRouter } from "next/navigation"

interface InvestmentTransactionTableProps {
  investments: SerializedGreenEnergyInvestment[]
}

export function InvestmentTransactionTable({ investments }: InvestmentTransactionTableProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleMatureInvestment = async (id: string) => {
    if (confirm("Are you sure you want to mark this investment as matured? This will process returns to the investor.")) {
      setIsUpdating(id)
      
      try {
        const result = await matureGreenEnergyInvestment(id)
        
        if (result.success) {
          alert("Investment marked as matured")
          router.refresh()
        } else {
          alert(result.error || "Failed to mature investment")
        }
      } catch (error) {
        alert("An unexpected error occurred")
      } finally {
        setIsUpdating(null)
      }
    }
  }

  const handleCancelInvestment = async (id: string) => {
    if (confirm("Are you sure you want to cancel this investment? This will return the investment amount to the investor.")) {
      setIsUpdating(id)
      
      try {
        const result = await cancelGreenEnergyInvestment(id)
        
        if (result.success) {
          alert("Investment cancelled")
          router.refresh()
        } else {
          alert(result.error || "Failed to cancel investment")
        }
      } catch (error) {
        alert("An unexpected error occurred")
      } finally {
        setIsUpdating(null)
      }
    }
  }

  if (!investments.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No investments found
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Investor</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Expected Return</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment) => {
            const status = formatInvestmentStatus(investment.status)
            
            return (
              <TableRow key={investment.id}>
                <TableCell className="font-medium">{investment.id.substring(0, 8)}...</TableCell>
                <TableCell>{investment.user ? formatUserName(investment.user) : 'Unknown'}</TableCell>
                <TableCell>{investment.plan?.name || 'Unknown'}</TableCell>
                <TableCell>{formatInvestmentType(investment.type)}</TableCell>
                <TableCell>{formatCurrency(investment.amount)}</TableCell>
                <TableCell>{formatCurrency(investment.expectedReturn)}</TableCell>
                <TableCell>
                  <Badge variant={status.color === "green" ? "default" : 
                                status.color === "blue" ? "secondary" : 
                                status.color === "red" ? "destructive" : "outline"}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(investment.startDate)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* View Details */}
                      <DropdownMenuItem 
                        onClick={() => router.push(`/admin/green-energy/transactions/${investment.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      
                      {/* Status Update Options */}
                      {investment.status === "ACTIVE" && (
                        <DropdownMenuItem 
                          onClick={() => handleMatureInvestment(investment.id)}
                          disabled={isUpdating === investment.id}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Matured
                        </DropdownMenuItem>
                      )}
                      
                      {investment.status === "ACTIVE" && (
                        <DropdownMenuItem 
                          onClick={() => handleCancelInvestment(investment.id)}
                          disabled={isUpdating === investment.id}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Investment
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
} 