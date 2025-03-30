import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt, { compare } from "bcryptjs"
import * as z from "zod"

// Add all validation schemas here
export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export const RegisterSchema = z
  .object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    dateOfBirth: z.string().refine(
      (date) => {
        const birthDate = new Date(date)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        return age >= 18
      },
      { message: "You must be at least 18 years old" },
    ),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Add the ResetPasswordSchema
export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

  async function generateNewHash() {
    const plainPassword = "admin123456";
    const newHash = await bcrypt.hash(plainPassword, 10);
    console.log("New hash:", newHash);
    
    // Test the new hash
    const isMatch = await bcrypt.compare(plainPassword, newHash);
    console.log("New hash works:", isMatch);
  }

// The existing NextAuth configuration with updated pages
export const authConfig: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@example.com",
        },
        password: { label: "Password", type: "password" },
        callbackUrl: { type: "text", label: "Callback URL" },
      },
      async authorize(credentials) {
        console.log("Authorize attempt for:", credentials?.email);
        console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set (first 10 chars): " + process.env.DATABASE_URL.substring(0, 10) + "..." : "Not set");
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          console.log("Attempting to find user in database...");
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              kyc: true,
            },
          });

          console.log("User found:", !!user, "Role:", user?.role);
          
          if (!user) {
            console.log("User not found");
            return null;
          }

          // Log the password comparison (don't log actual passwords in production)
          console.log("Comparing password for:", user.email);
          console.log("Password hash in DB:", user.password ? user.password.substring(0, 10) + "..." : "No password hash");
          
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log("Password valid:", isPasswordValid);

          // await generateNewHash();

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          // Log the user object being returned
          const returnUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            dateOfBirth: user.dateOfBirth,
            role: user.role,
            emailVerified: user.emailVerified,
            kycStatus: user.kyc?.status || null,
          };
          
          console.log("Auth successful, returning user with role:", returnUser.role)
          
          // For admin users, we'll handle special redirection in the login form
          if (user.role === "ADMIN") {
            console.log("Admin user detected, will be redirected to admin dashboard by login form")
            // Admin users should NEVER access regular dashboard
            if (returnUser.role === "ADMIN") {
              console.log("Ensuring admin user has proper role set")
            }
          }
          
          return returnUser;
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/error",
    verifyRequest: "/verify-email",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback - adding user data to token:", {
          id: user.id,
          email: user.email,
          role: user.role
        })
        token.id = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.dateOfBirth = user.dateOfBirth
        token.role = user.role
        token.kycStatus = user.kycStatus
        token.emailVerified = user.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        console.log("Session callback - adding token data to session:", {
          id: token.id,
          email: session.user.email,
          role: token.role
        })
        session.user.id = token.id as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.dateOfBirth = token.dateOfBirth as Date
        session.user.role = token.role as any
        session.user.kycStatus = token.kycStatus as any
        session.user.emailVerified = token.emailVerified as Date
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log("NextAuth redirect callback:", { url, baseUrl })
      
      // Special handling for admin users - always redirect to admin dashboard
      if (url.includes('/dashboard') && !url.includes('/admin/dashboard')) {
        try {
          // Check if the URL contains admin token in the query params
          const urlObj = new URL(url.startsWith('http') ? url : `${baseUrl}${url}`)
          const token = urlObj.searchParams.get('token')
          
          if (token) {
            try {
              // Basic check for admin role in the token (simplified)
              const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
              if (tokenData?.role === 'ADMIN') {
                console.log("Admin user detected in token, forcing admin dashboard")
                return '/admin/dashboard'
              }
            } catch (e) {
              console.error("Error parsing token:", e)
            }
          }
        } catch (error) {
          console.error("Error in redirect callback:", error)
          // Continue with normal redirect flow if check fails
        }
      }
      
      // Check if this is a callback from a successful login
      if (url.includes('/api/auth/callback/credentials')) {
        console.log("Credential callback detected, will handle role-based redirection in login form")
        return url
      }
      
      // Always allow relative URLs
      const isRelativeUrl = url.startsWith('/')
      if (isRelativeUrl) {
        console.log("Allowing relative URL redirect:", url)
        return url
      }
      // Allow redirects to the same site
      if (url.startsWith(baseUrl)) {
        console.log("Allowing same-site URL redirect:", url)
        return url
      }
      // Default fallback
      console.log("Fallback to base URL:", baseUrl)
      return baseUrl
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: false,
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}
