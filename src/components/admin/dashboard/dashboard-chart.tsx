"use client"

import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Line, 
  LineChart, 
  Rectangle, 
  ResponsiveContainer, 
  Tooltip, 
  TooltipProps, 
  XAxis, 
  YAxis 
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface DashboardChartProps {
  data: unknown[]
  type: "bar" | "line"
  xAxisKey: string
  yAxisKey: string
  height?: number
  formatter?: (value: number) => string
  activeIndex?: number
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
    message?: string
  }
  footerText?: string
}

export function DashboardChart({
  data,
  type,
  xAxisKey,
  yAxisKey,
  height = 300,
  formatter = (value: number) => value.toString(),
  activeIndex,
  trend,
  footerText
}: DashboardChartProps) {
  // Create a dynamic chart config from data
  const chartConfig = React.useMemo(() => {
    const config: Record<string, any> = {
      [yAxisKey]: {
        label: "Value",
      },
    }

    data.forEach((item) => {
      config[item[xAxisKey]] = {
        label: item[xAxisKey],
        color: item.color || `hsl(var(--chart-${data.indexOf(item) + 1}))`,
      }
    })

    return config as ChartConfig
  }, [data, xAxisKey, yAxisKey])

  return (
    <Card className="flex flex-col">
      <CardContent className="flex-1 pt-6">
        <ChartContainer config={chartConfig} className="h-[300px]">
          {type === "bar" ? (
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel formatter={formatter} />}
              />
              <Bar
                dataKey={yAxisKey}
                strokeWidth={2}
                radius={8}
                activeIndex={activeIndex !== undefined ? activeIndex : -1}
                fill="hsl(var(--primary))"
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
          ) : (
            <LineChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey={xAxisKey} 
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel formatter={formatter} />}
              />
              <Line 
                type="monotone" 
                dataKey={yAxisKey} 
                strokeWidth={2}
                stroke="hsl(var(--primary))"
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
      {(trend || footerText) && (
        <CardFooter className="flex-col items-start gap-2 text-sm pt-2">
          {trend && (
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend.direction === "up" && (
                <>
                  {trend.message || `Trending up by ${trend.value.toFixed(1)}% this month`}{" "}
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </>
              )}
              {trend.direction === "down" && (
                <>
                  {trend.message || `Trending down by ${Math.abs(trend.value).toFixed(1)}% this month`}{" "}
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </>
              )}
            </div>
          )}
          {footerText && (
            <div className="leading-none text-muted-foreground">
              {footerText}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
} 