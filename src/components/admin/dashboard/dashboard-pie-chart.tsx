"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

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

interface InvestmentData {
  name: string
  value: number
  color: string
}

interface DashboardPieChartProps {
  title: string
  subtitle?: string
  data: InvestmentData[]
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
  }
  footerText?: string
}

export function DashboardPieChart({
  title,
  subtitle,
  data,
  trend,
  footerText,
}: DashboardPieChartProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0)
  }, [data])

  // Create a dynamic chart config from data
  const chartConfig = React.useMemo(() => {
    const config: Record<string, any> = {
      value: {
        label: "Value",
      },
    }

    data.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: item.color || `hsl(var(--chart-${index + 1}))`,
      }
    })

    return config as ChartConfig
  }, [data])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              fill=""
              stroke=""
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.color} 
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          Investments
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      {(trend || footerText) && (
        <CardFooter className="flex-col gap-2 text-sm pt-4">
          {trend && (
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend.direction === "up" && (
                <>
                  Trending up by {trend.value.toFixed(1)}% this month{" "}
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </>
              )}
              {trend.direction === "down" && (
                <>
                  Trending down by {Math.abs(trend.value).toFixed(1)}% this month{" "}
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