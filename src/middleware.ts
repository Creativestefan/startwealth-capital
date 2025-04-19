import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequestWithAuth } from "next-auth/middleware"

// Define the allowed roles for better type safety
type UserRole = "ADMIN" | "USER" | string | undefined

export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    const token = request.nextauth.token
    const pathname = request.nextUrl.pathname
    const searchParams = request.nextUrl.searchParams
    const callbackUrl = searchParams.get("callbackUrl")
    const fullUrl = request.url

    // Enhanced debugging
    console.log("=== MIDDLEWARE DEBUGGING ===")
    console.log("Request URL:", fullUrl)
    console.log("Pathname:", pathname)
    console.log("CallbackUrl param:", callbackUrl)
    console.log("User token:", {
      exists: !!token,
      emailVerified: token?.emailVerified,
      email: token?.email,
      role: token?.role,
      kycStatus: token?.kycStatus,
      isBanned: token?.isBanned,
    })

    // Check if user is banned
    if (token?.isBanned) {
      console.log("User is banned, redirecting to login")
      return NextResponse.redirect(
        new URL(`/login?error=banned&email=${token.email}`, request.url)
      )
    }

    // Special handling for login page with admin user
    if (pathname === "/login" && (token?.role === "ADMIN" || token?.role?.toUpperCase() === "ADMIN")) {
      console.log("Admin user already logged in and trying to access login page")
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    // Admin users handling - special case for admin users
    if (token?.role === "ADMIN" || token?.role?.toUpperCase() === "ADMIN") {
      console.log("Admin user detected - Role:", token?.role, "Type:", typeof token?.role)
      
      // If admin is trying to access any dashboard routes, redirect to admin dashboard
      if (pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname === "/" || pathname === "/login") {
        console.log("Admin user accessing dashboard or home/login, redirecting to admin dashboard")
        const redirectUrl = new URL("/admin/dashboard", request.url)
        console.log("Redirecting admin to:", redirectUrl.toString())
        return NextResponse.redirect(redirectUrl)
      }
      
      // If admin is accessing admin routes, allow access regardless of email verification
      if (pathname.startsWith("/admin")) {
        console.log("Admin accessing admin routes, allowing access regardless of email verification")
        return NextResponse.next()
      }
      
      // For other routes, allow admin access
      console.log("Admin user accessing other routes, allowing access")
      return NextResponse.next()
    }

    // Handle regular users
    
    // Protect dashboard routes for regular users
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/real-estate")) {
      console.log("Regular user accessing protected dashboard route")
      
      // Check if user exists and is authenticated
      if (!token) {
        console.log("No token, redirecting to login")
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Check if email is verified
      if (!token.emailVerified || token.emailVerified === null) {
        console.log("Email not verified, redirecting to verification")
        const callbackUrl = encodeURIComponent(request.url)
        return NextResponse.redirect(
          new URL(`/verify-email?email=${token.email}&callbackUrl=${callbackUrl}`, request.url)
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
        (route) => pathname.startsWith(route) || pathname === route
      )

      console.log("Route requires KYC:", requiresKyc)

      // Check KYC status for routes that require it
      if (requiresKyc) {
        // Check kycStatus property directly
        const isKycApproved = token.kycStatus === "APPROVED"
        console.log("KYC status:", token.kycStatus, "Is approved:", isKycApproved)

        if (!isKycApproved) {
          console.log("KYC verification required, redirecting to profile")
          return NextResponse.redirect(new URL("/dashboard/profile?tab=kyc", request.url))
        }
      }

      // Allow access to dashboard for regular users
      console.log("User has access to dashboard, allowing")
      return NextResponse.next()
    }

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
      console.log("User accessing admin route")
      
      // Check if user exists and is authenticated
      if (!token) {
        console.log("No token for admin route, redirecting to login")
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Verify admin role - handle different role types safely
      const userRole = token.role as UserRole
      console.log("Admin route access - user role:", userRole, "Type:", typeof userRole)
      
      // More permissive check for admin role
      if (userRole !== "ADMIN" && userRole?.toUpperCase() !== "ADMIN") {
        console.log("Unauthorized access to admin route, redirecting to dashboard")
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // Allow access to admin routes (email verification check already handled above)
      console.log("Admin user has access to admin routes, allowing")
      return NextResponse.next()
    }

    // Allow other requests to pass through
    console.log("Other route, allowing access")
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log("NextAuth authorized callback, token exists:", !!token)
        return !!token
      },
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
    "/api/upload",       // Protect the upload route
  ],
}
