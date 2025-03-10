"use client"

import type { RealEstateInvestment } from "@/lib/real-estate/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InvestmentStatusBadge } from "../shared/investment-status-badge"
import { InvestmentProgress } from "../shared/investment-progress"
import { getInvestmentSummary } from "../shared/investment-utils"

interface InvestmentCardProps {
  investment: RealEstateInvestment
  onWithdraw?: (id: string) => void
  className?: string
}

/**
 * Displays a single investment with details in a card format
 * Used in investment dashboards and lists
 */
export function InvestmentCard({ investment, onWithdraw, className = "" }: InvestmentCardProps) {
  const summary = getInvestmentSummary(investment)

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{summary.type}</h3>
              <InvestmentStatusBadge status={investment.status} />
            </div>
            <p className="text-sm text-muted-foreground">Invested on {summary.investedOn}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">Amount</div>
              <div className="font-bold">{summary.amount}</div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">Expected Return</div>
              <div className="font-bold">{summary.expectedReturn}</div>
            </div>
          </div>
        </div>

        <InvestmentProgress investment={investment} className="mt-4" />

        {investment.status === "MATURED" && (
          <Button className="mt-4 w-full" onClick={() => onWithdraw?.(investment.id)}>
            Withdraw Returns
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

