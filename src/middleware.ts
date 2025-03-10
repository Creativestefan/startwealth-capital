import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequestWithAuth } from "next-auth/middleware"

export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    const token = request.nextauth.token

    // Add debugging
    console.log("Middleware token:", {
      emailVerified: token?.emailVerified,
      email: token?.email,
      role: token?.role,
      kycStatus: token?.kycStatus,
    })

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith("/dashboard") || 
        request.nextUrl.pathname.startsWith("/real-estate")) {
      // Check if user exists and is authenticated
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Check if email is verified
      if (!token.emailVerified || token.emailVerified === null) {
        console.log("Email not verified, redirecting to verification")
        const callbackUrl = encodeURIComponent(request.url)
        return NextResponse.redirect(
          new URL(`/verify-email?email=${token.email}&callbackUrl=${callbackUrl}`, request.url),
        )
      }

      // Check for routes that require KYC verification
      const kycRequiredRoutes = [
        "/real-estate/property",
        "/real-estate/properties",
        "/real-estate/shares",
        "/real-estate/portfolio",
        "/dashboard/wallet",
      ]

      // Check if the current path starts with any of the KYC required routes
      const requiresKyc = kycRequiredRoutes.some(
        (route) => request.nextUrl.pathname.startsWith(route) || request.nextUrl.pathname === route,
      )

      // Only check KYC for non-admin users on KYC-required routes
      if (requiresKyc && token.role !== "ADMIN") {
        // Check kycStatus property directly
        const isKycApproved = token.kycStatus === "APPROVED"

        if (!isKycApproved) {
          console.log("KYC verification required, redirecting to profile")
          // Redirect directly to profile page with KYC tab
          return NextResponse.redirect(new URL("/dashboard/profile?tab=kyc", request.url))
        }
      }

      // Allow access to dashboard
      return NextResponse.next()
    }

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      // Check if user exists and is authenticated
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Verify admin role
      if (token.role !== "ADMIN") {
        console.log("Unauthorized access to admin route")
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // Allow access to admin routes
      return NextResponse.next()
    }

    // Allow other requests to pass through
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  },
)

// Update the matcher to include admin routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/real-estate/:path*",
    "/admin/:path*",     // Protect admin routes
    "/api/admin/:path*", // Protect admin API routes
  ],
}

