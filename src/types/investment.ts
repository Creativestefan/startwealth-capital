import type {
  PropertyStatus,
  PropertyTransactionType,
  TransactionStatus,
  EquipmentStatus,
  EquipmentType,
  MarketPlanType,
  InvestmentStatus,
  RealEstateInvestmentType,
  GreenEnergyInvestmentType,
  Prisma,
} from "@prisma/client"

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
  transactions?: PropertyTransaction[]
}

export interface Equipment {
  id: string
  name: string
  description: string
  type: EquipmentType
  price: number
  specifications: Record<string, any>
  images: string[]
  status: EquipmentStatus
  stock: number
  minOrder: number
  maxOrder?: number | null
  createdAt: Date
  updatedAt: Date
  transactions?: EquipmentTransaction[]
}

export interface PropertyTransaction {
  id: string
  propertyId: string
  userId: string
  amount: Prisma.Decimal
  type: PropertyTransactionType
  status: TransactionStatus
  installments?: number | null
  installmentAmount?: Prisma.Decimal | null
  nextPaymentDue?: Date | null
  paidInstallments: number
  createdAt: Date
  updatedAt: Date
  property: Property
}

export interface EquipmentTransaction {
  id: string
  equipmentId: string
  userId: string
  amount: number
  quantity: number
  deliveryAddress: string
  trackingNumber?: string | null
  status: TransactionStatus
  estimatedDelivery?: Date | null
  createdAt: Date
  updatedAt: Date
  equipment: Equipment
}

export interface MarketInvestment {
  id: string
  userId: string
  planType: MarketPlanType
  amount: number
  status: InvestmentStatus
  startDate: Date
  endDate: Date
  expectedReturn: number
  actualReturn?: number | null
  reinvest: boolean
  createdAt: Date
  updatedAt: Date
}

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

export interface GreenEnergyInvestment {
  id: string
  userId: string
  type: GreenEnergyInvestmentType
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

