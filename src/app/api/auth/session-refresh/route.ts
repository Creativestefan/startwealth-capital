import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

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

    // Create the response
    let response;
    
    if (isKycApproved) {
      // Redirect to the callback URL
      response = NextResponse.redirect(new URL(decodeURIComponent(callbackUrl), request.url))
    } else {
      // If KYC is still not approved, redirect to the KYC page
      response = NextResponse.redirect(new URL(`/dashboard/profile?tab=kyc&callbackUrl=${callbackUrl}`, request.url))
    }
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  } catch (error) {
    console.error("Error refreshing session:", error)
    const response = NextResponse.redirect(new URL("/dashboard", request.url))
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}

