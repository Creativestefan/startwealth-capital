export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { investmentCreateSchema } from "@/lib/real-estate/utils/validation"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { calculateExpectedReturn, calculateInvestmentDuration } from "@/lib/real-estate/utils/calculations"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const where: unknown = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    const investments = await prisma.realEstateInvestment.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(investments)
  } catch (error) {
    console.error("[INVESTMENTS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { wallet: true, kyc: true },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (!user.kyc || user.kyc.status !== "APPROVED") {
      return new NextResponse("KYC approval required", { status: 403 })
    }

    const json = await request.json()

    // Validate the request body
    const validatedData = investmentCreateSchema.parse(json)
    const { type, amount } = validatedData

    // Validate amount based on investment type
    const minAmount = type === "SEMI_ANNUAL" ? 300000 : 1500000
    const maxAmount = type === "SEMI_ANNUAL" ? 700000 : 2000000

    if (amount < minAmount || amount > maxAmount) {
      return new NextResponse(`Invalid amount for ${type} investment`, { status: 400 })
    }

    if (!user.wallet || user.wallet.balance < amount) {
      return new NextResponse("Insufficient funds", { status: 400 })
    }

    const durationMonths = calculateInvestmentDuration(type)
    const expectedReturn = calculateExpectedReturn(type, amount)

    const investment = await prisma.$transaction(async (tx) => {
      const investment = await tx.realEstateInvestment.create({
        data: {
          userId: user.id,
          type,
          amount: new Prisma.Decimal(amount),
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
            decrement: amount,
          },
        },
      })

      await tx.walletTransaction.create({
        data: {
          walletId: user.wallet!.id,
          type: "INVESTMENT",
          amount,
          status: "COMPLETED",
          cryptoType: "USDT",
          description: `Real Estate Investment - ${type}`,
        },
      })

      return investment
    })

    return NextResponse.json(investment)
  } catch (error) {
    console.error("[INVESTMENT_POST]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

