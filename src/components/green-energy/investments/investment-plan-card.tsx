"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatReturnRate } from "@/lib/green-energy/utils/formatting"
import { InvestmentModal } from "./investment-modal"
import { Leaf, Clock, TrendingUp } from "lucide-react"
import type { GreenEnergyInvestmentType } from "@prisma/client"
import type { SerializedGreenEnergyPlan } from "@/lib/green-energy/types"

// Use SerializedGreenEnergyPlan instead of direct Prisma types
interface GreenEnergyInvestmentPlanCardProps {
  plan: SerializedGreenEnergyPlan;
}

export function GreenEnergyInvestmentPlanCard({ plan }: GreenEnergyInvestmentPlanCardProps) {
  const [showInvestModal, setShowInvestModal] = useState(false)
  
  // No need to convert Decimal values as they're already converted in the serialized version
  const minAmount = plan.minAmount
  const maxAmount = plan.maxAmount
  const returnRate = plan.returnRate
  
  // Ensure the plan has the correct type format
  const typedPlan = {
    ...plan,
    type: plan.type as "SEMI_ANNUAL" | "ANNUAL",
  }
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
          </div>
          <CardDescription>{plan.description || `${plan.durationMonths} month investment plan`}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Investment Range</span>
              <span className="font-medium">
                {formatCurrency(minAmount)} - {formatCurrency(maxAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Return Rate</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">{formatReturnRate(returnRate)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Duration</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium">
                  {plan.durationMonths === 12 ? '1 Year' : `${plan.durationMonths} Months`}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Potential Return</span>
              <span className="font-medium text-green-600">
                {formatCurrency(minAmount * (returnRate / 100))} - {formatCurrency(maxAmount * (returnRate / 100))}
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
      
      {showInvestModal && (
        <InvestmentModal 
          open={showInvestModal} 
          onOpenChange={setShowInvestModal} 
          plan={typedPlan}
        />
      )}
    </>
  )
} 