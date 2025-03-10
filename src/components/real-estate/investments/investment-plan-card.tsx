"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/real-estate/utils/formatting"
import { InvestmentModal } from "./investment-modal"
import type { InvestmentPlan } from "@/lib/real-estate/types"
import type { RealEstateInvestmentType } from "@prisma/client"

interface InvestmentPlanCardProps {
  plan: InvestmentPlan & { id: string; type: RealEstateInvestmentType }
}

export function InvestmentPlanCard({ plan }: InvestmentPlanCardProps) {
  const [showInvestModal, setShowInvestModal] = useState(false)
  
  // Ensure the plan has the correct type format
  const typedPlan = {
    ...plan,
    type: plan.type as "SEMI_ANNUAL" | "ANNUAL"
  }
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>{plan.description || `${plan.durationMonths} month investment plan`}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Investment Range:</span>
              <span className="font-medium">
                {formatCurrency(plan.minAmount)} - {formatCurrency(plan.maxAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Duration:</span>
              <span className="font-medium">{plan.durationMonths} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Return Rate:</span>
              <span className="font-medium text-green-600">{(plan.returnRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Minimum Investment:</span>
              <span className="font-medium">{formatCurrency(plan.minAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expected Return on Min:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(plan.minAmount * plan.returnRate)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => setShowInvestModal(true)}
          >
            Invest Now
          </Button>
        </CardFooter>
      </Card>
      
      <InvestmentModal 
        plan={typedPlan}
        open={showInvestModal}
        onOpenChange={setShowInvestModal}
      />
    </>
  )
} 