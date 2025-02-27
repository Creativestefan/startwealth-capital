import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get all users with minimal sensitive data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        role: true,
        kyc: {
          select: {
            status: true,
          },
        },
        wallet: {
          select: {
            balance: true,
          },
        },
      },
    })

    return Response.json({
      users,
      count: users.length,
    })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return Response.json(
      { error: "Failed to fetch users", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Add DELETE method to clean up test users if needed
export async function DELETE(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.delete({
      where: { email },
    })

    return Response.json({
      message: "User deleted successfully",
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Failed to delete user:", error)
    return Response.json(
      { error: "Failed to delete user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

