export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { investmentUpdateSchema } from "@/lib/real-estate/utils/validation"
import { z } from "zod"

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

    // Validate the request body
    const validatedData = investmentUpdateSchema.parse(json)

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
      data: validatedData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[INVESTMENT_PATCH]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const investment = await prisma.realEstateInvestment.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!investment) {
      return new NextResponse("Investment not found", { status: 404 })
    }

    await prisma.realEstateInvestment.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[INVESTMENT_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

