import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequestWithAuth } from "next-auth/middleware"

export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    const token = request.nextauth.token

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      // Check if user exists and is authenticated
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Check if email is verified
      if (!token.emailVerified) {
        // Store the intended URL to redirect back after verification
        const callbackUrl = encodeURIComponent(request.url)
        return NextResponse.redirect(new URL(`/verify-email?callbackUrl=${callbackUrl}`, request.url))
      }

      // Allow access to dashboard but KYC status will be checked in the UI
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

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
}

