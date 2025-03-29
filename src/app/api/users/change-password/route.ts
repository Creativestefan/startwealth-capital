export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"
import { z } from "zod"

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Current password is required.",
    }),
    newPassword: z.string().min(8, {
      message: "New password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Please confirm your new password.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const result = passwordChangeSchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: result.error.format() }, { status: 400 })
    }

    const { currentPassword, newPassword } = result.data

    // Get user with password
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        password: true,
      },
    })

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return Response.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    return Response.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Failed to change password:", error)
    return Response.json({ error: "Failed to change password" }, { status: 500 })
  }
}
