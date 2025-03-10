import type { Prisma, PropertyStatus, RealEstateInvestmentType, InvestmentStatus, PropertyTransactionType } from "@prisma/client"

// Property types
export interface Property {
  id: string
  name: string
  description: string
  price: number
  location: string
  mapUrl?: string | null
  features: Prisma.JsonValue
  mainImage: string
  images: string[]
  status: PropertyStatus
  createdAt: Date
  updatedAt: Date
}

// Property transaction types
export interface PropertyTransaction {
  id: string
  propertyId: string
  userId: string
  amount: number
  type: "FULL" | "INSTALLMENT"
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
  installments?: number | null
  installmentAmount?: number | null
  nextPaymentDue?: Date | null
  paidInstallments: number
  createdAt: Date
  updatedAt: Date
  property?: Property
  user?: {
    id: string
    firstName?: string
    lastName?: string
    email?: string
  }
}

// Investment types
export interface RealEstateInvestment {
  id: string
  userId: string
  type: RealEstateInvestmentType
  amount: number
  status: InvestmentStatus
  startDate: Date
  endDate: Date
  expectedReturn: number
  actualReturn?: number | null
  reinvest: boolean
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    firstName?: string
    lastName?: string
    email?: string
  }
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
  requiresKyc?: boolean
}

export interface PropertyResponse extends Property {
  transactions?: PropertyTransaction[]
}

export interface InvestmentResponse extends RealEstateInvestment {}

// Investment plan constants
export interface InvestmentPlan {
  name: string
  description: string
  durationMonths: number
  minAmount: number
  maxAmount: number
  returnRate: number
}

// Form Input Types
export interface PropertyFilters {
  status?: PropertyStatus
  minPrice?: number
  maxPrice?: number
  location?: string
}

export interface PropertyCreateInput {
  name: string
  description: string
  price: number
  location: string
  mapUrl?: string
  features?: Record<string, any>
  mainImage?: string
  images?: string[]
  status?: PropertyStatus
}

export interface PropertyUpdateInput extends Partial<PropertyCreateInput> {}

export interface PropertyTransactionInput {
  propertyId: string
  amount: number
  type: PropertyTransactionType
  installments?: number
}

export type InvestmentCreateInput = {
  type: RealEstateInvestmentType
  amount: number
}

export type InvestmentUpdateInput = {
  reinvest: boolean
}

