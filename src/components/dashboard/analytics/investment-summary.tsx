"use client"

import { Building2, Leaf, LineChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InvestmentSummaryProps {
  realEstate: {
    totalValue: number
    count: number
    growth: number
  }
  greenEnergy: {
    totalValue: number
    count: number
    growth: number
  }
  markets: {
    totalValue: number
    count: number
    growth: number
  }
}

export function InvestmentSummary({ realEstate, greenEnergy, markets }: InvestmentSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="overflow-hidden border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium">Real Estate</CardTitle>
          <Building2 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="text-xl font-bold">${realEstate.totalValue.toLocaleString()}</div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>{realEstate.count} Properties</span>
            <span className={realEstate.growth >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
              {realEstate.growth >= 0 ? "+" : ""}
              {realEstate.growth}%
            </span>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium">Green Energy</CardTitle>
          <Leaf className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="text-xl font-bold">${greenEnergy.totalValue.toLocaleString()}</div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>{greenEnergy.count} Projects</span>
            <span className={greenEnergy.growth >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
              {greenEnergy.growth >= 0 ? "+" : ""}
              {greenEnergy.growth}%
            </span>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium">Markets</CardTitle>
          <LineChart className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="text-xl font-bold">${markets.totalValue.toLocaleString()}</div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>{markets.count} Positions</span>
            <span className={markets.growth >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
              {markets.growth >= 0 ? "+" : ""}
              {markets.growth}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

