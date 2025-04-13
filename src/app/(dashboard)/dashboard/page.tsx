import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { EmptyState } from "@/components/dashboard/empty-state"
import { InvestmentChart } from "@/components/dashboard/analytics/investment-chart"
import { InvestmentSummary } from "@/components/dashboard/analytics/investment-summary"
import { getUserDashboardStats } from "@/lib/data/dashboard"

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
    data = await getUserDashboardStats(session.user.id)
  } catch (error) {
    console.error("Error fetching investment data:", error)
    data = null
  }

  // Extract name from session, with fallback
  const userName = `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || "there"

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-xl font-medium tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-sm text-muted-foreground">Start building your investment portfolio today</p>
        </div>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="mb-4">
        <h1 className="text-xl font-medium tracking-tight">Welcome back, {userName}!</h1>
 
        <p className="text-sm text-muted-foreground">Here's an overview of your investment portfolio</p>
      </div>
      
      {/* Investment Summary */}
      <div className="w-full mb-6">
        <InvestmentSummary 
          realEstate={data.investments.realEstate}
          greenEnergy={data.investments.greenEnergy}
          markets={data.investments.markets}
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
      
      {/* Recent Activity Section */}
      <div className="mt-6">
        <h2 className="text-base font-medium mb-4">Recent Activity</h2>
        <div className="bg-card rounded-lg border shadow-sm p-4">
          <div className="space-y-4">
            {data.recentActivity?.length > 0 ? (
              data.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'deposit' ? 'bg-green-500' : 
                    activity.type === 'withdrawal' ? 'bg-red-500' : 
                    activity.type === 'investment' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  <div className={`text-sm font-medium ${
                    activity.type === 'deposit' ? 'text-green-600' : 
                    activity.type === 'withdrawal' ? 'text-red-600' : 
                    'text-blue-600'
                  }`}>
                    {activity.amount}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
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
    },
    recentActivity: [
      {
        type: "deposit",
        description: "Wallet Deposit",
        date: "Today, 2:30 PM",
        amount: "+$50,000"
      },
      {
        type: "investment",
        description: "Real Estate Investment - Skyline Towers",
        date: "Yesterday, 11:15 AM",
        amount: "$250,000"
      },
      {
        type: "withdrawal",
        description: "Wallet Withdrawal",
        date: "May 15, 2024",
        amount: "-$15,000"
      }
    ]
  }
}

