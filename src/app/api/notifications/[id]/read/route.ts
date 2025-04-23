export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Ensure params is awaited before accessing
    const { id: notificationId } = params
    
    // Find the notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })
    
    // Check if notification exists
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }
    
    // Check if user owns the notification
    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to mark this notification as read" },
        { status: 403 }
      )
    }
    
    // Mark notification as read
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })
    
    return NextResponse.json({
      message: "Notification marked as read",
      notification: updatedNotification,
    })
  } catch (error) {
    console.error("[NOTIFICATION_READ_ERROR]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Ensure params is awaited before accessing
    const { id: notificationId } = params
    
    // Make sure the notification exists and belongs to the user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    })
    
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }
    
    // Mark the notification as read
    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    })
    
    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error("[MARK_NOTIFICATION_READ_ERROR]", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 