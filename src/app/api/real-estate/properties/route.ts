export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const investSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["FULL", "INSTALLMENT"]),
  installments: z.number().optional(),
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get user with wallet
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
    const validatedData = investSchema.parse(json)
    const { amount, type, installments } = validatedData

    // Validate amount
    if (amount <= 0) {
      return new NextResponse("Amount must be greater than 0", { status: 400 })
    }

    // Get property
    const property = await prisma.property.findUnique({
      where: { id: params.id },
    })

    if (!property) {
      return new NextResponse("Property not found", { status: 404 })
    }

    if (property.status !== "AVAILABLE") {
      return new NextResponse("Property is not available", { status: 400 })
    }

    // Validate investment amount
    if (amount <= 0) {
      return new NextResponse("Amount must be greater than 0", { status: 400 })
    }

    // Check wallet balance for full payment
    if (type === "FULL" && (!user.wallet || user.wallet.balance < amount)) {
      return new NextResponse("Insufficient funds", { status: 400 })
    }

    // Validate installments
    if (type === "INSTALLMENT" && (!installments || installments < 2)) {
      return new NextResponse("Invalid installments. Minimum 2 installments required.", { status: 400 })
    }

    // Calculate installment amount if applicable
    const installmentAmount = type === "INSTALLMENT" ? new Prisma.Decimal(amount / (installments || 1)) : null

    // Create transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Create property transaction
      const propertyTx = await tx.propertyTransaction.create({
        data: {
          propertyId: params.id,
          userId: user.id,
          amount: new Prisma.Decimal(amount),
          type,
          status: "PENDING",
          installments: type === "INSTALLMENT" ? installments : null,
          installmentAmount,
          nextPaymentDue: type === "INSTALLMENT" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
          paidInstallments: 0,
        },
      })

      if (type === "FULL") {
        // Deduct from wallet
        await tx.wallet.update({
          where: { id: user.wallet!.id },
          data: {
            balance: {
              decrement: amount,
            },
          },
        })

        // Create wallet transaction
        await tx.walletTransaction.create({
          data: {
            walletId: user.wallet!.id,
            type: "INVESTMENT",
            amount,
            status: "COMPLETED",
            cryptoType: "USDT",
            description: `Investment in property: ${property.name}`,
          },
        })

        // Update property transaction status
        await tx.propertyTransaction.update({
          where: { id: propertyTx.id },
          data: { status: "COMPLETED" },
        })

        // Update property status if fully purchased
        await tx.property.update({
          where: { id: params.id },
          data: { status: "SOLD" },
        })
      }

      return propertyTx
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("[PROPERTY_INVEST]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

