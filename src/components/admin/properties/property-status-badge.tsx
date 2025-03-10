import { Badge } from "@/components/ui/badge"
import type { PropertyStatus } from "@prisma/client"

interface PropertyStatusBadgeProps {
  status: PropertyStatus
}

export function PropertyStatusBadge({ status }: PropertyStatusBadgeProps) {
  const statusConfig = {
    AVAILABLE: { label: "Available", variant: "default" as const },
    PENDING: { label: "Pending", variant: "secondary" as const },
    SOLD: { label: "Sold", variant: "outline" as const },
    UNDER_MAINTENANCE: { label: "Under Maintenance", variant: "outline" as const },
    COMING_SOON: { label: "Coming Soon", variant: "secondary" as const },
  }

  const config = statusConfig[status] || { label: status, variant: "outline" as const }

  return (
    <Badge variant={config.variant}>{config.label}</Badge>
  )
} 