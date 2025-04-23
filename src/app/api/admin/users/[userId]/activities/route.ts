export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

const activitiesQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(10),
  type: z.enum(["login", "investment", "withdrawal", "transaction"]).optional(),
  status: z.enum(["success", "pending", "failed"]).optional(),
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
    
    const { 
      page, 
      limit, 
      type, 
      status,
      search 
    } = activitiesQuerySchema.parse(queryParams)

    // Build filters
    const filters: any = { userId }
    
    if (type) {
      filters.type = type
    }
    
    if (status) {
      filters.status = status
    }
    
    if (search) {
      filters.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { metadata: { path: ["details"], string_contains: search } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get activities with count for pagination
    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where: filters,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          description: true,
          status: true,
          amount: true,
          timestamp: true,
          metadata: true
        }
      }),
      prisma.userActivity.count({ where: filters })
    ])

    // Calculate total pages
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      activities,
      total,
      pages: totalPages,
      page,
      limit
    })
  } catch (error) {
    console.error("Error fetching user activities:", error)
    
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