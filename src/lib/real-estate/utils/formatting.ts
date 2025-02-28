import { INVESTMENT_PLANS } from "../constants"
import type { Property, RealEstateInvestment } from "../types"
import { Prisma } from "@prisma/client"

/**
 * Formats a number as currency
 */
export function formatCurrency(amount: number | string | Prisma.Decimal | null | undefined): string {
  if (amount === null || amount === undefined) return "$0.00"

  const num =
    typeof amount === "string"
      ? Number.parseFloat(amount)
      : amount instanceof Prisma.Decimal
        ? Number.parseFloat(amount.toString())
        : amount

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A"

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

/**
 * Formats investment duration
 */
export function formatDuration(months: number): string {
  return months === 12 ? "1 Year" : `${months} Months`
}

/**
 * Formats investment return rate as percentage
 */
export function formatReturnRate(type: keyof typeof INVESTMENT_PLANS): string {
  const rate = INVESTMENT_PLANS[type].returnRate * 100
  return `${rate}%`
}

/**
 * Formats property price range
 */
export function formatPriceRange(property: Property): string {
  const { minInvestment, maxInvestment, price } = property

  if (!minInvestment && !maxInvestment) return formatCurrency(price)
  if (!maxInvestment) return `From ${formatCurrency(minInvestment)}`
  if (!minInvestment) return `Up to ${formatCurrency(maxInvestment)}`

  return `${formatCurrency(minInvestment)} - ${formatCurrency(maxInvestment)}`
}

/**
 * Formats investment status with color
 */
export function formatInvestmentStatus(investment: RealEstateInvestment): {
  label: string
  color: string
} {
  const statusMap = {
    ACTIVE: { label: "Active", color: "text-green-500" },
    MATURED: { label: "Matured", color: "text-blue-500" },
    CANCELLED: { label: "Cancelled", color: "text-red-500" },
  }

  return statusMap[investment.status]
}

/**
 * Formats property features for display
 */
export function formatPropertyFeatures(features: Record<string, any>): string[] {
  return Object.entries(features)
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        return value ? key.replace(/([A-Z])/g, " $1").trim() : ""
      }
      return `${key.replace(/([A-Z])/g, " $1").trim()}: ${value}`
    })
    .filter(Boolean)
}

/**
 * Formats investment progress
 */
export function formatInvestmentProgress(investment: RealEstateInvestment): { progress: number; daysLeft: number } {
  const now = new Date()
  const start = new Date(investment.startDate)
  const end = new Date(investment.endDate)
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const elapsedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

  const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100)
  const daysLeft = Math.max(Math.ceil(totalDays - elapsedDays), 0)

  return { progress, daysLeft }
}

