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
  Truck,
  CheckCircle,
  XCircle,
  Key,
  ClipboardCheck,
  Package,
  ShoppingCart
} from "lucide-react"
import { 
  formatCurrency, 
  formatDate, 
  formatTransactionStatus,
  formatUserName
} from "@/lib/green-energy/utils/formatting"
import { SerializedEquipmentTransaction } from "@/lib/green-energy/types"
import { updateEquipmentTransactionStatus } from "@/lib/green-energy/actions/equipment"
import { useRouter } from "next/navigation"
import { TransactionStatus } from "@prisma/client"

interface EquipmentTransactionTableProps {
  transactions: SerializedEquipmentTransaction[]
}

export function EquipmentTransactionTable({ transactions }: EquipmentTransactionTableProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleUpdateStatus = async (id: string, status: TransactionStatus, trackingNumber?: string) => {
    setIsUpdating(id)
    
    try {
      // For OUT_FOR_DELIVERY status, prompt for tracking number
      let tracking = trackingNumber
      if (status === TransactionStatus.OUT_FOR_DELIVERY && !tracking) {
        const promptResult = prompt("Enter tracking number (optional):")
        tracking = promptResult || undefined
      }
      
      const result = await updateEquipmentTransactionStatus(id, status, tracking)
      
      if (result.success) {
        alert(`Transaction status updated to ${status}`)
        router.refresh()
      } else {
        alert(result.error || "Failed to update transaction status")
      }
    } catch (error) {
      alert("An unexpected error occurred")
    } finally {
      setIsUpdating(null)
    }
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No equipment transactions found
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Equipment</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const status = formatTransactionStatus(transaction.status)
            
            return (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id.substring(0, 8)}...</TableCell>
                <TableCell>{transaction.user ? formatUserName(transaction.user) : 'Unknown'}</TableCell>
                <TableCell>{transaction.equipment?.name || 'Unknown'}</TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>{formatCurrency(transaction.totalAmount)}</TableCell>
                <TableCell>
                  <Badge variant={status.color === "green" ? "default" : 
                                status.color === "yellow" ? "secondary" : 
                                status.color === "red" ? "destructive" : 
                                status.color === "purple" ? "outline" : "outline"}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
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
                        onClick={() => router.push(`/admin/green-energy/transactions/${transaction.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      
                      {/* View Delivery PIN */}
                      {transaction.deliveryPin && (
                        <DropdownMenuItem 
                          onClick={() => {
                            alert(`Delivery PIN: ${transaction.deliveryPin}\n\nShare this PIN with the customer for delivery confirmation.`);
                          }}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          View Delivery PIN
                        </DropdownMenuItem>
                      )}
                      
                      {/* Status Update Options */}
                      {transaction.status === TransactionStatus.PENDING && (
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(transaction.id, TransactionStatus.ACCEPTED)}
                          disabled={isUpdating === transaction.id}
                        >
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          Accept Order
                        </DropdownMenuItem>
                      )}
                      
                      {transaction.status === TransactionStatus.ACCEPTED && (
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(transaction.id, TransactionStatus.PROCESSING)}
                          disabled={isUpdating === transaction.id}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Mark as Processing
                        </DropdownMenuItem>
                      )}
                      
                      {transaction.status === TransactionStatus.PROCESSING && (
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(transaction.id, TransactionStatus.OUT_FOR_DELIVERY)}
                          disabled={isUpdating === transaction.id}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Mark as Out for Delivery
                        </DropdownMenuItem>
                      )}
                      
                      {transaction.status === TransactionStatus.OUT_FOR_DELIVERY && (
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(transaction.id, TransactionStatus.COMPLETED)}
                          disabled={isUpdating === transaction.id}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      
                      {(transaction.status === TransactionStatus.PENDING || transaction.status === TransactionStatus.ACCEPTED || transaction.status === TransactionStatus.PROCESSING) && (
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(transaction.id, TransactionStatus.CANCELLED)}
                          disabled={isUpdating === transaction.id}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Order
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