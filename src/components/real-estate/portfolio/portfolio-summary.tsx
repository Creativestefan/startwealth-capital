import { Building, TrendingUp, Wallet } from "lucide-react"
import { StatCard } from "@/components/real-estate/shared/stat-card"
import { formatCurrency } from "@/lib/real-estate/utils/formatting"

interface PortfolioSummaryProps {
  totalValue: number
  totalReturn: number
  propertyCount: number
  investmentCount: number
}

/**
 * Displays summary statistics for the user's real estate portfolio
 */
export function PortfolioSummary({ totalValue, totalReturn, propertyCount, investmentCount }: PortfolioSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Portfolio Value"
        value={formatCurrency(totalValue)}
        icon={Wallet}
        subtitle="Current value of all investments"
      />
      <StatCard
        title="Total Returns"
        value={formatCurrency(totalReturn)}
        icon={TrendingUp}
        subtitle="Realized and unrealized returns"
      />
      <StatCard
        title="Properties Owned"
        value={propertyCount}
        icon={Building}
        subtitle="Number of properties in portfolio"
      />
      <StatCard
        title="Active Investments"
        value={investmentCount}
        icon={Building}
        subtitle="Number of share investments"
      />
    </div>
  )
}

