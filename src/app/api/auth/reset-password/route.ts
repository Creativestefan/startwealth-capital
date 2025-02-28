import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return Response.json({ error: "Token and password are required" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return Response.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null,
        verificationExpires: null,
      },
    })

    return Response.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Failed to reset password:", error)
    return Response.json({ error: "Failed to reset password" }, { status: 500 })
  }
}

