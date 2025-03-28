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
    const type = searchParams.get("type") // "DEPOSIT" or "WITHDRAWAL"
    const search = searchParams.get("search")
    
    // Calculate pagination values
    const skip = (page - 1) * limit
    
    // Build the query - require specific transaction type
    if (!type || (type !== "DEPOSIT" && type !== "WITHDRAWAL")) {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 })
    }
    
    const whereClause: any = {
      type: type
    }
    
    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { txHash: { contains: search, mode: "insensitive" } },
        { cryptoType: { contains: search, mode: "insensitive" } },
        { wallet: { user: { firstName: { contains: search, mode: "insensitive" } } } },
        { wallet: { user: { lastName: { contains: search, mode: "insensitive" } } } },
        { wallet: { user: { email: { contains: search, mode: "insensitive" } } } }
      ]
    }
    
    // Get wallet transactions
    const [transactions, totalCount] = await Promise.all([
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
    
    // Format for response
    const formattedTransactions = transactions.map(tx => {
      // For deposits, we want to show deposit details
      if (type === "DEPOSIT") {
        return {
          id: tx.id,
          amount: Number(tx.amount),
          timestamp: tx.createdAt.toISOString(),
          status: tx.status.toLowerCase(),
          // For deposits, we'll use cryptoType as "bankAccount" field
          bankAccount: tx.cryptoType || "USDT",
          reference: tx.txHash || tx.id.substring(0, 10),
          metadata: {
            type: tx.type,
            cryptoType: tx.cryptoType,
            txHash: tx.txHash,
            walletId: tx.walletId,
            userId: tx.wallet.userId,
            firstName: tx.wallet.user.firstName,
            lastName: tx.wallet.user.lastName,
            email: tx.wallet.user.email,
            userName: `${tx.wallet.user.firstName} ${tx.wallet.user.lastName}`
          }
        }
      } 
      // For withdrawals, we want to show withdrawal details
      else {
        return {
          id: tx.id,
          amount: Number(tx.amount),
          timestamp: tx.createdAt.toISOString(),
          status: tx.status.toLowerCase(),
          bankAccount: tx.description?.includes("Bank") 
            ? tx.description.split(" - ")[1] || "Bank Transfer" 
            : tx.cryptoType === "BTC" 
              ? "Bitcoin Wallet" 
              : tx.cryptoType === "USDT" 
                ? "USDT Wallet" 
                : "Cryptocurrency Wallet",
          reference: tx.txHash || tx.id.substring(0, 10),
          metadata: {
            type: tx.type,
            cryptoType: tx.cryptoType,
            txHash: tx.txHash,
            walletId: tx.walletId,
            userId: tx.wallet.userId,
            firstName: tx.wallet.user.firstName,
            lastName: tx.wallet.user.lastName,
            email: tx.wallet.user.email,
            userName: `${tx.wallet.user.firstName} ${tx.wallet.user.lastName}`
          }
        }
      }
    })
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit)
    
    return NextResponse.json({
      activities: formattedTransactions,
      total: totalCount,
      pages: totalPages,
      page,
      limit
    })
    
  } catch (error) {
    console.error("[ADMIN_WALLET_TRANSACTIONS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 