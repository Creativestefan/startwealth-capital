import { Progress } from "@/components/ui/progress"
import type { RealEstateInvestment } from "@/lib/real-estate/types"
import { calculateInvestmentProgress } from "./investment-utils"

interface InvestmentProgressProps {
  investment: RealEstateInvestment
  showLabels?: boolean
  className?: string
}

/**
 * Displays a progress bar for an investment with optional labels
 * Used in investment cards and detail views
 */
export function InvestmentProgress({ investment, showLabels = true, className = "" }: InvestmentProgressProps) {
  const { progress, formattedProgress, startDate, endDate, formattedDaysLeft } = calculateInvestmentProgress(investment)

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-sm">
          <span>Progress</span>
          <span>{formattedProgress}</span>
        </div>
      )}

      <Progress value={progress} className="h-2" />

      {showLabels && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{startDate}</span>
          <span>{formattedDaysLeft}</span>
          <span>{endDate}</span>
        </div>
      )}
    </div>
  )
}

