import type { Role, KycStatus } from "@prisma/client"

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  email: string
  emailVerified: Date | null
  role: Role
  image?: string | null
  kyc?: {
    status: KycStatus
    country: string
    documentType: string
    documentNumber?: string
    documentImage: string
  }
  wallet?: {
    balance: number
    transactions: {
      id: string
      type: string
      amount: number
      status: string
      cryptoType: string
      txHash?: string
      createdAt: Date
    }[]
  }
}

export interface VerifyEmailPayload {
  email: string
  otp: string
}

export interface SendOtpPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  token: string
  password: string
}

