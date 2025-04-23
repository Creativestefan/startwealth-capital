import { MarketInvestment, MarketInvestmentPlan } from "@prisma/client"
import { SerializedMarketInvestment, SerializedMarketPlan } from "../types"

/**
 * Serializes a market investment with proper number conversions and includes all required fields
 * for the SerializedMarketInvestment type, especially the referral-related fields
 */
export function serializeMarketInvestment(
  investment: MarketInvestment & {
    plan?: MarketInvestmentPlan
    user?: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }
): SerializedMarketInvestment {
  // Serialize the plan if it exists
  const serializedPlan: SerializedMarketPlan | undefined = investment.plan
    ? {
        ...investment.plan,
        minAmount: Number(investment.plan.minAmount),
        maxAmount: Number(investment.plan.maxAmount),
        returnRate: Number(investment.plan.returnRate),
      }
    : undefined

  return {
    id: investment.id,
    userId: investment.userId,
    planId: investment.planId,
    amount: Number(investment.amount),
    expectedReturn: Number(investment.expectedReturn),
    actualReturn: investment.actualReturn ? Number(investment.actualReturn) : null,
    startDate: investment.startDate,
    endDate: investment.endDate,
    status: investment.status,
    reinvest: investment.reinvest,
    createdAt: investment.createdAt,
    updatedAt: investment.updatedAt,
    plan: serializedPlan,
    user: investment.user,
    // Important: Include referral fields with proper defaults if not present
    referralId: investment.referralId || null,
    commissionAmount: investment.commissionAmount === null || investment.commissionAmount === undefined 
      ? null 
      : Number(investment.commissionAmount),
    commissionPaid: investment.commissionPaid ?? false,
  }
} 