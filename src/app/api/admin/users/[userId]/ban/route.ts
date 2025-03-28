import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

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
    
    // Await the params object if it's a promise
    const paramsData = await params
    const userId = paramsData.userId
    
    // Prevent banning your own account
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot ban your own account" },
        { status: 400 }
      )
    }
    
    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isBanned: true, firstName: true, lastName: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Toggle the ban status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isBanned: true,
        updatedAt: true
      }
    })
    
    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId: userId,
        type: "SYSTEM_UPDATE",
        title: updatedUser.isBanned ? "Account Banned" : "Account Unbanned",
        message: updatedUser.isBanned
          ? "Your account has been banned. Please contact support for more information."
          : "Your account has been unbanned. You can now login and use the platform again.",
        actionUrl: "/login"
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} has been ${updatedUser.isBanned ? 'banned' : 'unbanned'}`,
      isBanned: updatedUser.isBanned
    })
  } catch (error: any) {
    console.error("[ADMIN_USER_BAN_API_ERROR]", error)
    
    // Handle not found error
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 