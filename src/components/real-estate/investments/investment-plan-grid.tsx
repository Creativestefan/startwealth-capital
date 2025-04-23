import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/real-estate/utils/formatting"
import type { InvestmentPlan } from "@/lib/real-estate/types"

interface InvestmentPlanGridProps {
  plans: [string, InvestmentPlan][] | Record<string, InvestmentPlan> | InvestmentPlan[]
}

export function InvestmentPlanGrid({ plans }: InvestmentPlanGridProps) {
  // Convert plans to a consistent format: [string, InvestmentPlan][]
  const normalizedPlans: [string, InvestmentPlan][] = Array.isArray(plans)
    ? plans[0] && typeof plans[0] === "object" && !Array.isArray(plans[0])
      ? // If it's an array of InvestmentPlan objects
        plans.map((plan, index) => [`plan-${index}`, plan as InvestmentPlan])
      : // If it's already [string, InvestmentPlan][]
        (plans as [string, InvestmentPlan][])
    : // If it's a Record<string, InvestmentPlan>
      Object.entries(plans)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {normalizedPlans.map(([key, plan]) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description || `${plan.durationMonths} month investment plan`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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
                <span className="font-medium">{(plan.returnRate * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

