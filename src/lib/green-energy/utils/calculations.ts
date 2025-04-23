import type { GreenEnergyInvestmentType } from "@prisma/client"
import { GREEN_ENERGY_INVESTMENT_PLANS } from "../constants"

/**
 * Calculate investment duration in months based on investment type
 */
export function calculateGreenEnergyInvestmentDuration(type: GreenEnergyInvestmentType): number {
  return type === "SEMI_ANNUAL" ? 6 : 12 // Duration in months
}

/**
 * Calculate expected return based on investment type and amount
 */
export function calculateGreenEnergyExpectedReturn(type: GreenEnergyInvestmentType, amount: number): number {
  const rate = type === "SEMI_ANNUAL" ? 0.15 : 0.3 // 15% for semi-annual, 30% for annual
  return amount * rate
}

/**
 * Calculate estimated delivery date based on current date
 */
export function calculateEstimatedDeliveryDate(days: number = 14): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

/**
 * Calculate total price for equipment purchase
 */
export function calculateTotalPrice(unitPrice: number, quantity: number): number {
  return unitPrice * quantity
}

/**
 * Validate investment amount based on plan type
 */
export function isValidInvestmentAmount(type: GreenEnergyInvestmentType, amount: number): boolean {
  const plan = type === "SEMI_ANNUAL" 
    ? GREEN_ENERGY_INVESTMENT_PLANS.SEMI_ANNUAL 
    : GREEN_ENERGY_INVESTMENT_PLANS.ANNUAL
    
  return amount >= plan.minAmount && amount <= plan.maxAmount
} 