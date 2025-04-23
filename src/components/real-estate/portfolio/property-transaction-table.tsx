"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PriceTag } from "@/components/real-estate/shared/price-tag"
import { InvestmentStatusBadge } from "@/components/real-estate/shared/investment-status-badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/real-estate/utils/formatting"
import { makeInstallmentPayment } from "@/lib/real-estate/actions/portfolio"
import { TRANSACTION_STATUS } from "@/lib/real-estate/constants"
import { Eye, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { PropertyTransaction } from "@/lib/real-estate/types"

interface PropertyTransactionTableProps {
  transactions: PropertyTransaction[]
}

/**
 * Displays a table of property transactions with details and actions
 */
export function PropertyTransactionTable({ transactions }: PropertyTransactionTableProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  const handlePayInstallment = async (transactionId: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [transactionId]: true }))

      const response = await makeInstallmentPayment(transactionId)

      if (!response.success) {
        throw new Error(response.error)
      }

      toast.success("Installment payment successful")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to make payment")
    } finally {
      setIsLoading((prev) => ({ ...prev, [transactionId]: false }))
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No properties found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.property?.name || "Property"}</TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                <TableCell>
                  <PriceTag amount={transaction.amount} />
                </TableCell>
                <TableCell>
                  {transaction.type === "FULL"
                    ? "Full Payment"
                    : `Installment (${transaction.paidInstallments}/${transaction.installments})`}
                </TableCell>
                <TableCell>
                  <InvestmentStatusBadge status={transaction.status} />
                </TableCell>
                <TableCell className="text-right">
                  {transaction.type === "INSTALLMENT" &&
                  transaction.status === TRANSACTION_STATUS.PENDING &&
                  transaction.paidInstallments < (transaction.installments || 0) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      disabled={isLoading[transaction.id]}
                      onClick={() => handlePayInstallment(transaction.id)}
                    >
                      {isLoading[transaction.id] ? (
                        "Processing..."
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Installment
                        </>
                      )}
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/real-estate/property/${transaction.propertyId}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
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

