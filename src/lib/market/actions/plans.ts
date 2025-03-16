'use server'

import { revalidatePath } from "next/cache"
import { PrismaClient, type MarketInvestmentPlan } from "@prisma/client"
import { MarketPlanType, MarketPlanInput } from "@/lib/market/utils/constants"
import { prisma } from "@/lib/prisma"
import type { SerializedMarketPlan } from "../types"

export async function createMarketPlan(data: MarketPlanInput) {
  const prisma = new PrismaClient()
  
  try {
    if (!prisma.marketInvestmentPlan) {
      console.error("marketInvestmentPlan model not available in Prisma client")
      await prisma.$disconnect()
      throw new Error("Market investment plan model not available")
    }
    
    const plan = await prisma.marketInvestmentPlan.create({
      data: {
        name: data.name,
        description: data.description,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        returnRate: data.returnRate,
        durationMonths: data.durationMonths,
        type: data.type,
      },
    })

    revalidatePath("/admin/markets/plans")
    await prisma.$disconnect()
    
    return plan
  } catch (error) {
    console.error("Error creating market plan:", error)
    await prisma.$disconnect()
    throw new Error(error instanceof Error ? error.message : "Failed to create market plan")
  }
}

export async function updateMarketPlan(id: string, data: MarketPlanInput) {
  const prisma = new PrismaClient()
  
  try {
    if (!prisma.marketInvestmentPlan) {
      console.error("marketInvestmentPlan model not available in Prisma client")
      await prisma.$disconnect()
      throw new Error("Market investment plan model not available")
    }
    
    const plan = await prisma.marketInvestmentPlan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        returnRate: data.returnRate,
        durationMonths: data.durationMonths,
        type: data.type,
      },
    })

    revalidatePath("/admin/markets/plans")
    await prisma.$disconnect()
    
    return plan
  } catch (error) {
    console.error("Error updating market plan:", error)
    await prisma.$disconnect()
    throw new Error(error instanceof Error ? error.message : "Failed to update market plan")
  }
}

export async function deleteMarketPlan(id: string) {
  const prisma = new PrismaClient()
  
  try {
    if (!prisma.marketInvestmentPlan) {
      console.error("marketInvestmentPlan model not available in Prisma client")
      await prisma.$disconnect()
      throw new Error("Market investment plan model not available")
    }
    
    await prisma.marketInvestmentPlan.delete({
      where: { id },
    })

    revalidatePath("/admin/markets/plans")
    await prisma.$disconnect()
  } catch (error) {
    console.error("Error deleting market plan:", error)
    await prisma.$disconnect()
    throw new Error(error instanceof Error ? error.message : "Failed to delete market plan")
  }
}

export async function getMarketPlans() {
  const prisma = new PrismaClient()
  
  try {
    if (!prisma.marketInvestmentPlan) {
      console.error("marketInvestmentPlan model not available in Prisma client")
      await prisma.$disconnect()
      throw new Error("Market investment plan model not available")
    }
    
    const plans = await prisma.marketInvestmentPlan.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    await prisma.$disconnect()
    return plans
  } catch (error) {
    console.error("Error fetching market plans:", error)
    await prisma.$disconnect()
    throw new Error(error instanceof Error ? error.message : "Failed to fetch market plans")
  }
}

export async function getAllMarketPlans(): Promise<{ success: boolean; data?: SerializedMarketPlan[]; error?: string }> {
  try {
    const plans = await prisma.marketInvestmentPlan.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

    // Serialize the plans data
    const serializedPlans: SerializedMarketPlan[] = plans.map((plan: MarketInvestmentPlan) => ({
      ...plan,
      minAmount: Number(plan.minAmount),
      maxAmount: Number(plan.maxAmount),
      returnRate: Number(plan.returnRate),
    }))

    return { success: true, data: serializedPlans }
  } catch (error) {
    console.error("Error fetching market plans:", error)
    return { success: false, error: "Failed to fetch plans" }
  }
}

export async function getMarketPlanById(
  id: string
): Promise<{ success: boolean; data?: SerializedMarketPlan; error?: string }> {
  try {
    const plan = await prisma.marketInvestmentPlan.findUnique({
      where: { id }
    })

    if (!plan) {
      return { success: false, error: "Plan not found" }
    }

    // Serialize the plan data
    const serializedPlan: SerializedMarketPlan = {
      ...plan,
      minAmount: Number(plan.minAmount),
      maxAmount: Number(plan.maxAmount),
      returnRate: Number(plan.returnRate),
    }

    return { success: true, data: serializedPlan }
  } catch (error) {
    console.error("Error fetching market plan:", error)
    return { success: false, error: "Failed to fetch plan" }
  }
} 