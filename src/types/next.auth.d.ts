import type { Role, KycStatus } from "@prisma/client"
import type { DefaultSession } from "next-auth"

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

