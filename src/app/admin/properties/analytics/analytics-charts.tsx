'use client'

import { Activity, TrendingUp } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsChartsProps {
  monthlyData: any[]
  roiTrends: any[]
}

const monthlyChartConfig = {
  investments: {
    label: "Investments",
    color: "hsl(var(--chart-1))",
  },
  propertySales: {
    label: "Property Sales",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const roiChartConfig = {
  roi: {
    label: "ROI",
    color: "hsl(var(--chart-1))",
    icon: Activity,
  },
} satisfies ChartConfig

export function AnalyticsCharts({ monthlyData, roiTrends }: AnalyticsChartsProps) {
  // Calculate trend percentage for monthly performance
  const lastTwoMonths = monthlyData.slice(-2)
  const monthlyTrendPercentage = lastTwoMonths.length === 2
    ? ((lastTwoMonths[1].propertySales - lastTwoMonths[0].propertySales) / lastTwoMonths[0].propertySales * 100).toFixed(1)
    : 0

  // Calculate trend percentage for ROI
  const lastTwoROI = roiTrends.slice(-2)
  const roiTrendPercentage = lastTwoROI.length === 2
    ? ((lastTwoROI[1].roi - lastTwoROI[0].roi) / lastTwoROI[0].roi * 100).toFixed(1)
    : 0

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Monthly Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Property Sales</CardTitle>
          <CardDescription>January - December {new Date().getFullYear()}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={monthlyChartConfig}>
            <BarChart accessibilityLayer data={monthlyData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="investments" fill="var(--color-investments)" radius={4} />
              <Bar dataKey="propertySales" fill="var(--color-propertySales)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Trending {Number(monthlyTrendPercentage) >= 0 ? "up" : "down"} by {Math.abs(Number(monthlyTrendPercentage))}% this month 
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total sales and investments for the last 12 months
          </div>
        </CardFooter>
      </Card>
      
      {/* ROI Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Investment ROI Trends</CardTitle>
          <CardDescription>Return on investment over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={roiChartConfig}>
            <AreaChart
              accessibilityLayer
              data={roiTrends}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Area
                dataKey="roi"
                type="step"
                fill="var(--color-roi)"
                fillOpacity={0.4}
                stroke="var(--color-roi)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                Trending {Number(roiTrendPercentage) >= 0 ? "up" : "down"} by {Math.abs(Number(roiTrendPercentage))}% this month 
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                January - December {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 