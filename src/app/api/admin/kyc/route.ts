import { authConfig } from "@/lib/auth.config"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authConfig)

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all KYC submissions
    const kycSubmissions = await prisma.kYC.findMany({
      include: {
        user: {
          select: {
            id: true,
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

    return NextResponse.json(kycSubmissions)
  } catch (error) {
    console.error("[ADMIN_KYC_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch KYC submissions" },
      { status: 500 }
    )
  }
}
