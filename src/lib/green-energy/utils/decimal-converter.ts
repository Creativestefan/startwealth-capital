import { Decimal } from "@prisma/client/runtime/library"
import { Equipment, EquipmentTransaction, GreenEnergyInvestment, GreenEnergyPlan } from "../types"

/**
 * Check if a value is a Decimal instance
 */
function isDecimal(value: any): value is Decimal {
  return value !== null && 
         typeof value === 'object' && 
         typeof value.toNumber === 'function' &&
         typeof value.toString === 'function'
}

/**
 * Convert Decimal to number in a single object
 */
export function convertDecimalToNumber<T extends Record<string, any>>(obj: T): T {
  if (!obj) return obj

  const result = { ...obj }
  
  for (const key in result) {
    if (isDecimal(result[key])) {
      result[key] = result[key].toNumber() as any
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = convertDecimalToNumber(result[key])
    }
  }
  
  return result
}

/**
 * Convert Decimal to number in an array of objects
 */
export function convertDecimalsToNumbers<T extends Record<string, any>>(arr: T[]): T[] {
  if (!arr || !Array.isArray(arr)) return arr
  
  return arr.map(item => convertDecimalToNumber(item))
}

/**
 * Convert Equipment object Decimal fields to numbers
 */
export function convertEquipmentDecimals(equipment: Equipment): Equipment {
  if (!equipment) return equipment
  
  return {
    ...equipment,
    price: isDecimal(equipment.price) ? equipment.price.toNumber() : equipment.price,
  }
}

/**
 * Convert Equipment Transaction object Decimal fields to numbers
 */
export function convertEquipmentTransactionDecimals(transaction: EquipmentTransaction): EquipmentTransaction {
  if (!transaction) return transaction
  
  return {
    ...transaction,
    totalAmount: isDecimal(transaction.totalAmount) ? transaction.totalAmount.toNumber() : transaction.totalAmount,
    equipment: transaction.equipment ? convertEquipmentDecimals(transaction.equipment) : undefined,
  }
}

/**
 * Convert Green Energy Plan object Decimal fields to numbers
 */
export function convertGreenEnergyPlanDecimals(plan: GreenEnergyPlan): GreenEnergyPlan {
  if (!plan) return plan
  
  return {
    ...plan,
    minAmount: isDecimal(plan.minAmount) ? plan.minAmount.toNumber() : plan.minAmount,
    maxAmount: isDecimal(plan.maxAmount) ? plan.maxAmount.toNumber() : plan.maxAmount,
    returnRate: isDecimal(plan.returnRate) ? plan.returnRate.toNumber() : plan.returnRate,
  }
}

/**
 * Convert Green Energy Investment object Decimal fields to numbers
 */
export function convertGreenEnergyInvestmentDecimals(investment: GreenEnergyInvestment): GreenEnergyInvestment {
  if (!investment) return investment
  
  return {
    ...investment,
    amount: isDecimal(investment.amount) ? investment.amount.toNumber() : investment.amount,
    expectedReturn: isDecimal(investment.expectedReturn) ? investment.expectedReturn.toNumber() : investment.expectedReturn,
    actualReturn: investment.actualReturn && isDecimal(investment.actualReturn) 
      ? investment.actualReturn.toNumber() 
      : investment.actualReturn,
    plan: investment.plan ? convertGreenEnergyPlanDecimals(investment.plan) : undefined,
  }
} 