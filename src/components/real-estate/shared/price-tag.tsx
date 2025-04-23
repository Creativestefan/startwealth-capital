import { formatCurrency } from "@/lib/real-estate/utils/formatting"
import type { Prisma } from "@prisma/client"

interface PriceTagProps {
  amount: number | string | Prisma.Decimal
  className?: string
  fontWeight?: number | string
}

/**
 * Displays a formatted currency amount
 * Used across both property and investment components
 */
export function PriceTag({ amount, className, fontWeight = 600 }: PriceTagProps) {
  return (
    <span 
      className={`inline-block ${className}`} 
      style={{ 
        fontWeight, 
        maxWidth: '100%', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis',
        color: 'var(--primary)'
      }}
    >
      {formatCurrency(amount)}
    </span>
  )
}

