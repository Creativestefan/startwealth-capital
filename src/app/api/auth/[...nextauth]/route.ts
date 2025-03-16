import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Add CORS headers to prevent CORS issues
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Create the NextAuth handler
const handler = NextAuth(authConfig)

// Export the NextAuth handlers
export { handler as GET, handler as POST }

