import type { Prisma, PropertyStatus, RealEstateInvestmentType, InvestmentStatus } from "@prisma/client"

// Property Types
export interface Property {
  id: string
  name: string
  description: string
  price: Prisma.Decimal
  location: string
  mapUrl?: string | null
  features: Record<string, any>
  mainImage: string
  images: string[]
  status: PropertyStatus
  minInvestment?: Prisma.Decimal | null
  maxInvestment?: Prisma.Decimal | null
  expectedReturn?: Prisma.Decimal | null
  createdAt: Date
  updatedAt: Date
}

// Investment Types
export interface RealEstateInvestment {
  id: string
  userId: string
  type: RealEstateInvestmentType
  amount: Prisma.Decimal
  status: InvestmentStatus
  startDate: Date
  endDate: Date
  expectedReturn: Prisma.Decimal
  actualReturn?: Prisma.Decimal | null
  reinvest: boolean
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PropertyResponse extends Property {
  transactions?: PropertyTransaction[]
}

export interface InvestmentResponse extends RealEstateInvestment {}

// Transaction Types
export interface PropertyTransaction {
  id: string
  propertyId: string
  userId: string
  amount: Prisma.Decimal
  type: "FULL" | "INSTALLMENT"
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
  installments?: number | null
  installmentAmount?: Prisma.Decimal | null
  nextPaymentDue?: Date | null
  paidInstallments: number
  createdAt: Date
  updatedAt: Date
  property?: Property
}

// Form Input Types
export type PropertyCreateInput = {
  name: string
  description: string
  price: number
  location: string
  mapUrl?: string | null
  features: Record<string, any>
  mainImage: string
  images: string[]
  status?: PropertyStatus
  minInvestment?: number | null
  maxInvestment?: number | null
  expectedReturn?: number | null
}

export type PropertyUpdateInput = Partial<PropertyCreateInput>

export type InvestmentCreateInput = {
  type: RealEstateInvestmentType
  amount: number
}

export type InvestmentUpdateInput = {
  reinvest: boolean
}
