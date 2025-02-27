import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log("Database connected successfully")

    // Get database status
    const databaseUrl = process.env.DATABASE_URL?.replace(/:[^:@]{1,}@/, ":****@") // Hide password

    // Get all users with verification status
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return Response.json({
      success: true,
      database: {
        status: "connected",
        url: databaseUrl,
      },
      users: {
        count: users.length,
        list: users.map((user) => ({
          ...user,
          emailVerified: user.emailVerified ? "Verified" : "Not Verified",
          createdAt: user.createdAt.toISOString(),
        })),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        database: {
          status: "error",
          url: process.env.DATABASE_URL?.replace(/:[^:@]{1,}@/, ":****@"),
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      },
    )
  } finally {
    await prisma.$disconnect()
  }
}

