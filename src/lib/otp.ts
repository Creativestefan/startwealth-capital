import { prisma } from "@/lib/prisma"

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function storeOTP(email: string, otp: string) {
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

  try {
    console.log(`Attempting to store OTP for ${email}...`)

    // First verify the user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    })

    if (!user) {
      console.error(`User not found for email: ${email}`)
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

    console.log("OTP stored successfully:", {
      userId: updatedUser.id,
      email: updatedUser.email,
      tokenStored: !!updatedUser.verificationToken,
      expiresAt: updatedUser.verificationExpires,
    })

    return true
  } catch (error) {
    console.error("Failed to store OTP:", {
      email,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
    return false
  }
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  try {
    console.log(`Starting OTP verification for ${email}...`)

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        verificationToken: true,
        verificationExpires: true,
      },
    })

    if (!user) {
      console.error(`User not found for email: ${email}`)
      return false
    }

    console.log("Retrieved user verification data:", {
      userId: user.id,
      hasToken: !!user.verificationToken,
      tokenExpiry: user.verificationExpires,
      currentTime: new Date().toISOString(),
    })

    if (!user.verificationToken || !user.verificationExpires) {
      console.error(`No active OTP found for ${email}`)
      return false
    }

    if (Date.now() > user.verificationExpires.getTime()) {
      console.error(`OTP expired for ${email}`, {
        expiredAt: user.verificationExpires,
        currentTime: new Date(),
      })

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
      console.error(`Invalid OTP for ${email}`, {
        providedOTP: otp,
        storedToken: user.verificationToken,
      })
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

    console.log("Email verified successfully:", {
      userId: verifiedUser.id,
      email: verifiedUser.email,
      verifiedAt: verifiedUser.emailVerified,
    })

    return true
  } catch (error) {
    console.error("Error during OTP verification:", {
      email,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
    return false
  }
}

export async function getOTPStatus(email: string) {
  try {
    console.log(`Checking OTP status for ${email}...`)

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        verificationToken: true,
        verificationExpires: true,
      },
    })

    if (!user) {
      console.error(`User not found for email: ${email}`)
      return { exists: false }
    }

    const status = {
      exists: !!user.verificationToken,
      isExpired: user.verificationExpires ? Date.now() > user.verificationExpires.getTime() : true,
      expiresAt: user.verificationExpires?.toISOString(),
    }

    console.log("OTP status:", {
      userId: user.id,
      ...status,
    })

    return status
  } catch (error) {
    console.error("Error checking OTP status:", {
      email,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
    return { exists: false, error: "Failed to check OTP status" }
  }
}

