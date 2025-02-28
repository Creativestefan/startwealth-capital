import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { EmptyState } from "@/components/dashboard/empty-state"
import { InvestmentChart } from "@/components/dashboard/analytics/investment-chart"
import { InvestmentSummary } from "@/components/dashboard/analytics/investment-summary"

// This would come from your database
async function getInvestmentData() {
  // Simulated data - replace with actual database query
  const hasInvestments = true // Toggle this to test empty state

  if (!hasInvestments) {
    return null
  }

  return {
    summary: {
      realEstate: {
        totalValue: 2500000,
        count: 4,
        growth: 12.5,
      },
      greenEnergy: {
        totalValue: 1800000,
        count: 6,
        growth: 15.2,
      },
      markets: {
        totalValue: 800000,
        count: 12,
        growth: 8.7,
      },
    },
    charts: {
      realEstate: [
        { name: "Jan", value: 2300000 },
        { name: "Feb", value: 2400000 },
        { name: "Mar", value: 2450000 },
        { name: "Apr", value: 2480000 },
        { name: "May", value: 2500000 },
      ],
      greenEnergy: [
        { name: "Jan", value: 1500000 },
        { name: "Feb", value: 1600000 },
        { name: "Mar", value: 1650000 },
        { name: "Apr", value: 1750000 },
        { name: "May", value: 1800000 },
      ],
      markets: [
        { name: "Jan", value: 700000 },
        { name: "Feb", value: 800000 },
        { name: "Mar", value: 750000 },
        { name: "Apr", value: 780000 },
        { name: "May", value: 800000 },
      ],
    },
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect("/login")
  }

  const data = await getInvestmentData()

  if (!data) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {session.user.firstName}!</h1>
          <p className="text-muted-foreground">Start building your investment portfolio today</p>
        </div>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {session.user.firstName}!</h1>
        <p className="text-muted-foreground">Here's an overview of your investment portfolio</p>
      </div>

      <InvestmentSummary
        realEstate={data.summary.realEstate}
        greenEnergy={data.summary.greenEnergy}
        markets={data.summary.markets}
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <InvestmentChart
          title="Real Estate Performance"
          description="Real estate portfolio value over time"
          data={data.charts.realEstate}
          className="xl:col-span-1"
        />
        <InvestmentChart
          title="Green Energy Performance"
          description="Green energy investments value over time"
          data={data.charts.greenEnergy}
          className="xl:col-span-1"
        />
        <InvestmentChart
          title="Markets Performance"
          description="Market investments value over time"
          data={data.charts.markets}
          className="xl:col-span-1"
        />
      </div>
    </div>
  )
}

