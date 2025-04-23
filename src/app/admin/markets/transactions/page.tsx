export const dynamic = 'force-dynamic';
import { Metadata } from "next"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllMarketInvestments } from "@/lib/market/actions/investments"
import { InvestmentTransactionTable } from "@/components/admin/markets/investment-transaction-table"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { InvestmentStatus } from "@prisma/client"
import type { SerializedMarketInvestment } from "@/lib/market/types"

export const metadata: Metadata = {
  title: "Market Transactions",
  description: "Manage market investments and transactions",
}

function TransactionsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded bg-muted"></div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-24 animate-pulse rounded-lg bg-muted"></div>
        <div className="h-24 animate-pulse rounded-lg bg-muted"></div>
        <div className="h-24 animate-pulse rounded-lg bg-muted"></div>
      </div>
      <div className="h-96 animate-pulse rounded-lg bg-muted"></div>
    </div>
  )
}

export default async function AdminMarketTransactionsPage() {
  // Fetch investment transactions
  const investmentResult = await getAllMarketInvestments()
  const investments: SerializedMarketInvestment[] = investmentResult.success && investmentResult.data ? investmentResult.data : []
  
  // Calculate statistics for investments
  const activeInvestments = investments.filter((inv) => inv.status === InvestmentStatus.ACTIVE)
  const maturedInvestments = investments.filter((inv) => inv.status === InvestmentStatus.MATURED)
  const totalInvestmentAmount = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalExpectedReturn = investments.reduce((sum, inv) => sum + inv.expectedReturn, 0)
  const totalActualReturn = investments.reduce((sum, inv) => sum + (inv.actualReturn || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Market Transactions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all market investment transactions
        </p>
      </div>
      
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeInvestments.length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investment Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestmentAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Expected return: {formatCurrency(totalExpectedReturn)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matured Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maturedInvestments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total return: {formatCurrency(totalActualReturn)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpectedReturn - totalActualReturn)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {activeInvestments.length} investments
            </p>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<TransactionsLoading />}>
        <InvestmentTransactionTable investments={investments} />
      </Suspense>
    </div>
  )
} 