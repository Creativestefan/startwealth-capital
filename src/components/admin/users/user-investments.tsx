"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Coins, TrendingUp, Home, Leaf, ArrowDown, ArrowUp, HelpCircle, Info } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface InvestmentStats {
  realEstate: {
    totalInvested: number
    count: number
    return: number
  }
  greenEnergy: {
    totalInvested: number
    count: number
    return: number
  }
  markets: {
    totalInvested: number
    count: number
    return: number
  }
  chartData: {
    month: string
    realEstate: number
    greenEnergy: number
    markets: number
  }[]
  chartConfig: ChartConfig
}

export default function UserInvestments({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  
  const { data, isLoading, isError } = useQuery<InvestmentStats>({
    queryKey: ["investments", userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/investments`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch investment data")
      }
      
      return response.json()
    }
  })
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-muted/20 rounded-md animate-pulse" />
        </CardContent>
      </Card>
    )
  }
  
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investments</CardTitle>
          <CardDescription>Error loading investment data</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">Failed to load investment data</p>
        </CardContent>
      </Card>
    )
  }
  
  // Mock data for demonstration if no data is available
  const mockChartConfig = {
    realEstate: {
      label: "Real Estate",
      color: "#3b82f6" // blue
    },
    greenEnergy: {
      label: "Green Energy",
      color: "#10b981" // green
    },
    markets: {
      label: "Markets",
      color: "#8b5cf6" // purple
    }
  } satisfies ChartConfig;
  
  const mockData = {
    realEstate: {
      totalInvested: 0,
      count: 0,
      return: 0,
    },
    greenEnergy: {
      totalInvested: 0,
      count: 0,
      return: 0,
    },
    markets: {
      totalInvested: 0,
      count: 0,
      return: 0,
    },
    chartData: [
      { month: "Jan", realEstate: 0, greenEnergy: 0, markets: 0 },
      { month: "Feb", realEstate: 0, greenEnergy: 0, markets: 0 },
      { month: "Mar", realEstate: 0, greenEnergy: 0, markets: 0 },
      { month: "Apr", realEstate: 0, greenEnergy: 0, markets: 0 },
      { month: "May", realEstate: 0, greenEnergy: 0, markets: 0 },
      { month: "Jun", realEstate: 0, greenEnergy: 0, markets: 0 },
    ],
    chartConfig: mockChartConfig
  }
  
  const stats = data || mockData
  
  const totalInvested = 
    stats.realEstate.totalInvested + 
    stats.greenEnergy.totalInvested + 
    stats.markets.totalInvested
  
  const totalReturn = 
    stats.realEstate.return + 
    stats.greenEnergy.return + 
    stats.markets.return
  
  const returnPercentage = totalInvested > 0 
    ? ((totalReturn / totalInvested) * 100).toFixed(2) 
    : "0.00"
  
  const isPositiveReturn = totalReturn >= 0

  // Check if the user has any investments
  const hasInvestments = 
    stats.realEstate.count > 0 || 
    stats.greenEnergy.count > 0 || 
    stats.markets.count > 0

  // Check if there's any data in the chart
  const hasChartData = stats.chartData.some(dataPoint => 
    dataPoint.realEstate > 0 || dataPoint.greenEnergy > 0 || dataPoint.markets > 0
  )
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Coins className="mr-2 h-5 w-5 text-muted-foreground" />
          Investments and Returns
        </CardTitle>
        <CardDescription>
          Overview of user's investment portfolio across all platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 sm:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="real-estate">Real Estate</TabsTrigger>
            <TabsTrigger value="green-energy">Green Energy</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Invested
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">${totalInvested.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {stats.realEstate.count + stats.greenEnergy.count + stats.markets.count} investments
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Returns
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className={`text-2xl font-bold ${isPositiveReturn ? 'text-green-600' : 'text-red-600'}`}>
                    ${totalReturn.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {isPositiveReturn ? (
                      <ArrowUp className="mr-1 h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDown className="mr-1 h-3 w-3 text-red-600" />
                    )}
                    {returnPercentage}% overall return
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Portfolio Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center">
                        <Home className="mr-1 h-3 w-3" /> Real Estate
                      </span>
                      <span className="text-xs font-medium">
                        {totalInvested > 0 
                          ? ((stats.realEstate.totalInvested / totalInvested) * 100).toFixed(1) 
                          : "0"}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center">
                        <Leaf className="mr-1 h-3 w-3" /> Green Energy
                      </span>
                      <span className="text-xs font-medium">
                        {totalInvested > 0 
                          ? ((stats.greenEnergy.totalInvested / totalInvested) * 100).toFixed(1) 
                          : "0"}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3" /> Markets
                      </span>
                      <span className="text-xs font-medium">
                        {totalInvested > 0 
                          ? ((stats.markets.totalInvested / totalInvested) * 100).toFixed(1) 
                          : "0"}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium">Investment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {hasChartData ? (
                    <ChartContainer
                      config={stats.chartConfig}
                      className="aspect-auto h-[300px] w-full"
                    >
                      <BarChart data={stats.chartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent
                              indicator="dot"
                            />
                          }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="realEstate" name="Real Estate" fill="var(--color-realEstate)" />
                        <Bar dataKey="greenEnergy" name="Green Energy" fill="var(--color-greenEnergy)" />
                        <Bar dataKey="markets" name="Markets" fill="var(--color-markets)" />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Info className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <h3 className="text-lg font-medium mb-2">No Investment Data</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-md">
                        {hasInvestments 
                          ? "This user has investments, but no monthly trend data is available yet."
                          : "This user hasn't made any investments yet."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              {!hasInvestments && (
                <CardFooter className="bg-muted/20 py-2 px-6">
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Info className="mr-2 h-3 w-3" />
                    Real investment data will appear here once the user makes investments.
                  </p>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="real-estate" className="space-y-4">
            {/* Real Estate specific content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Home className="mr-2 h-5 w-5" /> Real Estate Investments
                </CardTitle>
                <CardDescription>Details of user's real estate investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Invested</div>
                    <div className="text-xl font-bold">${stats.realEstate.totalInvested.toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Return</div>
                    <div className="text-xl font-bold">${stats.realEstate.return.toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Investments</div>
                    <div className="text-xl font-bold">{stats.realEstate.count}</div>
                  </div>
                </div>
                
                {stats.realEstate.count === 0 && (
                  <div className="mt-6 py-6 text-center">
                    <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No real estate investments found for this user.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="green-energy" className="space-y-4">
            {/* Green Energy specific content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Leaf className="mr-2 h-5 w-5" /> Green Energy Investments
                </CardTitle>
                <CardDescription>Details of user's green energy investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Invested</div>
                    <div className="text-xl font-bold">${stats.greenEnergy.totalInvested.toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Return</div>
                    <div className="text-xl font-bold">${stats.greenEnergy.return.toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Investments</div>
                    <div className="text-xl font-bold">{stats.greenEnergy.count}</div>
                  </div>
                </div>
                
                {stats.greenEnergy.count === 0 && (
                  <div className="mt-6 py-6 text-center">
                    <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No green energy investments found for this user.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="markets" className="space-y-4">
            {/* Markets specific content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="mr-2 h-5 w-5" /> Market Investments
                </CardTitle>
                <CardDescription>Details of user's market investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Invested</div>
                    <div className="text-xl font-bold">${stats.markets.totalInvested.toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Return</div>
                    <div className="text-xl font-bold">${stats.markets.return.toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Investments</div>
                    <div className="text-xl font-bold">{stats.markets.count}</div>
                  </div>
                </div>
                
                {stats.markets.count === 0 && (
                  <div className="mt-6 py-6 text-center">
                    <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No market investments found for this user.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 