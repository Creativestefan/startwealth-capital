import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

const loginQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(10),
  search: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    // Check admin authorization
    const session = await getServerSession(authConfig)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }
    
    // Get URL params
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""
    
    // Await the params object if it's a promise
    const paramsData = await params
    const userId = paramsData.userId
    
    // Fetch the user's active sessions from the database
    const activeSessions = await prisma.session.findMany({
      where: { userId: userId },
      select: {
        id: true,
        expires: true,
        sessionToken: true,
        userId: true
      },
      orderBy: { expires: 'desc' }
    })
    
    // Fetch user activities of login type
    const whereClause: any = {
      userId: userId,
      type: "LOGIN"
    }
    
    if (search) {
      whereClause.OR = [
        { metadata: { path: ["ipAddress"], string_contains: search } },
        { metadata: { path: ["browser"], string_contains: search } },
        { metadata: { path: ["deviceInfo"], string_contains: search } },
        { metadata: { path: ["location"], string_contains: search } }
      ]
    }
    
    // Count total records for pagination
    const totalCount = await prisma.userActivity.count({
      where: whereClause
    })
    
    // Fetch paginated login activities
    const activities = await prisma.userActivity.findMany({
      where: whereClause,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * limit,
      take: limit
    })
    
    // Map active session IDs to login activities
    const enrichedActivities = activities.map(activity => {
      // Try to find a matching session
      const matchingSession = activeSessions.find(session => {
        // Match session if it's recent (within 1 hour of the login)
        const loginTime = new Date(activity.timestamp).getTime()
        const sessionTime = new Date(session.expires).getTime() - (6 * 60 * 60 * 1000) // Session expiry minus 6 hours
        const timeDiff = Math.abs(loginTime - sessionTime)
        
        // Access ipAddress safely
        const activityMetadata = activity.metadata as Record<string, any> || {}
        const ipAddress = activityMetadata.ipAddress || ""
        
        // If the login time is within reasonable range of session creation time and IP matches, likely the same session
        return timeDiff < (60 * 60 * 1000) && ipAddress === session.id.split('_')[0] // Simple heuristic, adjust as needed
      })
      
      // Safely extract metadata
      const activityMetadata = activity.metadata as Record<string, any> || {}
      
      // Enrich metadata with session ID if one matches
      const enrichedMetadata = {
        ...activityMetadata,
        sessionId: matchingSession?.id || null,
        isActive: matchingSession ? true : false
      }
      
      return {
        id: activity.id,
        timestamp: activity.timestamp,
        ipAddress: activityMetadata.ipAddress || "Unknown",
        deviceInfo: activityMetadata.deviceInfo || "Unknown",
        browser: activityMetadata.browser || "Unknown",
        location: activityMetadata.location || "Unknown",
        status: matchingSession ? "Active" : "Expired", // Set status based on if matching session exists
        metadata: enrichedMetadata
      }
    })
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit)
    
    return NextResponse.json({
      activities: enrichedActivities,
      total: totalCount,
      pages: totalPages
    })
  } catch (error: any) {
    console.error("[ADMIN_USER_LOGINS_API_ERROR]", error)
    
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    )
  }
} 