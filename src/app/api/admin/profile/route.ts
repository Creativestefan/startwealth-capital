export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { NotificationType } from "@prisma/client"

// Profile update schema
const profileSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  image: z.string().optional(),
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
    const validationResult = profileSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    const { firstName, lastName, image } = validationResult.data
    
    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firstName,
        lastName,
        image,
      },
    })
    
    // Create a notification for the profile update
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Profile Updated",
        message: "Your profile information has been successfully updated.",
        type: "PROFILE_UPDATED",
      },
    })
    
    // Return success response without sensitive data
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        image: updatedUser.image,
      }
    })
  } catch (error) {
    // Fix error handling for when error is null
    const errorMessage = error 
      ? (error instanceof Error ? error.message : String(error))
      : "Unknown error occurred";
    
    console.error("[ADMIN_PROFILE_UPDATE_ERROR]", errorMessage);
    
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