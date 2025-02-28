// Investment Plan Constants
export const INVESTMENT_PLANS = {
    SEMI_ANNUAL: {
      name: "Semi-Annual Plan",
      minAmount: 300_000, // $300,000
      maxAmount: 700_000, // $700,000
      durationMonths: 6,
      returnRate: 0.15, // 15% return
    },
    ANNUAL: {
      name: "Annual Plan",
      minAmount: 1_500_000, // $1.5M
      maxAmount: 2_000_000, // $2M
      durationMonths: 12,
      returnRate: 0.3, // 30% return
    },
  } as const
  
  // Property Constants
  export const PROPERTY_STATUS = {
    AVAILABLE: "AVAILABLE",
    PENDING: "PENDING",
    SOLD: "SOLD",
  } as const
  
  export const TRANSACTION_STATUS = {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
  } as const
  
  export const TRANSACTION_TYPES = {
    FULL: "FULL",
    INSTALLMENT: "INSTALLMENT",
  } as const
  
  // Investment Constants
  export const INVESTMENT_STATUS = {
    ACTIVE: "ACTIVE",
    MATURED: "MATURED",
    CANCELLED: "CANCELLED",
  } as const
  
  // Payment Constants
  export const INSTALLMENT_PERIOD_DAYS = 30
  export const MAX_INSTALLMENTS = 3
  
  // Feature Categories
  export const PROPERTY_FEATURE_CATEGORIES = {
    BASIC: "Basic Information",
    AMENITIES: "Amenities",
    SECURITY: "Security Features",
    LOCATION: "Location Features",
    INVESTMENT: "Investment Details",
  } as const
  
  