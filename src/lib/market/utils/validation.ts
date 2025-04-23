import { z } from 'zod';
import { MarketPlanInput, MarketPlanType } from './constants';

/**
 * Market-specific validation schemas
 */

/**
 * Schema for validating market plan input
 */
export const marketPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  minAmount: z.coerce.number().positive("Minimum amount must be positive"),
  maxAmount: z.coerce.number().positive("Maximum amount must be positive"),
  returnRate: z.coerce.number().positive("Return rate must be positive"),
  durationMonths: z.coerce.number().int().positive("Duration must be a positive integer"),
  type: z.enum(["SEMI_ANNUAL", "ANNUAL"]).optional(),
});

/**
 * Schema for validating market investment input
 */
export const marketInvestmentSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  reinvest: z.boolean().default(false),
});

/**
 * Validates market plan data
 * @param data The data to validate
 * @returns Validated data or throws an error
 */
export function validateMarketPlan(data: MarketPlanInput): MarketPlanInput {
  // Basic validation
  if (!data.name || typeof data.name !== 'string') {
    throw new Error('Invalid name');
  }
  if (!data.description || typeof data.description !== 'string') {
    throw new Error('Invalid description');
  }
  if (typeof data.minAmount !== 'number' || data.minAmount <= 0) {
    throw new Error('Invalid minimum amount');
  }
  if (typeof data.maxAmount !== 'number' || data.maxAmount <= data.minAmount) {
    throw new Error('Maximum amount must be greater than minimum amount');
  }
  if (typeof data.returnRate !== 'number' || data.returnRate <= 0 || data.returnRate > 100) {
    throw new Error('Invalid return rate');
  }
  if (typeof data.durationMonths !== 'number' || data.durationMonths <= 0) {
    throw new Error('Invalid duration');
  }
  if (!data.type || !Object.values(MarketPlanType).includes(data.type)) {
    throw new Error('Invalid plan type');
  }

  return data;
}

/**
 * Validates market plan data with safe parsing
 * @param data The data to validate
 * @returns Result object with success flag and data or error
 */
export function validateMarketPlanSafe(data: MarketPlanInput): MarketPlanInput | null {
  try {
    return validateMarketPlan(data);
  } catch (error) {
    return null;
  }
}

/**
 * Validates market investment data
 * @param data The data to validate
 * @returns Validated data or throws an error
 */
export function validateMarketInvestment(data: unknown) {
  return marketInvestmentSchema.parse(data);
}

/**
 * Validates market investment data with safe parsing
 * @param data The data to validate
 * @returns Result object with success flag and data or error
 */
export function validateMarketInvestmentSafe(data: unknown) {
  return marketInvestmentSchema.safeParse(data);
} 