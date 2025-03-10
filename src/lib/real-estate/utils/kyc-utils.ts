import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"

/**
 * Checks if a user has completed KYC verification
 * @returns Object with isVerified status and user data
 */
export async function checkKycStatus() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    return { isVerified: false, user: null }
  }

  const isVerified = session.user.kycStatus === "APPROVED"

  return {
    isVerified,
    user: session.user,
  }
}

/**
 * Type for KYC verification response
 */
export type KycVerificationResponse = {
  success: boolean
  requiresKyc: boolean
  error?: string
}

