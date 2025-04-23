import type { Role, KycStatus } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      firstName: string
      lastName: string
      dateOfBirth: Date
      email: string
      role: Role
      image?: string | null
      emailVerified?: Date | null
      kycStatus?: KycStatus | null
    }
  }

  interface User {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: Date
    email: string
    role: Role
    image?: string | null
    emailVerified?: Date | null
    kycStatus?: KycStatus | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: Date
    role: Role
    kycStatus?: KycStatus | null
  }
}

