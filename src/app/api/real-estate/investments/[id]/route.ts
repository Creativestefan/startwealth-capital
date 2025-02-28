import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const investment = await prisma.realEstateInvestment.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!investment) {
      return new NextResponse("Investment not found", { status: 404 })
    }

    return NextResponse.json(investment)
  } catch (error) {
    console.error("[INVESTMENT_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const { reinvest } = json

    const investment = await prisma.realEstateInvestment.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!investment) {
      return new NextResponse("Investment not found", { status: 404 })
    }

    const updated = await prisma.realEstateInvestment.update({
      where: {
        id: params.id,
      },
      data: {
        reinvest,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[INVESTMENT_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

