"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Wallet } from "@/types/wallet"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Wallet as WalletIcon, RefreshCw } from "lucide-react"
import { getWalletStats, getWalletTransactions, getUserWallet } from "@/lib/wallet/actions"
import { format } from "date-fns"

const chartConfig = {
  transactions: {
    label: "Transactions",
  },
  deposits: {
    label: "Deposits",
    color: "hsl(var(--chart-1))",
  },
  payouts: {
    label: "Payouts",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface WalletOverviewProps {
  wallet: Wallet
}

export function WalletOverview({ wallet }: WalletOverviewProps) {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [isLoading, setIsLoading] = React.useState(false)
  const [stats, setStats] = React.useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalPayouts: 0,
    totalReturns: 0
  })
  const [chartData, setChartData] = React.useState<any[]>([])
  const [currentBalance, setCurrentBalance] = React.useState(wallet.balance)

  // Function to fetch wallet statistics
  const fetchWalletStats = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const statsResult = await getWalletStats()
      
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      }
      
      const transactionsResult = await getWalletTransactions()
      
      if (transactionsResult.success && transactionsResult.data) {
        // Process transactions for chart data
        const transactions = transactionsResult.data
        
        // Get the date range based on timeRange
        const endDate = new Date()
        const startDate = new Date()
        
        if (timeRange === "90d") {
          startDate.setDate(endDate.getDate() - 90)
        } else if (timeRange === "30d") {
          startDate.setDate(endDate.getDate() - 30)
        } else if (timeRange === "7d") {
          startDate.setDate(endDate.getDate() - 7)
        }
        
        // Group transactions by date
        const groupedData = new Map()
        
        transactions.forEach(transaction => {
          const date = new Date(transaction.createdAt)
          
          // Skip if outside the selected time range
          if (date < startDate || date > endDate) return
          
          // Format date as YYYY-MM-DD
          const dateKey = format(date, "yyyy-MM-dd")
          
          if (!groupedData.has(dateKey)) {
            groupedData.set(dateKey, { date: dateKey, deposits: 0, payouts: 0 })
          }
          
          const entry = groupedData.get(dateKey)
          
          if (transaction.status === "COMPLETED") {
            if (transaction.type === "DEPOSIT" || transaction.type === "RETURN") {
              entry.deposits += transaction.amount
            } else if (transaction.type === "PAYOUT") {
              entry.payouts += transaction.amount
            }
          }
        })
        
        // Convert map to array and sort by date
        const chartData = Array.from(groupedData.values())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
        setChartData(chartData)
        
        // Update current balance
        const walletResult = await getUserWallet()
        if (walletResult.success && walletResult.data) {
          setCurrentBalance(walletResult.data.balance)
        }
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  // Fetch data on component mount and when timeRange changes
  React.useEffect(() => {
    fetchWalletStats()
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchWalletStats()
    }, 30000) // 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [fetchWalletStats, timeRange])

  // Handle manual refresh
  const handleRefresh = () => {
    fetchWalletStats()
  }

  return (
    <div className="grid gap-6">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isLoading}
          className="gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Updating...' : 'Refresh'}
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Available for investments and withdrawals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deposits
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalDeposits)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime deposits to your wallet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payouts
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPayouts)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime payouts from your wallet
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Overview of your wallet activity
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {chartData.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-deposits)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-deposits)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillPayouts" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-payouts)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-payouts)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="payouts"
                  type="natural"
                  fill="url(#fillPayouts)"
                  stroke="var(--color-payouts)"
                  stackId="a"
                />
                <Area
                  dataKey="deposits"
                  type="natural"
                  fill="url(#fillDeposits)"
                  stroke="var(--color-deposits)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center">
              <p className="text-muted-foreground">
                {isLoading ? "Loading transaction data..." : "No transaction data available for the selected period"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 