import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// For NextAuth.js v4, we don't destructure handlers
const nextAuth = NextAuth(authConfig)

// Export the NextAuth handler directly
export default nextAuth

// Also export these for convenience
export const { 
  auth,
  signIn, 
  signOut 
} = nextAuth

export { authConfig }

