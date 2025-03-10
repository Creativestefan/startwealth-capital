import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { EmptyState } from "@/components/dashboard/empty-state"
import { InvestmentChart } from "@/components/dashboard/analytics/investment-chart"
import { InvestmentSummary } from "@/components/dashboard/analytics/investment-summary"

export default async function DashboardPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect("/login")
  }

  // Check if user is admin and redirect if needed
  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard")
  }

  // Only check email verification if the property exists
  if (session.user.emailVerified === null) {
    console.log("Email not verified in dashboard")
    redirect(`/verify-email?email=${session.user.email}`)
  }

  // Get investment data with error handling
  let data
  try {
    data = await getInvestmentData()
  } catch (error) {
    console.error("Error fetching investment data:", error)
    data = null
  }

  // Extract name from session, with fallback
  const userName = `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || "there"

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Start building your investment portfolio today</p>
        </div>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">Here's an overview of your investment portfolio</p>
      </div>
      
      {/* Investment Summary */}
      <div className="w-full">
        <InvestmentSummary 
          realEstate={data.investments.realEstate}
          greenEnergy={data.investments.greenEnergy}
          markets={data.investments.markets}
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="md:col-span-1 xl:col-span-1">
          <InvestmentChart 
            title="Real Estate Performance"
            description="Real estate portfolio value over time"
            data={data.chartData.realEstate}
          />
        </div>
        <div className="md:col-span-1 xl:col-span-1">
          <InvestmentChart 
            title="Green Energy Performance"
            description="Green energy investments value over time"
            data={data.chartData.greenEnergy}
          />
        </div>
        <div className="md:col-span-2 xl:col-span-1">
          <InvestmentChart 
            title="Markets Performance"
            description="Market investments value over time"
            data={data.chartData.markets}
          />
        </div>
      </div>
    </div>
  )
}

async function getInvestmentData() {
  // For testing purposes, return null to show the empty state
  // return null;
  
  // Or return mock data in the correct format
  return {
    investments: {
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
    chartData: {
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
    }
  }
}

