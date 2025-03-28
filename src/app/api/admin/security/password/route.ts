import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { hash, compare } from "bcrypt"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { NotificationType } from "@prisma/client"

// Password update schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
})

export async function PATCH(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authConfig)
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }
    
    // Parse and validate request data
    const body = await req.json()
    const validationResult = passwordSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    const { currentPassword, newPassword } = validationResult.data
    
    // Get user from database to verify the current password
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        password: true,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password || "")
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      )
    }
    
    // Hash the new password
    const hashedPassword = await hash(newPassword, 12)
    
    // Update user password in database
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    // Create a notification for the password change
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Password Changed",
        message: "Your account password was successfully changed.",
        type: NotificationType.PASSWORD_CHANGED,
      },
    })
    
    // Return success response
    return NextResponse.json({
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("[ADMIN_PASSWORD_UPDATE_ERROR]", error)
    
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

export async function POST() {
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