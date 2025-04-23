export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

const investmentQuerySchema = z.object({
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
    
    const { page, limit, search } = investmentQuerySchema.parse(queryParams)

    // Build filters
    const filters: any = { 
      userId,
      type: "investment"
    }
    
    if (search) {
      filters.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { metadata: { path: ["investmentType"], string_contains: search } },
        { metadata: { path: ["propertyId"], string_contains: search } },
        { metadata: { path: ["projectId"], string_contains: search } },
        { metadata: { path: ["planId"], string_contains: search } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get investment activities with count for pagination
    const [investmentActivities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where: filters,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          description: true,
          status: true,
          amount: true,
          timestamp: true,
          metadata: true
        }
      }),
      prisma.userActivity.count({ where: filters })
    ])

    // Format investment activities for frontend display
    const formattedActivities = investmentActivities.map(activity => {
      // Extract investment name from description or use fallback
      const descriptionParts = activity.description.split(' of ');
      const investmentName = descriptionParts.length > 1 
        ? descriptionParts[0] 
        : 'Investment';
      
      // Get investment type from metadata
      let investmentType = 'unknown';
      if (activity.metadata && typeof activity.metadata === 'object' && 'investmentType' in activity.metadata) {
        investmentType = String(activity.metadata.investmentType);
      }
      
      // Calculate expected return (mock data for now)
      const expectedReturn = Math.floor(Math.random() * 8) + 5; // 5-12% return
      
      // Calculate duration (mock data for now)
      const duration = `${Math.floor(Math.random() * 18) + 6} months`; // 6-24 months
      
      return {
        id: activity.id,
        timestamp: activity.timestamp,
        amount: activity.amount || 0,
        type: investmentType,
        investmentId: 
          (typeof activity.metadata === 'object' && activity.metadata && 'propertyId' in activity.metadata) ? String(activity.metadata.propertyId) :
          (typeof activity.metadata === 'object' && activity.metadata && 'projectId' in activity.metadata) ? String(activity.metadata.projectId) :
          (typeof activity.metadata === 'object' && activity.metadata && 'planId' in activity.metadata) ? String(activity.metadata.planId) :
          'unknown',
        name: investmentName,
        status: activity.status || "unknown",
        expectedReturn,
        duration
      };
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      activities: formattedActivities,
      total,
      pages: totalPages,
      page,
      limit
    })
  } catch (error) {
    console.error("Error fetching investment activities:", error)
    
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