import { MarketInvestment, MarketInvestmentPlan as MarketPlan, MarketPlanType } from "@prisma/client"

export interface SerializedMarketPlan extends Omit<MarketPlan, "minAmount" | "maxAmount" | "returnRate"> {
  minAmount: number
  maxAmount: number
  returnRate: number
}

export interface SerializedMarketInvestment extends Omit<MarketInvestment, "amount" | "expectedReturn" | "actualReturn"> {
  amount: number
  expectedReturn: number
  actualReturn: number | null
  plan?: SerializedMarketPlan
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export type MarketInvestmentWithRelations = MarketInvestment & {
  plan?: MarketPlan
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
} 