import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  UsersIcon, 
  HomeIcon, 
  DollarSignIcon, 
  BarChart3Icon, 
  ShieldCheckIcon,
  LeafIcon,
  CreditCardIcon,
  TrendingUpIcon
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect("/login")
  }

  // Ensure user is admin
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Mock data for admin dashboard
  const stats = {
    users: {
      total: 124,
      new: 15,
      kycPending: 8,
      kycApproved: 98
    },
    properties: {
      total: 18,
      available: 12,
      sold: 6,
      totalValue: 12500000
    },
    greenEnergy: {
      totalEquipment: 24,
      soldEquipment: 16,
      totalValue: 3800000
    },
    markets: {
      totalPlans: 3,
      activeInvestments: 42,
      totalValue: 2800000
    },
    investments: {
      total: 87,
      realEstate: 35,
      greenEnergy: 28,
      markets: 24,
      totalValue: 19100000
    },
    revenue: {
      total: 5200000,
      thisMonth: 780000,
      growth: 12.4
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the admin dashboard</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">+{stats.users.new} new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <HomeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.properties.total}</div>
            <p className="text-xs text-muted-foreground">{stats.properties.available} available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.investments.total}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</div>
            <p className="text-xs text-muted-foreground">+{stats.revenue.growth}% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Category Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Real Estate</CardTitle>
              <HomeIcon className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Properties</span>
                <span className="font-medium">{stats.properties.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Investments</span>
                <span className="font-medium">{stats.investments.realEstate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="font-medium">{formatCurrency(stats.properties.totalValue)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Green Energy</CardTitle>
              <LeafIcon className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Equipment</span>
                <span className="font-medium">{stats.greenEnergy.totalEquipment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Investments</span>
                <span className="font-medium">{stats.investments.greenEnergy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="font-medium">{formatCurrency(stats.greenEnergy.totalValue)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Markets</CardTitle>
              <BarChart3Icon className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plans</span>
                <span className="font-medium">{stats.markets.totalPlans}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Investments</span>
                <span className="font-medium">{stats.investments.markets}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="font-medium">{formatCurrency(stats.markets.totalValue)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User & KYC Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Total Users</div>
                  <div className="text-2xl font-bold">{stats.users.total}</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">New Users</div>
                  <div className="text-2xl font-bold">{stats.users.new}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">KYC Pending</span>
                  <span className="font-medium">{stats.users.kycPending}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-yellow-500 h-2.5 rounded-full" 
                    style={{ width: `${(stats.users.kycPending / stats.users.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">KYC Approved</span>
                  <span className="font-medium">{stats.users.kycApproved}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${(stats.users.kycApproved / stats.users.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: UsersIcon, color: "text-blue-500", text: "New user registration", time: "2 minutes ago" },
                { icon: ShieldCheckIcon, color: "text-yellow-500", text: "KYC verification pending", time: "15 minutes ago" },
                { icon: CreditCardIcon, color: "text-green-500", text: "New investment transaction", time: "1 hour ago" },
                { icon: HomeIcon, color: "text-pink-500", text: "Property purchased", time: "3 hours ago" },
                { icon: TrendingUpIcon, color: "text-purple-500", text: "Market investment matured", time: "5 hours ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full bg-muted flex items-center justify-center",
                    item.color
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.text}</p>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 