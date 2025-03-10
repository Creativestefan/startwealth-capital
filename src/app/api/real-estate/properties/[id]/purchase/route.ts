import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { PropertyTransactionType } from "@prisma/client"

// Define the schema for purchase validation
const purchaseSchema = z.object({
  type: z.enum(["FULL", "INSTALLMENT"]),
  amount: z.number().positive("Amount must be positive"),
  installments: z.number().min(2).max(12).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to purchase a property" },
        { status: 401 }
      )
    }

    // Check if user has completed KYC
    if (!session.user.kycStatus || session.user.kycStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "You must complete KYC verification to purchase properties" },
        { status: 403 }
      )
    }

    // Get the property ID from the URL - properly await params in Next.js 15
    const { id } = await params

    // Parse the request body
    const body = await request.json()
    const validationResult = purchaseSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.message },
        { status: 400 }
      )
    }

    const { type, amount, installments } = validationResult.data

    // Get the property
    const property = await prisma.property.findUnique({
      where: { id: id },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Check if property is available
    if (property.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "This property is not available for purchase" },
        { status: 400 }
      )
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      )
    }

    // Calculate initial payment amount
    let initialPayment = amount
    if (type === "INSTALLMENT" && installments) {
      initialPayment = amount / installments
    }

    // Check if user has enough balance
    if (wallet.balance < initialPayment) {
      return NextResponse.json(
        { 
          error: "Insufficient wallet balance", 
          required: initialPayment,
          available: wallet.balance
        },
        { status: 400 }
      )
    }

    // Begin transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: initialPayment } },
      })

      // Create property transaction
      const propertyTransaction = await tx.propertyTransaction.create({
        data: {
          propertyId: id,
          userId: session.user.id,
          amount,
          type: type === "FULL" ? PropertyTransactionType.FULL : PropertyTransactionType.INSTALLMENT,
          status: "COMPLETED",
          installments: type === "INSTALLMENT" ? installments : null,
          installmentAmount: type === "INSTALLMENT" ? initialPayment : null,
          paidInstallments: type === "INSTALLMENT" ? 1 : 0, // First payment is made
        },
      })

      // Create wallet transaction record
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: initialPayment,
          type: "WITHDRAWAL",
          status: "COMPLETED",
          cryptoType: "USDT", // Default crypto type
          description: `Payment for property: ${property.name}`,
        },
      })

      // Update property status to SOLD if full payment, or PENDING if installment
      const updatedProperty = await tx.property.update({
        where: { id: id },
        data: {
          status: type === "FULL" ? "SOLD" : "PENDING",
        },
      })

      return {
        propertyTransaction,
        walletTransaction,
        updatedProperty,
        updatedWallet,
        initialPayment,
        remainingAmount: type === "INSTALLMENT" ? amount - initialPayment : 0,
      }
    })

    return NextResponse.json({
      success: true,
      message: type === "FULL" ? "Property purchased successfully" : "Installment plan set up successfully",
      data: {
        transactionId: result.propertyTransaction.id,
        initialPayment: result.initialPayment,
        remainingAmount: result.remainingAmount,
        newWalletBalance: result.updatedWallet.balance,
      },
    })
  } catch (error) {
    console.error("Error purchasing property:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to purchase property" },
      { status: 500 }
    )
  }
} 