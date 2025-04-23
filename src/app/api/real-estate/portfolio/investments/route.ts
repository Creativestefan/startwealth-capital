export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const where: unknown = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    // Get all user's real estate investments
    const realEstateInvestments = await prisma.realEstateInvestment.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(realEstateInvestments)
  } catch (error) {
    console.error("[PORTFOLIO_INVESTMENTS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

