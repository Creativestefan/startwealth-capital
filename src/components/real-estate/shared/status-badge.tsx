import type React from "react"
import { InvestmentStatusBadge } from "./investment-status-badge"

/**
 * @deprecated Use InvestmentStatusBadge instead
 */
export function StatusBadge(props: React.ComponentProps<typeof InvestmentStatusBadge>) {
  return <InvestmentStatusBadge {...props} />
}

