import { prisma } from "@/lib/prisma"

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function storeOTP(email: string, otp: string) {
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

  try {
    if (process.env.NODE_ENV === 'development') {
      // Redact email in logs even in development
      const redactedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
      console.log(`Attempting to store OTP for ${redactedEmail}...`)
    }

    // First verify the user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    })

    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`User not found for verification attempt`)
      }
      return false
    }

    // Store the OTP
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        verificationToken: otp,
        verificationExpires: expires,
      },
      select: {
        id: true,
        email: true,
        verificationToken: true,
        verificationExpires: true,
      },
    })

    if (process.env.NODE_ENV === 'development') {
      console.log("OTP stored successfully:", {
        userId: updatedUser.id,
        tokenStored: !!updatedUser.verificationToken,
        expiresAt: updatedUser.verificationExpires,
      })
    }

    return true
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Failed to store OTP:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    }
    return false
  }
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Redact email in logs even in development
      const redactedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
      console.log(`Starting OTP verification for ${redactedEmail}...`)
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        verificationToken: true,
        verificationExpires: true,
      },
    })

    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`User not found for verification attempt`)
      }
      return false
    }

    if (process.env.NODE_ENV === 'development') {
      console.log("Retrieved user verification data:", {
        userId: user.id,
        hasToken: !!user.verificationToken,
        tokenExpiry: user.verificationExpires,
        currentTime: new Date().toISOString(),
      })
    }

    if (!user.verificationToken || !user.verificationExpires) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`No active OTP found for verification attempt`)
      }
      return false
    }

    if (Date.now() > user.verificationExpires.getTime()) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`OTP expired for verification attempt`, {
          expiredAt: user.verificationExpires,
          currentTime: new Date(),
        })
      }

      // Clear expired token
      await prisma.user.update({
        where: { email },
        data: {
          verificationToken: null,
          verificationExpires: null,
        },
      })
      return false
    }

    if (otp !== user.verificationToken) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Invalid OTP for verification attempt`)
      }
      return false
    }

    // Clear token and mark email as verified
    const verifiedUser = await prisma.user.update({
      where: { email },
      data: {
        verificationToken: null,
        verificationExpires: null,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    })

    if (process.env.NODE_ENV === 'development') {
      console.log("Email verified successfully:", {
        userId: verifiedUser.id,
        verifiedAt: verifiedUser.emailVerified,
      })
    }

    return true
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error during OTP verification:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    }
    return false
  }
}

export async function getOTPStatus(email: string) {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Redact email in logs even in development
      const redactedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
      console.log(`Checking OTP status for ${redactedEmail}...`)
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        verificationToken: true,
        verificationExpires: true,
      },
    })

    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`User not found for verification attempt`)
      }
      return { exists: false }
    }

    const status = {
      exists: !!user.verificationToken,
      isExpired: user.verificationExpires ? Date.now() > user.verificationExpires.getTime() : true,
      expiresAt: user.verificationExpires?.toISOString(),
    }

    if (process.env.NODE_ENV === 'development') {
      console.log("OTP status:", {
        userId: user.id,
        ...status,
      })
    }

    return status
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error checking OTP status:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    }
    return { exists: false, error: "Failed to check OTP status" }
  }
}
