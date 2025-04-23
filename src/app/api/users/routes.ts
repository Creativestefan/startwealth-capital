import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection first
    await prisma.$connect()
    console.log("Database connected successfully")

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

    console.log(`Found ${users.length} users`)

    return Response.json({
      success: true,
      users,
      count: users.length,
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]{1,}@/, ":****@"), // Hide password
    })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
        databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]{1,}@/, ":****@"), // Hide password
      },
      { status: 500 },
    )
  }
}

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
      success: true,
      message: "User deleted successfully",
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Failed to delete user:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

