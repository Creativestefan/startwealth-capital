"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { InvestmentModal } from "./investment-modal"
import type { SerializedMarketPlan } from "@/lib/market/types"
import { TrendingUp, Clock, DollarSign, Tag } from "lucide-react"

interface InvestmentPlanCardProps {
  plan: SerializedMarketPlan
}

export function InvestmentPlanCard({ plan }: InvestmentPlanCardProps) {
  const [showInvestModal, setShowInvestModal] = useState(false)

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden border-muted shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-full bg-primary/10 p-1.5">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>{plan.name}</CardTitle>
          </div>
          <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Investment Range
              </span>
              <span className="font-medium">
                {formatCurrency(Number(plan.minAmount))} - {formatCurrency(Number(plan.maxAmount))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Return Rate
              </span>
              <span className="font-medium text-green-600">{Number(plan.returnRate)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Duration
              </span>
              <span className="font-medium">{plan.durationMonths} months</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Plan Type</span>
              <span className="font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                {plan.type === "SEMI_ANNUAL" ? "Semi-Annual" : "Annual"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 pb-4 px-4">
          <Button 
            className="w-full" 
            onClick={() => setShowInvestModal(true)}
          >
            Invest Now
          </Button>
        </CardFooter>
      </Card>

      <InvestmentModal
        plan={plan}
        open={showInvestModal}
        onOpenChange={setShowInvestModal}
      />
    </>
  )
} 