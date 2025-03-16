'use client'

import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { formatDate } from "@/lib/utils/formatting"
import Link from "next/link"
import type { SerializedMarketInvestment } from "@/lib/market/types"

interface InvestmentTransactionTableProps {
  investments: SerializedMarketInvestment[]
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    case 'MATURED':
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
    case 'CANCELLED':
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
  }
}

export function InvestmentTransactionTable({ investments }: InvestmentTransactionTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Expected Return</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment) => (
            <TableRow key={investment.id}>
              <TableCell>{formatDate(investment.createdAt)}</TableCell>
              <TableCell>
                {investment.user ? (
                  <Link
                    href={`/admin/users/${investment.userId}`}
                    className="hover:underline"
                  >
                    {investment.user.firstName} {investment.user.lastName}
                  </Link>
                ) : (
                  investment.userId
                )}
              </TableCell>
              <TableCell>
                {investment.plan?.name || "N/A"}
              </TableCell>
              <TableCell>{formatCurrency(investment.amount)}</TableCell>
              <TableCell>{formatCurrency(investment.expectedReturn)}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(investment.status)}>
                  {investment.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/markets/transactions/${investment.id}`}>
                    View Details
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 