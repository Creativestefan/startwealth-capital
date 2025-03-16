import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"

export async function GET() {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get portfolio summary from database
    // This is a placeholder for now
    const summary = {
      totalValue: 1250000,
      propertyValue: 750000,
      investmentValue: 500000,
      expectedReturns: 75000,
      propertyCount: 3,
      investmentCount: 5,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("[PORTFOLIO_SUMMARY]", error)
    return NextResponse.json(
      { error: "Failed to fetch portfolio summary" },
      { status: 500 }
    )
  }
}

