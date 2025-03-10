"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioSummary } from "./portfolio-summary"
import { PropertyPortfolio } from "./property-portfolio"
import { SharesPortfolio } from "./shares-portfolio"
import type { PropertyTransaction, RealEstateInvestment } from "@/lib/real-estate/types"

interface PortfolioDashboardProps {
  properties: PropertyTransaction[]
  investments: RealEstateInvestment[]
  totalValue: number
  totalReturn: number
}

/**
 * Main dashboard component for the real estate portfolio page
 * Displays tabs for Properties and Shares portfolios
 */
export function PortfolioDashboard({ properties, investments, totalValue, totalReturn }: PortfolioDashboardProps) {
  return (
    <div className="space-y-6">
      <PortfolioSummary
        totalValue={totalValue}
        totalReturn={totalReturn}
        propertyCount={properties.length}
        investmentCount={investments.length}
      />

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="shares">Shares</TabsTrigger>
        </TabsList>
        <TabsContent value="properties" className="mt-6">
          <PropertyPortfolio transactions={properties} />
        </TabsContent>
        <TabsContent value="shares" className="mt-6">
          <SharesPortfolio investments={investments} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

