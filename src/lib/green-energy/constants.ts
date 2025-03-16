// Investment Plan Constants
export const GREEN_ENERGY_INVESTMENT_PLANS = {
  SEMI_ANNUAL: {
    name: "Semi-Annual Green Energy Plan",
    minAmount: 300_000, // $300,000
    maxAmount: 700_000, // $700,000
    durationMonths: 6,
    returnRate: 15, // 15% return
  },
  ANNUAL: {
    name: "Annual Green Energy Plan",
    minAmount: 1_500_000, // $1.5M
    maxAmount: 2_000_000, // $2M
    durationMonths: 12,
    returnRate: 30, // 30% return
  },
} as const

// Equipment Constants
export const EQUIPMENT_STATUS = {
  AVAILABLE: "AVAILABLE",
  PENDING: "PENDING",
  SOLD: "SOLD",
} as const

export const EQUIPMENT_TYPES = {
  SOLAR_PANEL: "SOLAR_PANEL",
  WIND_TURBINE: "WIND_TURBINE",
  BATTERY_STORAGE: "BATTERY_STORAGE",
  INVERTER: "INVERTER",
} as const

export const EQUIPMENT_TYPE_LABELS = {
  SOLAR_PANEL: "Solar Panel",
  WIND_TURBINE: "Wind Turbine",
  BATTERY_STORAGE: "Battery Storage",
  INVERTER: "Inverter",
} as const

// Transaction Constants
export const TRANSACTION_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const

// Investment Constants
export const INVESTMENT_STATUS = {
  ACTIVE: "ACTIVE",
  MATURED: "MATURED",
  CANCELLED: "CANCELLED",
} as const

// Feature Categories
export const EQUIPMENT_FEATURE_CATEGORIES = {
  BASIC: "Basic Information",
  TECHNICAL: "Technical Specifications",
  WARRANTY: "Warranty Information",
  INSTALLATION: "Installation Requirements",
  EFFICIENCY: "Efficiency Metrics",
} as const

// Delivery Constants
export const ESTIMATED_DELIVERY_DAYS = 14 // 2 weeks
export const SHIPPING_METHODS = {
  STANDARD: "Standard Shipping",
  EXPRESS: "Express Shipping",
  PICKUP: "In-Store Pickup",
} as const 