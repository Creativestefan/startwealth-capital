import type { RealEstateInvestmentType } from "@prisma/client"

export function calculateInvestmentDuration(type: RealEstateInvestmentType): number {
  return type === "SEMI_ANNUAL" ? 6 : 12 // Duration in months
}

export function calculateExpectedReturn(type: RealEstateInvestmentType, amount: number): number {
  const rate = type === "SEMI_ANNUAL" ? 0.15 : 0.3 // 15% for semi-annual, 30% for annual
  return amount * rate
}

export function calculateInstallmentAmount(totalAmount: number, installments: number): number {
  return totalAmount / installments
}

export function calculateNextPaymentDate(startDate: Date = new Date()): Date {
  return new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from start
}

