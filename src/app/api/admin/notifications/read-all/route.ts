export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authConfig)

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Mark all unread notifications as read
    const { count } = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Marked ${count} notifications as read`,
      count,
    })
  } catch (error) {
    console.error("[ADMIN_NOTIFICATIONS_READ_ALL_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    )
  }
} 