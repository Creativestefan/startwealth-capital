export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma"
import { sendPasswordResetOtpEmail } from "@/lib/mail"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Return success even if user doesn't exist for security
      return Response.json({ message: "If a user exists with this email, they will receive a password reset OTP." })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 min expiry

    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: otp,
        resetOtpExpires: expires,
      },
    })

    await sendPasswordResetOtpEmail(email, otp)

    return Response.json({ message: "Password reset OTP sent successfully" })
  } catch (error) {
    console.error("Failed to send password reset OTP:", error)
    return Response.json({ error: "Failed to send password reset OTP" }, { status: 500 })
  }
}

