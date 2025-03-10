import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user || session.user.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all KYC submissions with user information
    const submissions = await prisma.kYC.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    })

    return Response.json({ submissions })
  } catch (error) {
    console.error("Failed to fetch KYC submissions:", error)
    return Response.json({ error: "Failed to fetch KYC submissions" }, { status: 500 })
  }
}
