export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"

export async function GET(req: NextRequest) {
  try {
    // Verify admin access
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    
    // Calculate pagination values
    const skip = (page - 1) * limit
    
    // Build the query
    const whereClause: any = {}
    
    // Add type filter if provided
    if (type) {
      whereClause.type = type
    }
    
    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { txHash: { contains: search, mode: "insensitive" } },
        { wallet: { user: { firstName: { contains: search, mode: "insensitive" } } } },
        { wallet: { user: { lastName: { contains: search, mode: "insensitive" } } } },
        { wallet: { user: { email: { contains: search, mode: "insensitive" } } } }
      ]
    }
    
    // Get wallet transactions
    const [walletTransactions, totalTransactions] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: whereClause,
        include: {
          wallet: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.walletTransaction.count({
        where: whereClause
      })
    ])
    
    // Format transactions for response
    const formattedTransactions = walletTransactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      status: tx.status,
      timestamp: tx.createdAt.toISOString(),
      description: tx.description || `${tx.type} transaction`,
      sourceType: "wallet",
      sourceId: tx.walletId,
      metadata: {
        cryptoType: tx.cryptoType,
        txHash: tx.txHash,
        userId: tx.wallet.userId,
        firstName: tx.wallet.user.firstName,
        lastName: tx.wallet.user.lastName,
        email: tx.wallet.user.email,
        userName: `${tx.wallet.user.firstName} ${tx.wallet.user.lastName}`
      }
    }))
    
    // Calculate total pages
    const totalPages = Math.ceil(totalTransactions / limit)
    
    return NextResponse.json({
      activities: formattedTransactions,
      total: totalTransactions,
      pages: totalPages,
      page,
      limit
    })
    
  } catch (error) {
    console.error("[ADMIN_TRANSACTIONS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 