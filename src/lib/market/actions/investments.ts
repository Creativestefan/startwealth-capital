"use server";

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { InvestmentStatus, TransactionType, Prisma, type PrismaClient, type Wallet } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import type { MarketInvestmentWithRelations, SerializedMarketInvestment, SerializedMarketPlan } from "../types"
import { redirect } from "next/navigation"

// Wallet actions
async function getUserWallet(userId: string): Promise<{ success: boolean; data?: Wallet; error?: string }> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        id: true,
        balance: true,
        userId: true,
        btcAddress: true,
        usdtAddress: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }

    return { success: true, data: wallet }
  } catch (error) {
    console.error("Error fetching wallet:", error)
    return { success: false, error: "Failed to fetch wallet" }
  }
}

export async function investInMarket(
  planId: string,
  amount: number,
): Promise<{ success: boolean; data?: SerializedMarketInvestment; error?: string; requiresKyc?: boolean }> {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized. Please log in to continue." }
    }

    const userId = session.user.id
    
    // Check KYC status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kyc: true
      }
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    if (!user.kyc || user.kyc.status !== "APPROVED") {
      return { 
        success: false, 
        error: "KYC verification required to make investments",
        requiresKyc: true
      }
    }

    // Get investment plan
    const plan = await prisma.marketInvestmentPlan.findUnique({
      where: { id: planId },
      select: {
        id: true,
        name: true,
        minAmount: true,
        maxAmount: true,
        returnRate: true,
        durationMonths: true,
        type: true,
      }
    })

    if (!plan) {
      return { success: false, error: "Investment plan not found" }
    }

    // Validate investment amount
    const minAmount = Number(plan.minAmount)
    const maxAmount = Number(plan.maxAmount)

    if (amount < minAmount || amount > maxAmount) {
      return { 
        success: false, 
        error: `Investment amount must be between ${minAmount} and ${maxAmount}` 
      }
    }

    // Check wallet balance
    const walletResult = await getUserWallet(userId)
    if (!walletResult.success || !walletResult.data) {
      return { success: false, error: "Could not fetch wallet" }
    }

    const wallet = walletResult.data
    if (wallet.balance < amount) {
      return { success: false, error: "Insufficient balance in your wallet" }
    }

    // Calculate expected return
    const expectedReturn = (amount * Number(plan.returnRate)) / 100

    // Create investment using transaction
    const investment = await prisma.$transaction(async (tx) => {
      // Create investment
      const investment = await tx.marketInvestment.create({
        data: {
          userId: userId,
          planId: plan.id,
          amount: new Prisma.Decimal(amount),
          expectedReturn: new Prisma.Decimal(expectedReturn),
          actualReturn: null,
          status: InvestmentStatus.ACTIVE,
          startDate: new Date(),
          endDate: new Date(Date.now() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000), // More accurate month calculation
          reinvest: false,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          plan: true,
        }
      })

      // Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount
          }
        }
      })

      // Create wallet transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: -amount,
          type: TransactionType.INVESTMENT,
          description: `Investment in ${plan.name}`,
          status: "COMPLETED",
          cryptoType: "USDT",
        }
      })

      return investment
    })

    // Serialize the investment data
    const serializedPlan: SerializedMarketPlan = {
      ...investment.plan,
      minAmount: Number(investment.plan.minAmount),
      maxAmount: Number(investment.plan.maxAmount),
      returnRate: Number(investment.plan.returnRate),
    }

    const serializedInvestment: SerializedMarketInvestment = {
      id: investment.id,
      userId: investment.userId,
      planId: investment.planId,
      amount: Number(investment.amount),
      expectedReturn: Number(investment.expectedReturn),
      actualReturn: investment.actualReturn ? Number(investment.actualReturn) : null,
      startDate: investment.startDate,
      endDate: investment.endDate,
      status: investment.status,
      reinvest: investment.reinvest,
      createdAt: investment.createdAt,
      updatedAt: investment.updatedAt,
      plan: serializedPlan,
      user: investment.user,
    }

    // Revalidate relevant paths
    revalidatePath("/markets/portfolio")
    revalidatePath("/dashboard")
    revalidatePath("/wallet")
    revalidatePath("/admin/markets/transactions")

    return { success: true, data: serializedInvestment }
  } catch (error) {
    console.error("Error investing in market:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to make investment"
    return { success: false, error: errorMessage }
  }
}

export async function getUserMarketInvestments(): Promise<{ success: boolean; data?: SerializedMarketInvestment[]; error?: string }> {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" }
    }

    const investments = await prisma.marketInvestment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Serialize the investments data
    const serializedInvestments: SerializedMarketInvestment[] = investments.map(investment => {
      const serializedPlan: SerializedMarketPlan = {
        ...investment.plan,
        minAmount: Number(investment.plan.minAmount),
        maxAmount: Number(investment.plan.maxAmount),
        returnRate: Number(investment.plan.returnRate),
      }

      return {
        id: investment.id,
        userId: investment.userId,
        planId: investment.planId,
        amount: Number(investment.amount),
        expectedReturn: Number(investment.expectedReturn),
        actualReturn: investment.actualReturn ? Number(investment.actualReturn) : null,
        startDate: investment.startDate,
        endDate: investment.endDate,
        status: investment.status,
        reinvest: investment.reinvest,
        createdAt: investment.createdAt,
        updatedAt: investment.updatedAt,
        plan: serializedPlan,
        user: investment.user,
      }
    })

    return { success: true, data: serializedInvestments }
  } catch (error) {
    console.error("Error fetching user market investments:", error)
    return { success: false, error: "Failed to fetch investments" }
  }
}

export async function getMarketInvestmentById(
  id: string
): Promise<{ success: boolean; data?: SerializedMarketInvestment; error?: string }> {
  try {
    const investment = await prisma.marketInvestment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        plan: true,
      }
    })

    if (!investment) {
      return { success: false, error: "Investment not found" }
    }

    // Serialize the investment data
    const serializedPlan: SerializedMarketPlan = {
      ...investment.plan,
      minAmount: Number(investment.plan.minAmount),
      maxAmount: Number(investment.plan.maxAmount),
      returnRate: Number(investment.plan.returnRate),
    }

    const serializedInvestment: SerializedMarketInvestment = {
      id: investment.id,
      userId: investment.userId,
      planId: investment.planId,
      amount: Number(investment.amount),
      expectedReturn: Number(investment.expectedReturn),
      actualReturn: investment.actualReturn ? Number(investment.actualReturn) : null,
      startDate: investment.startDate,
      endDate: investment.endDate,
      status: investment.status,
      reinvest: investment.reinvest,
      createdAt: investment.createdAt,
      updatedAt: investment.updatedAt,
      plan: serializedPlan,
      user: investment.user,
    }

    return { success: true, data: serializedInvestment }
  } catch (error) {
    console.error("Error fetching market investment:", error)
    return { success: false, error: "Failed to fetch investment" }
  }
}

export async function getAllMarketInvestments(): Promise<{ success: boolean; data?: SerializedMarketInvestment[]; error?: string }> {
  try {
    const investments = await prisma.marketInvestment.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        plan: true,
      }
    })

    // Serialize the investments data
    const serializedInvestments: SerializedMarketInvestment[] = investments.map(investment => {
      const serializedPlan: SerializedMarketPlan = {
        ...investment.plan,
        minAmount: Number(investment.plan.minAmount),
        maxAmount: Number(investment.plan.maxAmount),
        returnRate: Number(investment.plan.returnRate),
      }

      const serializedInvestment: SerializedMarketInvestment = {
        id: investment.id,
        userId: investment.userId,
        planId: investment.planId,
        amount: Number(investment.amount),
        expectedReturn: Number(investment.expectedReturn),
        actualReturn: investment.actualReturn ? Number(investment.actualReturn) : null,
        startDate: investment.startDate,
        endDate: investment.endDate,
        status: investment.status,
        reinvest: investment.reinvest,
        createdAt: investment.createdAt,
        updatedAt: investment.updatedAt,
        plan: serializedPlan,
        user: investment.user,
      }

      return serializedInvestment
    })

    return { success: true, data: serializedInvestments }
  } catch (error) {
    console.error("Error fetching market investments:", error)
    return { success: false, error: "Failed to fetch investments" }
  }
} 