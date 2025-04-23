export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma"
import { verifyOTP, getOTPStatus } from "@/lib/otp"

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()
    console.log("OTP verification request received for:", email)

    if (!email || !otp) {
      return Response.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    // Check current OTP status before verification
    const otpStatus = getOTPStatus(email)
    console.log("Current OTP status:", otpStatus)

    const isValid = verifyOTP(email, otp)

    if (!isValid) {
      console.log("OTP verification failed for:", email)
      return Response.json(
        {
          error: "Invalid or expired OTP",
          debug: { otpStatus },
        },
        { status: 400 },
      )
    }

    // Update user's emailVerified status
    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    })

    console.log("Email verified successfully:", user)

    return Response.json({
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    })
  } catch (error) {
    console.error("Failed to verify OTP:", error)
    return Response.json(
      {
        error: "Failed to verify OTP",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

