import { GreenEnergyInvestmentType, InvestmentStatus, EquipmentStatus, EquipmentType, TransactionStatus } from "@prisma/client";
import type { AuthUser as User } from "@/types/auth";

// Equipment type
export interface Equipment {
  id: string;
  name: string;
  description: string;
  features: string[];
  images: string[];
  price: number;
  status: EquipmentStatus;
  type: EquipmentType;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// Equipment with transactions
export interface EquipmentWithTransactions extends Equipment {
  transactions: EquipmentTransaction[];
}

// Equipment Transaction type
export interface EquipmentTransaction {
  id: string;
  userId: string;
  equipmentId: string;
  quantity: number;
  totalAmount: number;
  status: TransactionStatus;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  deliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  equipment?: Equipment;
}

// Green Energy Plan type
export interface GreenEnergyPlan {
  id: string;
  name: string;
  description: string;
  type: GreenEnergyInvestmentType;
  minAmount: number;
  maxAmount: number;
  returnRate: number;
  durationMonths: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Green Energy Investment type
export interface GreenEnergyInvestment {
  id: string;
  userId: string;
  planId: string;
  type: GreenEnergyInvestmentType;
  amount: number;
  status: InvestmentStatus;
  startDate: Date;
  endDate?: Date;
  expectedReturn: number;
  actualReturn?: number;
  reinvest: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  plan?: GreenEnergyPlan;
}

// Serialized versions for JSON responses
export type SerializedEquipment = Omit<Equipment, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type SerializedEquipmentTransaction = Omit<EquipmentTransaction, 'createdAt' | 'updatedAt' | 'deliveryDate' | 'user' | 'equipment'> & {
  createdAt: string;
  updatedAt: string;
  deliveryDate?: string;
  deliveryPin?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string | null;
  };
  equipment?: SerializedEquipment;
};

export type SerializedGreenEnergyPlan = Omit<GreenEnergyPlan, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type SerializedGreenEnergyInvestment = Omit<GreenEnergyInvestment, 'createdAt' | 'updatedAt' | 'startDate' | 'endDate' | 'user' | 'plan'> & {
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string | null;
  };
  plan?: SerializedGreenEnergyPlan;
};

// Helper function to serialize Equipment
export function serializeEquipment(equipment: any): SerializedEquipment {
  // Convert features and images from JSON to arrays if needed
  const features = Array.isArray(equipment.features) 
    ? equipment.features 
    : (typeof equipment.features === 'object' ? Object.values(equipment.features) : []);
  
  const images = Array.isArray(equipment.images) 
    ? equipment.images 
    : (typeof equipment.images === 'object' ? Object.values(equipment.images) : []);

  return {
    id: equipment.id,
    name: equipment.name,
    description: equipment.description,
    features: features,
    images: images,
    price: typeof equipment.price === 'object' && 'toNumber' in equipment.price 
      ? equipment.price.toNumber() 
      : Number(equipment.price),
    status: equipment.status,
    type: equipment.type,
    stockQuantity: equipment.stockQuantity,
    createdAt: equipment.createdAt.toISOString(),
    updatedAt: equipment.updatedAt.toISOString(),
  };
}

// Helper function to serialize Equipment Transaction
export function serializeEquipmentTransaction(transaction: any): SerializedEquipmentTransaction {
  return {
    id: transaction.id,
    userId: transaction.userId,
    equipmentId: transaction.equipmentId,
    quantity: transaction.quantity,
    totalAmount: typeof transaction.totalAmount === 'object' && 'toNumber' in transaction.totalAmount 
      ? transaction.totalAmount.toNumber() 
      : Number(transaction.totalAmount),
    status: transaction.status,
    deliveryAddress: transaction.deliveryAddress,
    trackingNumber: transaction.trackingNumber,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
    deliveryDate: transaction.deliveryDate?.toISOString(),
    deliveryPin: transaction.deliveryPin,
    user: transaction.user ? {
      id: transaction.user.id,
      firstName: transaction.user.firstName,
      lastName: transaction.user.lastName,
      email: transaction.user.email,
      image: transaction.user.image,
    } : undefined,
    equipment: transaction.equipment ? serializeEquipment(transaction.equipment) : undefined,
  };
}

// Helper function to serialize Green Energy Plan
export function serializeGreenEnergyPlan(plan: any): SerializedGreenEnergyPlan {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    type: plan.type,
    minAmount: typeof plan.minAmount === 'object' && 'toNumber' in plan.minAmount 
      ? plan.minAmount.toNumber() 
      : Number(plan.minAmount),
    maxAmount: typeof plan.maxAmount === 'object' && 'toNumber' in plan.maxAmount 
      ? plan.maxAmount.toNumber() 
      : Number(plan.maxAmount),
    returnRate: typeof plan.returnRate === 'object' && 'toNumber' in plan.returnRate 
      ? plan.returnRate.toNumber() 
      : Number(plan.returnRate),
    durationMonths: plan.durationMonths,
    image: plan.image || "",
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

// Helper function to serialize Green Energy Investment
export function serializeGreenEnergyInvestment(investment: any): SerializedGreenEnergyInvestment {
  return {
    id: investment.id,
    userId: investment.userId,
    planId: investment.planId,
    type: investment.type,
    amount: typeof investment.amount === 'object' && 'toNumber' in investment.amount 
      ? investment.amount.toNumber() 
      : Number(investment.amount),
    status: investment.status,
    expectedReturn: typeof investment.expectedReturn === 'object' && 'toNumber' in investment.expectedReturn 
      ? investment.expectedReturn.toNumber() 
      : Number(investment.expectedReturn),
    actualReturn: investment.actualReturn !== null && investment.actualReturn !== undefined
      ? (typeof investment.actualReturn === 'object' && 'toNumber' in investment.actualReturn 
        ? investment.actualReturn.toNumber() 
        : Number(investment.actualReturn))
      : undefined,
    reinvest: investment.reinvest,
    createdAt: investment.createdAt.toISOString(),
    updatedAt: investment.updatedAt.toISOString(),
    startDate: investment.startDate.toISOString(),
    endDate: investment.endDate?.toISOString(),
    user: investment.user ? {
      id: investment.user.id,
      firstName: investment.user.firstName,
      lastName: investment.user.lastName,
      email: investment.user.email,
      image: investment.user.image,
    } : undefined,
    plan: investment.plan ? serializeGreenEnergyPlan(investment.plan) : undefined,
  };
} 