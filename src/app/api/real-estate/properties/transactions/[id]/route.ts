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

    const transaction = await prisma.propertyTransaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        property: true,
      },
    })

    if (!transaction) {
      return new NextResponse("Transaction not found", { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("[TRANSACTION_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

