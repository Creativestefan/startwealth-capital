import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { NotificationType } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authConfig)
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }
    
    // Parse query parameters
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const page = parseInt(url.searchParams.get("page") || "1")
    const skip = (page - 1) * limit
    
    // Fetch notifications for the user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    })
    
    // Get total count for pagination
    const total = await prisma.notification.count({
      where: {
        userId: session.user.id,
      },
    })
    
    return NextResponse.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error("[NOTIFICATIONS_API_ERROR]", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Add a new notification for a user (for testing)
export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authConfig)
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }
    
    // Parse the request body
    const body = await req.json()
    
    // Create a new notification
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: body.title || "New Notification",
        message: body.message || "You have a new notification.",
        type: body.type || NotificationType.SYSTEM_UPDATE,
        actionUrl: body.actionUrl,
      },
    })
    
    return NextResponse.json(notification)
  } catch (error) {
    console.error("[NOTIFICATIONS_API_ERROR]", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 