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
export function serializeEquipment(equipment: Equipment): SerializedEquipment {
  return {
    ...equipment,
    createdAt: equipment.createdAt.toISOString(),
    updatedAt: equipment.updatedAt.toISOString(),
  };
}

// Helper function to serialize Equipment Transaction
export function serializeEquipmentTransaction(transaction: EquipmentTransaction): SerializedEquipmentTransaction {
  return {
    ...transaction,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
    deliveryDate: transaction.deliveryDate?.toISOString(),
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
export function serializeGreenEnergyPlan(plan: GreenEnergyPlan): SerializedGreenEnergyPlan {
  return {
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

// Helper function to serialize Green Energy Investment
export function serializeGreenEnergyInvestment(investment: GreenEnergyInvestment): SerializedGreenEnergyInvestment {
  return {
    ...investment,
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