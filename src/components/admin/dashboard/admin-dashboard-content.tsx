"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  BarChart3, 
  Users, 
  Home, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Leaf,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Clock,
  FileText,
  Wallet,
  RefreshCw,
  MoreHorizontal
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { DashboardChart } from "./dashboard-chart"
import { DashboardPieChart } from "./dashboard-pie-chart"
import { DashboardSkeleton } from "./dashboard-skeleton"
import { 
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Rectangle, 
  XAxis,
  YAxis
} from "recharts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define interfaces for our data structure
interface UserInfo {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  user: UserInfo
}

interface WalletTransaction {
  id: string
  type: string
  amount: string
  status: string
  createdAt: string
  wallet: {
    id: string
    user: UserInfo
  }
}

interface DashboardStats {
  users: {
    total: number
    new: number
    kycPending: number
    kycApproved: number
    kycRejected: number
  }
  properties: {
    total: number
    available: number
    sold: number
    pending: number
    totalValue: number
  }
  greenEnergy: {
    totalEquipment: number
    soldEquipment: number
    investments: number
    activeInvestments: number
    totalValue: number
  }
  markets: {
    totalPlans: number
    investments: number
    activeInvestments: number
    totalValue: number
  }
  investments: {
    total: number
    realEstate: number
    greenEnergy: number
    markets: number
    totalValue: number
  }
  revenue: {
    total: number
    thisMonth: number
    previousMonth: number
    growth: number
  }
  activities: Activity[]
  recentTransactions: WalletTransaction[]
}

// Fetch dashboard stats from API
async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/admin/dashboard/stats")
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats")
  }
  return response.json()
}

export function AdminDashboardContent() {
  const [timeRange, setTimeRange] = useState("30days")
  
  // Fetch dashboard stats with react-query
  const { 
    data: stats, 
    isLoading, 
    isError,
    refetch,
    error
  } = useQuery({
    queryKey: ["adminDashboardStats", timeRange],
    queryFn: fetchDashboardStats,
    refetchInterval: 60000, // Refresh every minute
  })

  // If loading, show skeleton
  if (isLoading) {
    return <DashboardSkeleton />
  }

  // If error, show error state with more details
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="rounded-full bg-red-100 p-3">
          <FileText className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold">Failed to load dashboard data</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {error instanceof Error ? error.message : "An unknown error occurred while fetching data from the database"}
        </p>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          This could be due to missing tables in the database schema or configuration issues.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  // At this point, stats should be defined since we've handled loading and error states
  if (!stats) {
    return <DashboardSkeleton />
  }

  // Prepare chart data for revenue with safeguards
  const revenueChartData = [
    { name: "Previous Month", value: stats.revenue?.previousMonth || 0 },
    { name: "This Month", value: stats.revenue?.thisMonth || 0 },
  ]

  // Prepare pie chart data for investments with safeguards
  const investmentsPieData = [
    { name: "Real Estate", value: stats.investments?.realEstate || 0, color: "#ef4444" },
    { name: "Green Energy", value: stats.investments?.greenEnergy || 0, color: "#22c55e" },
    { name: "Markets", value: stats.investments?.markets || 0, color: "#f97316" },
  ]

  const handleTransactionAction = (transactionId: string, action: string, type?: string, userId?: string) => {
    // In a real implementation, you would call your API endpoints here
    console.log(`Transaction ${transactionId}: ${action}, Type: ${type || 'general'}, UserId: ${userId || 'unknown'}`);
    
    // Show a toast notification for demonstration
    switch(action) {
      case "approve":
        alert(`Transaction ${transactionId} approved successfully`);
        break;
      case "reject":
        alert(`Transaction ${transactionId} rejected`);
        break;
      case "contact":
        window.open(`/admin/messages/new?userId=${userId || transactionId}`, '_blank');
        break;
      case "details":
        // Route to the appropriate transaction details page based on type
        if (type === "property" || type === "real_estate") {
          window.open(`/admin/properties/transactions/${transactionId}`, '_blank');
        } else if (type === "equipment" || type === "green_energy") {
          window.open(`/admin/green-energy/transactions/${transactionId}`, '_blank');
        } else if (type === "market") {
          window.open(`/admin/markets/transactions/${transactionId}`, '_blank');
        } else if (type === "DEPOSIT" || type === "deposit" || type === "WITHDRAWAL" || type === "withdrawal") {
          // For wallet transactions, navigate to user wallet details
          if (userId) {
            window.open(`/admin/users/wallets/${userId}`, '_blank');
          } else {
            // Fallback to transactions page
            window.open(`/admin/transactions/${transactionId}`, '_blank');
          }
        } else {
          // Default to general transactions
          window.open(`/admin/transactions/${transactionId}`, '_blank');
        }
        break;
      default:
        // No action
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={formatNumber(stats.users?.total || 0)}
          description={`+${stats.users?.new || 0} new this month`}
          icon={<Users className="h-4 w-4" />}
          trend={stats.users?.new > 0 ? "up" : "neutral"}
        />
        <StatCard 
          title="Properties" 
          value={formatNumber(stats.properties?.total || 0)}
          description={`${stats.properties?.available || 0} available`}
          icon={<Home className="h-4 w-4" />}
          trend={stats.properties?.sold > 0 ? "up" : "neutral"}
        />
        <StatCard 
          title="Total Investments" 
          value={formatNumber(stats.investments?.total || 0)}
          description="Across all categories"
          icon={<BarChart3 className="h-4 w-4" />}
          trend="neutral"
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.revenue?.total || 0)}
          description={`${stats.revenue?.growth > 0 ? '+' : ''}${(stats.revenue?.growth || 0).toFixed(1)}% from last month`}
          icon={<DollarSign className="h-4 w-4" />}
          trend={stats.revenue?.growth > 0 ? "up" : "down"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{
                value: { label: "Revenue" },
                "Previous Month": { label: "Previous Month", color: "hsl(var(--chart-2))" },
                "This Month": { label: "This Month", color: "hsl(var(--chart-1))" },
              }}
              className="h-[250px]"
            >
              <BarChart accessibilityLayer data={revenueChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent 
                      hideLabel 
                      formatter={(value: unknown) => formatCurrency(Number(value))} 
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  strokeWidth={2}
                  radius={8}
                  activeIndex={1}
                  fill="hsl(var(--primary))"
                  barSize={60}
                  activeBar={({ ...props }) => {
                    return (
                      <Rectangle
                        {...props}
                        fillOpacity={0.8}
                        stroke={props.fill}
                        strokeDasharray={4}
                        strokeDashoffset={4}
                      />
                    )
                  }}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              {stats.revenue?.growth > 0 ? (
                <>
                  Trending up by {(stats.revenue?.growth || 0).toFixed(1)}% this month <TrendingUp className="h-4 w-4 text-green-500" />
                </>
              ) : (
                <>
                  Trending down by {Math.abs(stats.revenue?.growth || 0).toFixed(1)}% this month <TrendingDown className="h-4 w-4 text-red-500" />
                </>
              )}
            </div>
            <div className="leading-none text-muted-foreground">
              Comparing revenue between current and previous month
            </div>
          </CardFooter>
        </Card>
        <Card className="md:col-span-1">
          <DashboardPieChart
            title="Investment Distribution"
            subtitle="All Categories"
            data={[
              { name: "Real Estate", value: stats.investments?.realEstate || 0, color: "#ef4444" },
              { name: "Green Energy", value: stats.investments?.greenEnergy || 0, color: "#22c55e" },
              { name: "Markets", value: stats.investments?.markets || 0, color: "#f97316" },
            ]}
            trend={
              stats.investments?.total > 0 
                ? { 
                    value: 5.2, // This would ideally be calculated from your data
                    direction: "up" 
                  }
                : undefined
            }
            footerText="Distribution of investments across categories"
          />
        </Card>
      </div>

      {/* Category Breakdown */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Category Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Real Estate</CardTitle>
              <Home className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Properties</span>
                <span className="font-medium">{stats.properties?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Investments</span>
                <span className="font-medium">{stats.investments?.realEstate || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="font-medium">{formatCurrency(stats.properties?.totalValue || 0)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Green Energy</CardTitle>
              <Leaf className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Equipment</span>
                <span className="font-medium">{stats.greenEnergy?.totalEquipment || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Investments</span>
                <span className="font-medium">{stats.investments?.greenEnergy || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="font-medium">{formatCurrency(stats.greenEnergy?.totalValue || 0)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Markets</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-500" />
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

      {/* User Statistics and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Statistics with horizontal bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center px-2 mb-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Total Users</span>
                <span className="text-xl font-bold">{stats.users?.total || 0}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-muted-foreground text-xs">New This Month</span>
                <span className="text-xl font-bold text-green-600">{stats.users?.new || 0}</span>
              </div>
            </div>
            
            <ChartContainer 
              config={{
                count: { label: "Count" },
                "Approved": { label: "Approved", color: "hsl(var(--chart-2))" },
                "Pending": { label: "Pending", color: "hsl(var(--chart-3))" },
                "Rejected": { label: "Rejected", color: "hsl(var(--chart-4))" },
              }}
            >
              <BarChart
                accessibilityLayer
                data={[
                  { status: "Approved", count: stats.users?.kycApproved || 0, fill: "hsl(var(--chart-2))" },
                  { status: "Pending", count: stats.users?.kycPending || 0, fill: "hsl(var(--chart-3))" },
                  { status: "Rejected", count: stats.users?.kycRejected || 0, fill: "hsl(var(--chart-4))" },
                ]}
                layout="vertical"
                margin={{ left: 70, right: 20 }}
              >
                <YAxis
                  dataKey="status"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={60}
                />
                <XAxis dataKey="count" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel formatter={(value: unknown) => formatNumber(Number(value))} />}
                />
                <Bar 
                  dataKey="count" 
                  layout="vertical" 
                  radius={5}
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {stats.users?.kycApproved > (stats.users?.total || 1) * 0.5 ? (
                <>
                  Good KYC completion rate <TrendingUp className="h-4 w-4 text-green-500" />
                </>
              ) : (
                <>
                  Low KYC completion rate <TrendingDown className="h-4 w-4 text-yellow-500" />
                </>
              )}
            </div>
            <div className="leading-none text-muted-foreground">
              KYC status distribution across all users
            </div>
          </CardFooter>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 overflow-hidden">
              {stats.activities && stats.activities.length > 0 ? (
                stats.activities.slice(0, 5).map((activity: Activity, i: number) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <ActivityIcon type={activity.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {activity.user?.firstName || ''} {activity.user?.lastName || ''}
                        </p>
                        <p className="text-xs font-medium">
                          {activity.timestamp ? formatTimeAgo(activity.timestamp) : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-6">No recent activity</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3 pb-2">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View All Activity
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Redesigned Recent Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activities</CardDescription>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="investment">Investments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <div className="grid grid-cols-4 md:grid-cols-6 bg-muted/50 px-4 py-2 text-xs font-medium">
                <div>User</div>
                <div className="hidden md:block">Type</div>
                <div>Amount</div>
                <div>Status</div>
                <div className="hidden md:block">Date</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="divide-y">
                {stats.recentTransactions.slice(0, 5).map((tx: WalletTransaction, i: number) => (
                  <div key={i} className="grid grid-cols-4 md:grid-cols-6 px-4 py-3 text-sm items-center">
                    <div className="flex items-center gap-2 truncate">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">
                          {tx.wallet?.user?.firstName?.[0] || ''} {tx.wallet?.user?.lastName?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-xs">
                        {tx.wallet?.user?.firstName || ''} {tx.wallet?.user?.lastName || ''}
                      </span>
                    </div>
                    <div className="hidden md:block capitalize text-xs">
                      {tx.type?.toLowerCase() || ''}
                    </div>
                    <div className="text-xs font-medium">
                      {formatCurrency(Number(tx.amount || 0))}
                    </div>
                    <div>
                      <TransactionStatusBadge status={tx.status || ''} />
                    </div>
                    <div className="hidden md:block text-xs text-muted-foreground">
                      {tx.createdAt ? formatTime(tx.createdAt) : ''}
                    </div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleTransactionAction(tx.id, "details", tx.type, tx.wallet?.user?.id)}>
                            View Details
                          </DropdownMenuItem>
                          {tx.status === "PENDING" && (
                            <>
                              <DropdownMenuItem onClick={() => handleTransactionAction(tx.id, "approve", tx.type, tx.wallet?.user?.id)}>
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTransactionAction(tx.id, "reject", tx.type, tx.wallet?.user?.id)}>
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleTransactionAction(tx.id, "contact", tx.type, tx.wallet?.user?.id)}>
                            Contact User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>No recent transactions</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-3 pb-2 flex justify-between">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-medium">{stats.recentTransactions?.length || 0}</span> of <span className="font-medium">{stats.recentTransactions?.length || 0}</span> transactions
          </div>
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <a href="/admin/transactions/all">View All Transactions</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Helper components
interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

function StatCard({ title, value, description, icon, trend = "neutral" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-muted-foreground">{icon}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{title} statistics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          {trend === "up" && <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />}
          {trend === "down" && <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />}
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

interface ActivityIconProps {
  type: string
}

function ActivityIcon({ type }: ActivityIconProps) {
  const iconMap = {
    USER_REGISTRATION: { icon: Users, color: "text-blue-500 bg-blue-100" },
    KYC_VERIFICATION: { icon: UserCheck, color: "text-yellow-500 bg-yellow-100" },
    INVESTMENT: { icon: TrendingUp, color: "text-green-500 bg-green-100" },
    PROPERTY_PURCHASE: { icon: Home, color: "text-pink-500 bg-pink-100" },
    TRANSACTION: { icon: Wallet, color: "text-purple-500 bg-purple-100" },
    DEFAULT: { icon: Clock, color: "text-gray-500 bg-gray-100" }
  } as const
  
  const { icon: Icon, color } = iconMap[type as keyof typeof iconMap] || iconMap.DEFAULT
  
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
  )
}

interface TransactionStatusBadgeProps {
  status: string
}

function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const variants = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    COMPLETED: "bg-green-100 text-green-800 border-green-300",
    FAILED: "bg-red-100 text-red-800 border-red-300",
    PROCESSING: "bg-blue-100 text-blue-800 border-blue-300",
    CANCELLED: "bg-gray-100 text-gray-800 border-gray-300"
  } as const
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full capitalize ${variants[status as keyof typeof variants] || variants.PENDING}`}>
      {status.toLowerCase()}
    </span>
  )
}

// Helper function to format time
function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Add a new helper function to format time as "time ago"
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval}y ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval}mo ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval}d ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval}h ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval}m ago`;
  }
  
  return `${Math.floor(seconds)}s ago`;
} 