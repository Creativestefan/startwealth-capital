import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const investmentId = params.id

    // Get the investment
    const investment = await prisma.realEstateInvestment.findUnique({
      where: {
        id: investmentId,
      },
    })

    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 })
    }

    // Check if the investment belongs to the user
    if (investment.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if the investment is matured
    if (investment.status !== "MATURED") {
      return NextResponse.json({ error: "Only matured investments can be withdrawn" }, { status: 400 })
    }

    // Start a transaction to update investment and wallet
    const result = await prisma.$transaction(async (tx) => {
      // Update investment status
      const updatedInvestment = await tx.realEstateInvestment.update({
        where: {
          id: investmentId,
        },
        data: {
          status: "CANCELLED",
          actualReturn: investment.expectedReturn,
        },
      })

      // Get user's wallet
      const wallet = await tx.wallet.findUnique({
        where: {
          userId: session.user.id,
        },
      })

      if (!wallet) {
        throw new Error("Wallet not found")
      }

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            increment: Number(investment.amount) + Number(investment.expectedReturn),
          },
        },
      })

      // Create wallet transaction
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "RETURN",
          amount: Number(investment.amount) + Number(investment.expectedReturn),
          status: "COMPLETED",
          cryptoType: "USDT", // Default to USDT
          description: `Return from investment ${investmentId}`,
        },
      })

      return {
        investment: updatedInvestment,
        wallet: updatedWallet,
        transaction: walletTransaction,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error withdrawing investment:", error)
    return NextResponse.json({ error: "Failed to withdraw investment" }, { status: 500 })
  }
}

