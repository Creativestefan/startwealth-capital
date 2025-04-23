export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, otp, password } = await request.json()

    if (!email || !otp || !password) {
      return Response.json({ error: "Email, OTP, and password are required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return Response.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    if (user.resetOtp !== otp) {
      return Response.json({ error: "Invalid OTP" }, { status: 400 })
    }

    if (user.resetOtpExpires < new Date()) {
      return Response.json({ error: "OTP has expired" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpires: null,
      },
    })

    return Response.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Failed to reset password:", error)
    return Response.json({ error: "Failed to reset password" }, { status: 500 })
  }
}

