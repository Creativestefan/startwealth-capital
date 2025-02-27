import type { Role, KycStatus } from "@prisma/client"
import type { DefaultSession } from "next-auth"
import { getServerSession } from "next-auth/next"
import { authConfig } from "./auth.config"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      emailVerified: Date | null
      kycStatus: KycStatus
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    emailVerified: Date | null
    kycStatus: KycStatus
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    emailVerified: Date | null
    kycStatus: KycStatus
  }
}

export async function auth() {
  const session = await getServerSession(authConfig)
  return session
}

export { LoginSchema, RegisterSchema, ResetPasswordSchema } from "./auth.config"

