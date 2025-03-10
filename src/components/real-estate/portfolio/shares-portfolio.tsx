"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import type { RealEstateInvestment } from "@/lib/real-estate/types"
import { InvestmentTable } from "@/components/real-estate/investments/investment-table"

interface SharesPortfolioProps {
  investments: RealEstateInvestment[]
}

/**
 * Displays the user's shares/investments portfolio with a table of investments
 * and a button to add more investments
 */
export function SharesPortfolio({ investments }: SharesPortfolioProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Shares</CardTitle>
          <CardDescription>Your real estate investment shares</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => router.push("/real-estate/shares")}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Browse Investments
        </Button>
      </CardHeader>
      <CardContent>
        {investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-muted-foreground">You haven't invested in any shares yet.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/real-estate/shares")}>
              Browse Available Investments
            </Button>
          </div>
        ) : (
          <InvestmentTable investments={investments} />
        )}
      </CardContent>
    </Card>
  )
}

