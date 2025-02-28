import { prisma } from "@/lib/prisma"
import { generateResetToken } from "@/lib/auth-utils"
import { sendPasswordResetEmail } from "@/lib/mail"

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
      return Response.json({ message: "If a user exists with this email, they will receive a password reset link." })
    }

    const token = generateResetToken()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    await prisma.user.update({
      where: { email },
      data: {
        verificationToken: token,
        verificationExpires: expires,
      },
    })

    await sendPasswordResetEmail(email, token)

    return Response.json({ message: "Password reset email sent successfully" })
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    return Response.json({ error: "Failed to send password reset email" }, { status: 500 })
  }
}

