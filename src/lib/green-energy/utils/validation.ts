import { GreenEnergyInvestmentType } from "@prisma/client"
import { GREEN_ENERGY_INVESTMENT_PLANS } from "../constants"

/**
 * Validate if an investment amount is within the allowed range for a plan type
 */
export function validateInvestmentAmount(type: GreenEnergyInvestmentType, amount: number): {
  valid: boolean
  message?: string
} {
  const plan = type === "SEMI_ANNUAL" 
    ? GREEN_ENERGY_INVESTMENT_PLANS.SEMI_ANNUAL 
    : GREEN_ENERGY_INVESTMENT_PLANS.ANNUAL
  
  if (amount < plan.minAmount) {
    return {
      valid: false,
      message: `Minimum investment amount for ${plan.name} is ${plan.minAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })}`,
    }
  }
  
  if (amount > plan.maxAmount) {
    return {
      valid: false,
      message: `Maximum investment amount for ${plan.name} is ${plan.maxAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })}`,
    }
  }
  
  return { valid: true }
}

/**
 * Validate if equipment is available for purchase
 */
export function validateEquipmentAvailability(
  stockQuantity: number,
  requestedQuantity: number
): {
  valid: boolean
  message?: string
} {
  if (stockQuantity <= 0) {
    return {
      valid: false,
      message: "This equipment is out of stock",
    }
  }
  
  if (requestedQuantity > stockQuantity) {
    return {
      valid: false,
      message: `Only ${stockQuantity} units available`,
    }
  }
  
  return { valid: true }
}

/**
 * Validate delivery address
 */
export function validateDeliveryAddress(address: {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}): {
  valid: boolean
  message?: string
} {
  if (!address) {
    return {
      valid: false,
      message: "Delivery address is required",
    }
  }
  
  if (!address.street) {
    return {
      valid: false,
      message: "Street address is required",
    }
  }
  
  if (!address.city) {
    return {
      valid: false,
      message: "City is required",
    }
  }
  
  if (!address.state) {
    return {
      valid: false,
      message: "State is required",
    }
  }
  
  if (!address.postalCode) {
    return {
      valid: false,
      message: "Postal code is required",
    }
  }
  
  if (!address.country) {
    return {
      valid: false,
      message: "Country is required",
    }
  }
  
  return { valid: true }
} 