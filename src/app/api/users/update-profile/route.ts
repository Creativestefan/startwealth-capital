import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProfileSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const result = updateProfileSchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: result.error.format() }, { status: 400 })
    }

    const { firstName, lastName } = result.data

    // Check if email is being changed (which we don't allow)
    if (result.data.email !== session.user.email) {
      return Response.json({ error: "Email cannot be changed" }, { status: 400 })
    }

    // Update user profile
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firstName,
        lastName,
      },
    })

    return Response.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Failed to update profile:", error)
    return Response.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
