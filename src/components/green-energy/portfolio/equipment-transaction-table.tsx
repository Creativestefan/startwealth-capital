"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/green-energy/utils/formatting"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TransactionStatus } from "@prisma/client"

interface EquipmentTransaction {
  id: string
  equipment?: {
    id: string
    name: string
    type: string
  } | null
  totalAmount: number
  status: TransactionStatus
  createdAt: string
  updatedAt: string
  trackingNumber?: string | null
}

interface EquipmentTransactionTableProps {
  transactions: EquipmentTransaction[]
}

/**
 * Displays a table of equipment transactions with details and actions
 */
export function EquipmentTransactionTable({ transactions }: EquipmentTransactionTableProps) {
  const router = useRouter()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tracking</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No equipment purchases found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.equipment?.name || "Equipment"}</TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                <TableCell>{formatCurrency(transaction.totalAmount)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    transaction.status === TransactionStatus.PENDING 
                      ? "bg-amber-100 text-amber-800" 
                      : transaction.status === TransactionStatus.COMPLETED
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {transaction.status}
                  </span>
                </TableCell>
                <TableCell>
                  {transaction.trackingNumber ? (
                    <span className="text-sm">{transaction.trackingNumber}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not available</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/green-energy/portfolio/equipment/${transaction.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 