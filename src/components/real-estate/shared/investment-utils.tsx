import type { RealEstateInvestment } from "@/lib/real-estate/types"
import { formatCurrency, formatDate } from "@/lib/real-estate/utils/formatting"

/**
 * Calculate investment progress and related metrics
 */
export function calculateInvestmentProgress(investment: RealEstateInvestment) {
  const now = new Date()
  const start = new Date(investment.startDate)
  const end = new Date(investment.endDate)
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const elapsedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100)
  const daysLeft = Math.max(Math.ceil(totalDays - elapsedDays), 0)

  return {
    progress,
    daysLeft,
    totalDays,
    elapsedDays,
    formattedProgress: `${Math.round(progress)}%`,
    formattedDaysLeft: `${daysLeft} days left`,
    startDate: formatDate(start),
    endDate: formatDate(end),
  }
}

/**
 * Get investment status with appropriate styling
 */
export function getInvestmentStatusDetails(status: string) {
  const statusMap = {
    ACTIVE: { label: "Active", variant: "default", color: "text-green-500" },
    MATURED: { label: "Matured", variant: "secondary", color: "text-blue-500" },
    CANCELLED: { label: "Cancelled", variant: "destructive", color: "text-red-500" },
    AVAILABLE: { label: "Available", variant: "default", color: "text-green-500" },
    PENDING: { label: "Pending", variant: "secondary", color: "text-yellow-500" },
    SOLD: { label: "Sold", variant: "outline", color: "text-gray-500" },
  }

  return statusMap[status as keyof typeof statusMap] || statusMap.ACTIVE
}

/**
 * Format investment type for display
 */
export function formatInvestmentType(type: string) {
  return `${type.replace(/_/g, " ")} Investment`
}

/**
 * Get investment summary data
 */
export function getInvestmentSummary(investment: RealEstateInvestment) {
  return {
    type: formatInvestmentType(investment.type),
    amount: formatCurrency(investment.amount),
    expectedReturn: formatCurrency(investment.expectedReturn),
    actualReturn: investment.actualReturn ? formatCurrency(investment.actualReturn) : null,
    investedOn: formatDate(investment.startDate),
    endDate: formatDate(investment.endDate),
    status: getInvestmentStatusDetails(investment.status),
  }
}

