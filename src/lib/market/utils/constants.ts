/**
 * Market-specific constants
 */

/**
 * Market plan types
 */
export enum MarketPlanType {
  SEMI_ANNUAL = "SEMI_ANNUAL",
  ANNUAL = "ANNUAL",
}

/**
 * Investment status types
 */
export enum InvestmentStatus {
  ACTIVE = "ACTIVE",
  MATURED = "MATURED",
  CANCELLED = "CANCELLED",
}

/**
 * Default minimum investment amount
 */
export const DEFAULT_MIN_INVESTMENT = 300000;

/**
 * Default maximum investment amount
 */
export const DEFAULT_MAX_INVESTMENT = 700000;

/**
 * Default return rate for semi-annual plans
 */
export const DEFAULT_SEMI_ANNUAL_RETURN_RATE = 15;

/**
 * Default return rate for annual plans
 */
export const DEFAULT_ANNUAL_RETURN_RATE = 30;

/**
 * Default duration for semi-annual plans (in months)
 */
export const DEFAULT_SEMI_ANNUAL_DURATION = 6;

/**
 * Default duration for annual plans (in months)
 */
export const DEFAULT_ANNUAL_DURATION = 12;

/**
 * Market plan display names
 */
export const PLAN_TYPE_DISPLAY_NAMES = {
  [MarketPlanType.SEMI_ANNUAL]: "Semi-Annual",
  [MarketPlanType.ANNUAL]: "Annual",
};

/**
 * Investment status display names
 */
export const INVESTMENT_STATUS_DISPLAY_NAMES = {
  [InvestmentStatus.ACTIVE]: "Active",
  [InvestmentStatus.MATURED]: "Matured",
  [InvestmentStatus.CANCELLED]: "Cancelled",
};

export interface MarketPlanInput {
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  returnRate: number;
  durationMonths: number;
  type: MarketPlanType;
} 