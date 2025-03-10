import type { RealEstateInvestment } from "@/lib/real-estate/types"
import { InvestmentCard } from "./investment-card"

interface InvestmentGridProps {
  investments: RealEstateInvestment[]
  onWithdraw?: (id: string) => void
  variant?: "default" | "compact"
}

/**
 * Arranges multiple investment cards in a responsive grid layout
 * Used on investment listing pages
 */
export function InvestmentGrid({ investments, onWithdraw, variant = "default" }: InvestmentGridProps) {
  if (investments.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
        <p className="text-center text-muted-foreground">No investments found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {investments.map((investment) => (
        <InvestmentCard
          key={investment.id}
          investment={investment}
          onWithdraw={onWithdraw}
          className={variant === "compact" ? "h-full" : ""}
        />
      ))}
    </div>
  )
}

