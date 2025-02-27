import type { User, Role, KycStatus } from "@prisma/client"

export interface AuthUser extends User {
  emailVerified: Date | null
  role: Role
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

