import { INVESTMENT_PLANS } from "../constants"
import type { Property, RealEstateInvestment, SerializedRealEstateInvestment } from "../types"
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
 * Formats property price
 */
export function formatPriceRange(property: Property): string {
  return formatCurrency(property.price)
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

/**
 * Recursively converts all Decimal objects to regular numbers in an object or array
 * This is needed because Decimal objects from Prisma cannot be passed to Client Components
 */
export function serializeData(data: any): any {
  // Handle null or undefined
  if (data == null) {
    return data;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle Decimal objects (checking for toNumber method which is present on Decimal)
  if (typeof data === 'object' && data !== null && typeof data.toNumber === 'function') {
    return data.toNumber();
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }

  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serializeData(data[key]);
      }
    }
    return result;
  }

  // Return primitive values as is
  return data;
}

/**
 * Serializes a RealEstateInvestment object for client-side use
 * Converts Decimal and Date objects to regular JS types and handles referral fields
 */
export function serializeRealEstateInvestment(investment: any): SerializedRealEstateInvestment {
  return {
    id: investment.id,
    userId: investment.userId,
    type: investment.type,
    amount: typeof investment.amount === 'object' && investment.amount !== null && typeof investment.amount.toNumber === 'function' 
      ? investment.amount.toNumber() 
      : Number(investment.amount),
    status: investment.status,
    startDate: investment.startDate instanceof Date ? investment.startDate.toISOString() : investment.startDate,
    endDate: investment.endDate instanceof Date ? investment.endDate.toISOString() : investment.endDate,
    expectedReturn: typeof investment.expectedReturn === 'object' && investment.expectedReturn !== null && typeof investment.expectedReturn.toNumber === 'function'
      ? investment.expectedReturn.toNumber()
      : Number(investment.expectedReturn),
    actualReturn: investment.actualReturn === null ? null : 
      (typeof investment.actualReturn === 'object' && investment.actualReturn !== null && typeof investment.actualReturn.toNumber === 'function'
        ? investment.actualReturn.toNumber()
        : Number(investment.actualReturn)),
    reinvest: investment.reinvest,
    createdAt: investment.createdAt instanceof Date ? investment.createdAt.toISOString() : investment.createdAt,
    updatedAt: investment.updatedAt instanceof Date ? investment.updatedAt.toISOString() : investment.updatedAt,
    referralId: investment.referralId || null,
    commissionAmount: investment.commissionAmount === null || investment.commissionAmount === undefined ? null : 
      (typeof investment.commissionAmount === 'object' && investment.commissionAmount !== null && typeof investment.commissionAmount.toNumber === 'function'
        ? investment.commissionAmount.toNumber()
        : Number(investment.commissionAmount)),
    commissionPaid: investment.commissionPaid ?? false,
    user: investment.user
  };
}

