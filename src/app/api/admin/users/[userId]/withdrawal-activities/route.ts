export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

const withdrawalQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(10),
  search: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    // Admin authorization check
    const session = await getServerSession(authConfig)
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
      })
    }

    // Await the params object if it's a promise
    const paramsData = await params
    const userId = paramsData.userId

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
      })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const { page, limit, search } = withdrawalQuerySchema.parse(queryParams)

    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Get user's wallet and transactions
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          where: {
            type: { in: ["WITHDRAWAL", "PAYOUT"] },
            ...(search ? {
              OR: [
                { description: { contains: search, mode: 'insensitive' } },
                { txHash: { contains: search, mode: 'insensitive' } }
              ]
            } : {})
          },
          orderBy: { createdAt: 'desc' },
        }
      }
    })
    
    // Format withdrawal data
    const withdrawalActivities = wallet?.transactions.map(transaction => ({
      id: transaction.id,
      timestamp: transaction.createdAt,
      amount: Number(transaction.amount),
      bankAccount: transaction.description?.includes("Bank") 
        ? transaction.description.split(" - ")[1] || "Bank Transfer" 
        : transaction.cryptoType === "BTC" 
          ? "Bitcoin Wallet" 
          : transaction.cryptoType === "USDT" 
            ? "USDT Wallet" 
            : "Cryptocurrency Wallet",
      reference: transaction.txHash || transaction.id.substring(0, 8),
      status: transaction.status.toLowerCase(),
      metadata: {
        cryptoType: transaction.cryptoType,
        txHash: transaction.txHash,
        walletId: transaction.walletId,
        type: transaction.type
      }
    })) || []
    
    // Apply pagination
    const paginatedActivities = withdrawalActivities.slice(skip, skip + limit)
    
    // Calculate total count and pages
    const total = withdrawalActivities.length
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      activities: paginatedActivities,
      total,
      pages: totalPages,
      page,
      limit
    })
  } catch (error) {
    console.error("Error fetching withdrawal activities:", error)
    
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: "Invalid request parameters", details: error.errors }), {
        status: 400,
      })
    }
    
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    })
  }
} 