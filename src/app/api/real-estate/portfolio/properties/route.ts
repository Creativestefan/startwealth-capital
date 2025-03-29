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

    const where: unknown = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    // Get all user's property transactions
    const propertyTransactions = await prisma.propertyTransaction.findMany({
      where,
      include: {
        property: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(propertyTransactions)
  } catch (error) {
    console.error("[PORTFOLIO_PROPERTIES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

