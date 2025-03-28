import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { serializeData } from "@/lib/real-estate/utils/formatting"

// Define types for our transaction objects
interface TransactionActivity {
  id: string
  timestamp: Date
  amount: number
  type: string
  description: string
  status: string
  sourceType: string
  sourceId: string
  metadata: Record<string, any>
}

const transactionQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(10),
  search: z.string().optional(),
  transactionType: z.enum(["all", "wallet", "property", "equipment", "market"]).optional(),
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
    
    const { page, limit, search, transactionType } = transactionQuerySchema.parse({
      ...queryParams,
      transactionType: queryParams.transactionType || "all"
    })

    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Initialize arrays to hold different types of transactions
    let walletTransactions: TransactionActivity[] = []
    let propertyTransactions: TransactionActivity[] = []
    let equipmentTransactions: TransactionActivity[] = []
    let marketInvestments: TransactionActivity[] = []
    let totalCount = 0
    
    // Fetch data based on transactionType filter
    const shouldFetchWallet = transactionType === "all" || transactionType === "wallet"
    const shouldFetchProperty = transactionType === "all" || transactionType === "property"
    const shouldFetchEquipment = transactionType === "all" || transactionType === "equipment"
    const shouldFetchMarket = transactionType === "all" || transactionType === "market"
    
    // Fetch regular transaction activities
    if (shouldFetchWallet) {
      // Get wallet transactions
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            where: search ? {
              OR: [
                { description: { contains: search, mode: 'insensitive' } },
                { cryptoType: { contains: search, mode: 'insensitive' } },
                { txHash: { contains: search, mode: 'insensitive' } }
              ]
            } : undefined
          }
        }
      })
      
      if (wallet?.transactions) {
        walletTransactions = wallet.transactions.map(tx => ({
          id: tx.id,
          timestamp: tx.createdAt,
          amount: Number(tx.amount),
          type: tx.type.toLowerCase(),
          description: tx.description || `${tx.type} transaction`,
          status: tx.status.toLowerCase(),
          sourceType: 'wallet',
          sourceId: tx.id,
          metadata: {
            cryptoType: tx.cryptoType,
            txHash: tx.txHash
          }
        }))
      }
    }
    
    // Fetch property transactions
    if (shouldFetchProperty) {
      const propertyTxs = await prisma.propertyTransaction.findMany({
        where: {
          userId,
          ...(search ? {
            OR: [
              { property: { name: { contains: search, mode: 'insensitive' } } }
            ]
          } : {})
        },
        include: {
          property: true
        },
        orderBy: { createdAt: 'desc' }
      })
      
      propertyTransactions = propertyTxs.map(tx => ({
        id: tx.id,
        timestamp: tx.createdAt,
        amount: Number(tx.amount),
        type: 'real_estate',
        description: tx.property ? `Purchase of ${tx.property.name}` : 'Property purchase',
        status: tx.status.toLowerCase(),
        sourceType: 'property',
        sourceId: tx.propertyId,
        metadata: {
          propertyName: tx.property?.name,
          propertyLocation: tx.property?.location,
          propertyImage: tx.property?.images?.[0],
          installments: tx.installments,
          paidInstallments: tx.paidInstallments,
          paymentType: tx.type
        }
      }))
    }
    
    // Fetch equipment transactions (green energy)
    if (shouldFetchEquipment) {
      const equipmentTxs = await prisma.equipmentTransaction.findMany({
        where: {
          userId,
          ...(search ? {
            OR: [
              { equipment: { name: { contains: search, mode: 'insensitive' } } }
            ]
          } : {})
        },
        include: {
          equipment: true
        },
        orderBy: { createdAt: 'desc' }
      })
      
      equipmentTransactions = equipmentTxs.map(tx => ({
        id: tx.id,
        timestamp: tx.createdAt,
        amount: Number(tx.totalAmount || 0),
        type: 'green_energy',
        description: tx.equipment ? `Purchase of ${tx.equipment.name}` : 'Equipment purchase',
        status: tx.status.toLowerCase(),
        sourceType: 'equipment',
        sourceId: tx.equipmentId,
        metadata: {
          equipmentName: tx.equipment?.name,
          equipmentType: tx.equipment?.type,
          equipmentImage: tx.equipment?.images ? 
            typeof tx.equipment.images === 'string' ? 
              tx.equipment.images : 
              Array.isArray(tx.equipment.images) ? 
                tx.equipment.images[0] : null
            : null,
          quantity: tx.quantity,
          trackingNumber: tx.trackingNumber
        }
      }))
    }
    
    // Fetch market investments
    if (shouldFetchMarket) {
      const marketInvs = await prisma.marketInvestment.findMany({
        where: {
          userId,
          ...(search ? {
            OR: [
              { plan: { name: { contains: search, mode: 'insensitive' } } }
            ]
          } : {})
        },
        include: {
          plan: true
        },
        orderBy: { createdAt: 'desc' }
      })
      
      marketInvestments = marketInvs.map(inv => ({
        id: inv.id,
        timestamp: inv.createdAt,
        amount: Number(inv.amount),
        type: 'market',
        description: inv.plan ? `Investment in ${inv.plan.name}` : 'Market investment',
        status: inv.status.toLowerCase(),
        sourceType: 'market',
        sourceId: inv.planId,
        metadata: {
          planName: inv.plan?.name,
          planDescription: inv.plan?.description,
          durationMonths: inv.plan?.durationMonths,
          expectedReturn: inv.expectedReturn,
          actualReturn: inv.actualReturn
        }
      }))
    }
    
    // Combine all transactions
    const allTransactions = [
      ...walletTransactions,
      ...propertyTransactions,
      ...equipmentTransactions,
      ...marketInvestments
    ]
    
    // Sort by timestamp (newest first)
    allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    // Calculate total count
    totalCount = allTransactions.length
    
    // Apply pagination
    const paginatedTransactions = allTransactions.slice(skip, skip + limit)
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      activities: paginatedTransactions,
      total: totalCount,
      pages: totalPages,
      page,
      limit
    })
  } catch (error) {
    console.error("Error fetching transaction activities:", error)
    
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