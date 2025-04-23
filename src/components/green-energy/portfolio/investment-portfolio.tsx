"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InvestmentTable } from "./investment-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { InvestmentStatus } from "@prisma/client"

interface GreenEnergyPlan {
  id: string
  name: string
  description: string
}

interface GreenEnergyInvestment {
  id: string
  type: string
  amount: number
  status: InvestmentStatus
  startDate: string
  endDate?: string | null
  expectedReturn: number
  actualReturn?: number | null
  createdAt: string
  updatedAt: string
  plan?: GreenEnergyPlan | null
}

interface InvestmentPortfolioProps {
  investments: GreenEnergyInvestment[]
}

/**
 * Displays the user's green energy investment portfolio with a table of investments
 * and a button to browse more investment opportunities
 */
export function InvestmentPortfolio({ investments }: InvestmentPortfolioProps) {
  const router = useRouter()

  // Calculate total expected returns
  const totalExpectedReturn = investments.reduce((sum, inv) => sum + inv.expectedReturn, 0)
  const activeInvestments = investments.filter(inv => inv.status === InvestmentStatus.ACTIVE).length
  const maturedInvestments = investments.filter(inv => inv.status === InvestmentStatus.MATURED).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Green Energy Investments</CardTitle>
          <CardDescription>Track your investments in sustainable energy projects</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => router.push("/green-energy/shares")}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Invest More
        </Button>
      </CardHeader>
      <CardContent>
        {investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-muted-foreground">You haven't made any green energy investments yet.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/green-energy/shares")}>
              Browse Investment Opportunities
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <p className="text-2xl font-bold">{investments.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <p className="text-2xl font-bold text-emerald-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalExpectedReturn)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Active / Matured</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <p className="text-2xl font-bold">{activeInvestments} / {maturedInvestments}</p>
                </CardContent>
              </Card>
            </div>
            <InvestmentTable investments={investments} />
          </>
        )}
      </CardContent>
    </Card>
  )
} 