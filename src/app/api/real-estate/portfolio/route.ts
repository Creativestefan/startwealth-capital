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

    // Get all user's property transactions
    const propertyTransactions = await prisma.propertyTransaction.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      include: {
        property: true,
      },
    })

    // Get all user's real estate investments
    const realEstateInvestments = await prisma.realEstateInvestment.findMany({
      where: {
        userId: session.user.id,
      },
    })

    // Calculate portfolio value
    const propertyValue = propertyTransactions.reduce((total, tx) => total + Number.parseFloat(tx.amount.toString()), 0)

    const investmentValue = realEstateInvestments.reduce(
      (total, inv) => total + Number.parseFloat(inv.amount.toString()),
      0,
    )

    // Calculate expected returns
    const expectedReturns = realEstateInvestments.reduce(
      (total, inv) => total + Number.parseFloat(inv.expectedReturn.toString()),
      0,
    )

    // Group properties by status
    const propertiesByStatus = propertyTransactions.reduce(
      (acc, tx) => {
        const status = tx.property.status
        if (!acc[status]) {
          acc[status] = []
        }
        acc[status].push(tx)
        return acc
      },
      {} as Record<string, typeof propertyTransactions>,
    )

    // Group investments by type
    const investmentsByType = realEstateInvestments.reduce(
      (acc, inv) => {
        const type = inv.type
        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(inv)
        return acc
      },
      {} as Record<string, typeof realEstateInvestments>,
    )

    const portfolio = {
      summary: {
        totalValue: propertyValue + investmentValue,
        propertyValue,
        investmentValue,
        expectedReturns,
        propertyCount: propertyTransactions.length,
        investmentCount: realEstateInvestments.length,
      },
      properties: propertyTransactions,
      investments: realEstateInvestments,
      propertiesByStatus,
      investmentsByType,
    }

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error("[PORTFOLIO_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

