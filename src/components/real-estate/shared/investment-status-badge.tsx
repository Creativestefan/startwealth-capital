import { Badge } from "@/components/ui/badge"

interface InvestmentStatusBadgeProps {
  status: string
  className?: string
}

/**
 * Displays a badge indicating the status of an investment or property
 * Used across both property and investment components
 */
export function InvestmentStatusBadge({ status, className }: InvestmentStatusBadgeProps) {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ACTIVE: { label: "Active", variant: "default" },
    MATURED: { label: "Matured", variant: "secondary" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
    AVAILABLE: { label: "Available", variant: "default" },
    PENDING: { label: "Pending", variant: "secondary" },
    SOLD: { label: "Sold", variant: "outline" },
  }

  const statusInfo = statusMap[status] || { label: status, variant: "default" }

  return (
    <Badge variant={statusInfo.variant} className={className}>
      {statusInfo.label}
    </Badge>
  )
}

