import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface InvestmentStatusBadgeProps {
  status: string
  className?: string
}

/**
 * Displays a badge indicating the status of an investment or property
 * Used across both property and investment components
 */
export function InvestmentStatusBadge({ status, className }: InvestmentStatusBadgeProps) {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    ACTIVE: { 
      label: "Active", 
      variant: "default", 
      className: "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200" 
    },
    MATURED: { 
      label: "Matured", 
      variant: "secondary", 
      className: "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200" 
    },
    CANCELLED: { 
      label: "Cancelled", 
      variant: "destructive", 
      className: "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200" 
    },
    AVAILABLE: { 
      label: "Available", 
      variant: "default", 
      className: "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200" 
    },
    PENDING: { 
      label: "Pending", 
      variant: "secondary", 
      className: "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200" 
    },
    SOLD: { 
      label: "Sold", 
      variant: "outline", 
      className: "bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200" 
    },
  }

  const statusInfo = statusMap[status] || { 
    label: status, 
    variant: "default", 
    className: "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200" 
  }

  return (
    <Badge 
      variant={statusInfo.variant} 
      className={cn(
        "font-medium text-xs px-2.5 py-1 rounded-md shadow-sm", 
        statusInfo.className, 
        className
      )}
    >
      {statusInfo.label}
    </Badge>
  )
}

