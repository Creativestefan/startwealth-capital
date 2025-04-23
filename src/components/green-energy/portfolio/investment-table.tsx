"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/green-energy/utils/formatting"
import { Eye, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { InvestmentStatus } from "@prisma/client"
import { Progress } from "@/components/ui/progress"

interface GreenEnergyPlan {
  id: string
  name: string
  description: string
}

interface GreenEnergyInvestment {
  id: string
  type: string
  amount: number
  status: InvestmentStatus
  startDate: string
  endDate?: string | null
  expectedReturn: number
  actualReturn?: number | null
  createdAt: string
  updatedAt: string
  plan?: GreenEnergyPlan | null
}

interface InvestmentTableProps {
  investments: GreenEnergyInvestment[]
}

/**
 * Calculates the progress of an investment based on start and end dates
 */
function calculateProgress(startDate: string, endDate: string | null | undefined, status: InvestmentStatus): number {
  if (status === InvestmentStatus.MATURED) {
    return 100
  }
  
  if (!endDate) {
    return 0
  }
  
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = Date.now()
  
  if (now >= end) {
    return 100
  }
  
  if (now <= start) {
    return 0
  }
  
  const total = end - start
  const elapsed = now - start
  return Math.round((elapsed / total) * 100)
}

/**
 * Displays a table of green energy investments with details and actions
 */
export function InvestmentTable({ investments }: InvestmentTableProps) {
  const router = useRouter()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Expected Return</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
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
            investments.map((investment) => {
              const progress = calculateProgress(investment.startDate, investment.endDate, investment.status)
              
              return (
                <TableRow key={investment.id}>
                  <TableCell className="font-medium">{investment.plan?.name || "Investment Plan"}</TableCell>
                  <TableCell>
                    {investment.type === "SEMI_ANNUAL" ? "6 months" : "12 months"}
                  </TableCell>
                  <TableCell>{formatCurrency(investment.amount)}</TableCell>
                  <TableCell className="text-emerald-600 font-medium">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {formatCurrency(investment.expectedReturn)}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(investment.startDate)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      investment.status === InvestmentStatus.ACTIVE 
                        ? "bg-emerald-100 text-emerald-800" 
                        : investment.status === InvestmentStatus.MATURED
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {investment.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-full space-y-1">
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{progress}%</span>
                        <span>
                          {investment.status === InvestmentStatus.MATURED 
                            ? "Completed" 
                            : investment.endDate ? `Matures ${formatDate(investment.endDate)}` : "In progress"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/green-energy/portfolio/investments/${investment.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
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