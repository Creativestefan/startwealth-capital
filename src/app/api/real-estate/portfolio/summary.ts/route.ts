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

    // Count active investments
    const activeInvestments = realEstateInvestments.filter((inv) => inv.status === "ACTIVE").length

    // Count pending installments
    const pendingInstallments = propertyTransactions.filter(
      (tx) => tx.type === "INSTALLMENT" && tx.status === "PENDING",
    ).length

    const summary = {
      totalValue: propertyValue + investmentValue,
      propertyValue,
      investmentValue,
      expectedReturns,
      propertyCount: propertyTransactions.length,
      investmentCount: realEstateInvestments.length,
      activeInvestments,
      pendingInstallments,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("[PORTFOLIO_SUMMARY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

