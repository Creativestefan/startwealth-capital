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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Real Estate</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${realEstate.totalValue.toLocaleString()}</div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{realEstate.count} Properties</span>
            <span className={realEstate.growth >= 0 ? "text-green-500" : "text-red-500"}>
              {realEstate.growth >= 0 ? "+" : ""}
              {realEstate.growth}%
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Green Energy</CardTitle>
          <Leaf className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${greenEnergy.totalValue.toLocaleString()}</div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{greenEnergy.count} Projects</span>
            <span className={greenEnergy.growth >= 0 ? "text-green-500" : "text-red-500"}>
              {greenEnergy.growth >= 0 ? "+" : ""}
              {greenEnergy.growth}%
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Markets</CardTitle>
          <LineChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${markets.totalValue.toLocaleString()}</div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{markets.count} Positions</span>
            <span className={markets.growth >= 0 ? "text-green-500" : "text-red-500"}>
              {markets.growth >= 0 ? "+" : ""}
              {markets.growth}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

