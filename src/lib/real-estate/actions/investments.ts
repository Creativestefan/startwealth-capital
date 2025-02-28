"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { Prisma } from "@prisma/client"
import type { InvestmentCreateInput, InvestmentUpdateInput } from "../types"
import { investmentCreateSchema, investmentUpdateSchema } from "../utils/validation"
import { calculateExpectedReturn, calculateInvestmentDuration } from "../utils/calculations"

export async function createInvestment(data: InvestmentCreateInput) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      throw new Error("Unauthorized")
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { wallet: true, kyc: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    if (!user.kyc || user.kyc.status !== "APPROVED") {
      throw new Error("KYC approval required")
    }

    // Validate input
    const validatedData = investmentCreateSchema.parse(data)

    if (!user.wallet || user.wallet.balance < validatedData.amount) {
      throw new Error("Insufficient funds")
    }

    const durationMonths = calculateInvestmentDuration(validatedData.type)
    const expectedReturn = calculateExpectedReturn(validatedData.type, validatedData.amount)

    const investment = await prisma.$transaction(async (tx) => {
      const investment = await tx.realEstateInvestment.create({
        data: {
          userId: user.id,
          type: validatedData.type,
          amount: new Prisma.Decimal(validatedData.amount),
          status: "ACTIVE",
          startDate: new Date(),
          endDate: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000),
          expectedReturn: new Prisma.Decimal(expectedReturn),
          reinvest: false,
        },
      })

      await tx.wallet.update({
        where: { id: user.wallet!.id },
        data: {
          balance: {
            decrement: validatedData.amount,
          },
        },
      })

      await tx.walletTransaction.create({
        data: {
          walletId: user.wallet!.id,
          type: "INVESTMENT",
          amount: validatedData.amount,
          status: "COMPLETED",
          cryptoType: "USDT",
          description: `Real Estate Investment - ${validatedData.type}`,
        },
      })

      return investment
    })

    revalidatePath("/dashboard/investments")
    return { success: true, data: investment }
  } catch (error) {
    console.error("[CREATE_INVESTMENT]", error)
    return { success: false, error: error instanceof Error ? error.message : "Something went wrong" }
  }
}

export async function updateInvestment(id: string, data: InvestmentUpdateInput) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      throw new Error("Unauthorized")
    }

    // Validate input
    const validatedData = investmentUpdateSchema.parse(data)

    const investment = await prisma.realEstateInvestment.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!investment) {
      throw new Error("Investment not found")
    }

    const updated = await prisma.realEstateInvestment.update({
      where: { id },
      data: validatedData,
    })

    revalidatePath("/dashboard/investments")
    return { success: true, data: updated }
  } catch (error) {
    console.error("[UPDATE_INVESTMENT]", error)
    return { success: false, error: error instanceof Error ? error.message : "Something went wrong" }
  }
}

