export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

// Define a type for the user returned from Prisma query
type UserWithRelations = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  createdAt: Date
  updatedAt: Date
  image: string | null
  kyc: { 
    status: string
    submittedAt: Date 
  } | null
  wallet: {
    balance: number
  } | null
}

export async function GET(req: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authConfig)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }
    
    // Parse query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const searchQuery = url.searchParams.get("search") || ""
    const roleFilter = url.searchParams.get("role") || undefined
    const kycFilter = url.searchParams.get("kyc") || undefined
    const sortBy = url.searchParams.get("sortBy") || "createdAt"
    const sortOrder = url.searchParams.get("sortOrder") || "desc"
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Build filter conditions
    const where: any = {}
    
    if (searchQuery) {
      where.OR = [
        { firstName: { contains: searchQuery, mode: "insensitive" } },
        { lastName: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
      ]
    }
    
    if (roleFilter && roleFilter !== "ALL") {
      where.role = roleFilter
    } else {
      // By default, exclude ADMIN users unless specifically requested
      where.role = "USER"
    }
    
    if (kycFilter) {
      if (kycFilter === "NOT_STARTED") {
        where.kyc = null
      } else if (kycFilter !== "ALL") {
        where.kyc = {
          status: kycFilter
        }
      }
    }
    
    // Fetch users with pagination and filters
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      where,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        kyc: {
          select: {
            status: true,
            submittedAt: true
          }
        },
        wallet: {
          select: {
            balance: true
          }
        }
      }
    })
    
    // Get total count for pagination
    const totalCount = await prisma.user.count({ where })
    
    // Format user data
    const formattedUsers = users.map((user: UserWithRelations) => ({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      kycStatus: user.kyc?.status || null,
      hasWallet: !!user.wallet
    }))
    
    return NextResponse.json({
      users: formattedUsers,
      totalUsers: totalCount,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (error) {
    console.error("[ADMIN_USERS_API_ERROR]", error)
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 