import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { getUserPortfolio } from "@/lib/real-estate/actions/portfolio"

export async function GET() {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await getUserPortfolio()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[API_PORTFOLIO]", error)
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    )
  }
}

