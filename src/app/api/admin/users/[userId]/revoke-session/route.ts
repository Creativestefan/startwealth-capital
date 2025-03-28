import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

// Revoke a specific user session (log out from a device)
export async function POST(
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
    
    // Get the user ID from the URL params
    const paramsData = await params
    const userId = paramsData.userId
    
    // Get the session ID from the request body
    const { sessionId } = await req.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }
    
    // Find the session to verify it belongs to the specified user
    const userSession = await prisma.session.findUnique({
      where: {
        id: sessionId,
        userId: userId
      }
    })
    
    if (!userSession) {
      return NextResponse.json(
        { error: "Session not found or does not belong to the specified user" },
        { status: 404 }
      )
    }
    
    // Delete the session to revoke access
    await prisma.session.delete({
      where: {
        id: sessionId
      }
    })
    
    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId: userId,
        type: "SYSTEM_UPDATE",
        title: "Session Terminated",
        message: "An administrator has ended one of your login sessions. If this was unexpected, please contact customer support.",
        read: false
      }
    })
    
    return NextResponse.json({
      success: true,
      message: "User session successfully revoked"
    })
  } catch (error: any) {
    console.error("[ADMIN_REVOKE_SESSION_ERROR]", error)
    
    return NextResponse.json(
      { error: "Internal Server Error", message: error?.message || "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 