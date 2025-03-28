import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

// Add CORS headers to prevent CORS issues
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * This endpoint is used to refresh the user's session with the latest KYC status
 * It queries the database for the current KYC status and returns it
 * The client can then use this information to update the UI
 */
export async function GET(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Fetch the user with the latest KYC status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        kyc: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the latest KYC status
    const kycStatus = user.kyc?.status || null
    const isKycApproved = user.role === "ADMIN" || kycStatus === "APPROVED"

    // Return the updated user information
    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      kycStatus,
      isKycApproved,
    })
  } catch (error) {
    console.error("Error refreshing session:", error)
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    )
  }
}

