export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { z } from "zod"

const installmentSchema = z.object({
  transactionId: z.string(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()

    // Validate the request body
    const validatedData = installmentSchema.parse(json)
    const { transactionId } = validatedData

    // Get user with wallet
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { wallet: true },
    })

    if (!user || !user.wallet) {
      return new NextResponse("User wallet not found", { status: 404 })
    }

    // Get property transaction
    const propertyTx = await prisma.propertyTransaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id,
        type: "INSTALLMENT",
        status: "PENDING",
      },
      include: {
        property: true,
      },
    })

    if (!propertyTx) {
      return new NextResponse("Transaction not found", { status: 404 })
    }

    if (!propertyTx.installmentAmount) {
      return new NextResponse("Invalid installment transaction", { status: 400 })
    }

    // Check wallet balance
    const installmentAmountNumber = Number.parseFloat(propertyTx.installmentAmount.toString())
    if (user.wallet.balance < installmentAmountNumber) {
      return new NextResponse("Insufficient funds", { status: 400 })
    }

    // Process installment payment
    const updatedTx = await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      await tx.wallet.update({
        where: { id: user.wallet!.id },
        data: {
          balance: {
            decrement: installmentAmountNumber,
          },
        },
      })

      // Create wallet transaction
      await tx.walletTransaction.create({
        data: {
          walletId: user.wallet!.id,
          type: "INVESTMENT",
          amount: installmentAmountNumber,
          status: "COMPLETED",
          cryptoType: "USDT",
          description: `Property installment payment for ${propertyTx.property.name}`,
        },
      })

      // Update property transaction
      const paidInstallments = propertyTx.paidInstallments + 1
      const isFullyPaid = paidInstallments >= (propertyTx.installments || 0)

      const updated = await tx.propertyTransaction.update({
        where: { id: propertyTx.id },
        data: {
          paidInstallments,
          nextPaymentDue: isFullyPaid ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: isFullyPaid ? "COMPLETED" : "PENDING",
        },
      })

      // If fully paid, update property status
      if (isFullyPaid) {
        await tx.property.update({
          where: { id: propertyTx.propertyId },
          data: { status: "SOLD" },
        })
      }

      return updated
    })

    return NextResponse.json(updatedTx)
  } catch (error) {
    console.error("[PROPERTY_INSTALLMENT]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

