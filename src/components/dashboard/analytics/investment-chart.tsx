"use client"

import { TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ChartData {
  name: string
  value: number
}

interface InvestmentChartProps {
  title: string
  description?: string
  data: ChartData[]
  className?: string
}

export function InvestmentChart({ title, description, data, className }: InvestmentChartProps) {
  // Transform data to match the example format
  const chartData = data.map((item) => ({
    month: item.name,
    desktop: item.value, // Map 'value' to 'desktop' to match example
  }))

  const chartConfig = {
    desktop: {
      label: "Value",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
            height={180}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              fontSize={11}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex w-full items-start gap-2 text-xs">
          <div className="grid gap-1">
            <div className="flex items-center gap-1 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-3 w-3" />
            </div>
            <div className="flex items-center gap-1 leading-none text-muted-foreground">
              {data[0]?.name} - {data[data.length - 1]?.name} 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}