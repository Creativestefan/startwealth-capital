import { EquipmentStatus, EquipmentType, GreenEnergyInvestmentType, InvestmentStatus, TransactionStatus } from "@prisma/client"
import { EQUIPMENT_TYPE_LABELS } from "../constants"

/**
 * Format currency values for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Format equipment type for display
 */
export function formatEquipmentType(type: EquipmentType): string {
  return EQUIPMENT_TYPE_LABELS[type] || type
}

/**
 * Format equipment status for display with color code
 */
export function formatEquipmentStatus(status: EquipmentStatus, stockQuantity?: number): { label: string; color: string } {
  // If stock quantity is provided, use it to determine availability
  if (stockQuantity !== undefined) {
    if (stockQuantity > 0) {
      return { label: 'In Stock', color: 'text-green-600' }
    } else {
      return { label: 'Out of Stock', color: 'text-red-600' }
    }
  }
  
  // Fall back to status-based formatting if stock quantity is not provided
  switch (status) {
    case 'AVAILABLE':
      return { label: 'Available', color: 'text-green-600' }
    case 'PENDING':
      return { label: 'Pending', color: 'text-yellow-600' }
    case 'SOLD':
      return { label: 'Sold Out', color: 'text-red-600' }
    default:
      return { label: status, color: 'text-gray-600' }
  }
}

/**
 * Format transaction status for display with color code
 */
export function formatTransactionStatus(status: TransactionStatus): { label: string; color: string } {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending', color: 'yellow' }
    case 'ACCEPTED':
      return { label: 'Accepted', color: 'blue' }
    case 'PROCESSING':
      return { label: 'Processing', color: 'purple' }
    case 'OUT_FOR_DELIVERY':
      return { label: 'Out for Delivery', color: 'orange' }
    case 'COMPLETED':
      return { label: 'Completed', color: 'green' }
    case 'FAILED':
      return { label: 'Failed', color: 'red' }
    case 'CANCELLED':
      return { label: 'Cancelled', color: 'red' }
    default:
      return { label: status, color: 'gray' }
  }
}

/**
 * Format investment status for display with color code
 */
export function formatInvestmentStatus(status: InvestmentStatus): { label: string; color: string } {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', color: 'green' }
    case 'MATURED':
      return { label: 'Matured', color: 'blue' }
    case 'CANCELLED':
      return { label: 'Cancelled', color: 'red' }
    default:
      return { label: status, color: 'gray' }
  }
}

/**
 * Format investment type for display
 */
export function formatInvestmentType(type: GreenEnergyInvestmentType): string {
  switch (type) {
    case 'SEMI_ANNUAL':
      return 'Semi-Annual'
    case 'ANNUAL':
      return 'Annual'
    default:
      return type
  }
}

/**
 * Format investment duration for display
 */
export function formatInvestmentDuration(months: number): string {
  if (months === 12) {
    return '1 Year'
  } else if (months === 6) {
    return '6 Months'
  } else {
    return `${months} Months`
  }
}

/**
 * Format return rate for display
 */
export function formatReturnRate(rate: number): string {
  return `${rate.toFixed(1)}%`
}

/**
 * Format address for display
 */
export function formatAddress(address: {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}): string {
  if (!address) return 'N/A'
  
  return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`
}

/**
 * Format user name for display
 */
export function formatUserName(user: { firstName: string; lastName: string } | null | undefined): string {
  if (!user) return 'N/A'
  
  return `${user.firstName} ${user.lastName}`
} 