"use client"

import type { RealEstateInvestment } from "@/lib/real-estate/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InvestmentStatusBadge } from "../shared/investment-status-badge"
import { getInvestmentSummary } from "../shared/investment-utils"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface InvestmentTableProps {
  investments: RealEstateInvestment[]
  onViewDetails?: (id: string) => void
}

/**
 * Displays investments in a tabular format with sortable columns
 * Used for detailed investment listings and admin views
 */
export function InvestmentTable({ investments, onViewDetails }: InvestmentTableProps) {
  const router = useRouter()

  const handleViewDetails = (id: string) => {
    if (onViewDetails) {
      onViewDetails(id)
    } else {
      // Check if the user is on the admin page
      const isAdmin = window.location.pathname.includes('/admin')
      if (isAdmin) {
        router.push(`/admin/properties/investments/${id}`)
      } else {
        // For regular users, redirect to the shares detail page
        router.push(`/real-estate/shares/${id}`)
      }
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Expected Return</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No investments found
              </TableCell>
            </TableRow>
          ) : (
            investments.map((investment) => {
              const summary = getInvestmentSummary(investment)
              return (
                <TableRow key={investment.id}>
                  <TableCell>{summary.type}</TableCell>
                  <TableCell>{summary.amount}</TableCell>
                  <TableCell>{summary.expectedReturn}</TableCell>
                  <TableCell>{summary.investedOn}</TableCell>
                  <TableCell>{getInvestmentSummary(investment).endDate}</TableCell>
                  <TableCell>
                    <InvestmentStatusBadge status={investment.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(investment.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

