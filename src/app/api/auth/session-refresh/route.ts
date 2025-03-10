import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Get the callback URL from the query parameters
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") || "/dashboard"

    // Fetch the latest user data from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        kyc: true,
      },
    })

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Check if KYC is now approved
    const kycStatus = user.kyc?.status || null
    const isKycApproved = user.role === "ADMIN" || kycStatus === "APPROVED"

    if (isKycApproved) {
      // Redirect to the callback URL
      return NextResponse.redirect(new URL(decodeURIComponent(callbackUrl), request.url))
    }

    // If KYC is still not approved, redirect to the KYC page
    return NextResponse.redirect(new URL(`/dashboard/profile?tab=kyc&callbackUrl=${callbackUrl}`, request.url))
  } catch (error) {
    console.error("Error refreshing session:", error)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
}

