import { formatCurrency } from "@/lib/real-estate/utils/formatting"
import type { Prisma } from "@prisma/client"

interface PriceTagProps {
  amount: number | string | Prisma.Decimal
  className?: string
}

/**
 * Displays a formatted currency amount
 * Used across both property and investment components
 */
export function PriceTag({ amount, className }: PriceTagProps) {
  return <span className={`font-medium ${className}`}>{formatCurrency(amount)}</span>
}

