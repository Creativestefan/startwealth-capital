export const dynamic = 'force-dynamic';
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPropertyTransactions } from "@/lib/real-estate/actions/properties"
import { getAllInvestments } from "@/lib/real-estate/actions/investments"
import { PropertyTransactionTable } from "@/components/admin/properties/property-transaction-table"
import { InvestmentTransactionTable } from "@/components/admin/properties/investment-transaction-table"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { serializeData } from "@/lib/real-estate/utils/formatting"
import type { PropertyTransaction, RealEstateInvestment } from "@/lib/real-estate/types"

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

export default async function AdminPropertyTransactionsPage() {
  // Fetch property transactions
  const { data: rawPropertyTransactions = [] } = await getPropertyTransactions()
  
  // Fetch investment transactions
  const { data: rawInvestments = [] } = await getAllInvestments()

  // Serialize the data to convert Decimal objects to numbers
  const propertyTransactions = serializeData(rawPropertyTransactions)
  const investments = serializeData(rawInvestments)

  // Calculate statistics for property transactions
  const pendingPropertyTransactions = propertyTransactions.filter((tx: PropertyTransaction) => tx.status === "PENDING")
  const totalPropertyAmount = propertyTransactions.reduce((sum: number, tx: PropertyTransaction) => sum + Number(tx.amount), 0)
  
  // Calculate statistics for investments
  const activeInvestments = investments.filter((inv: RealEstateInvestment) => inv.status === "ACTIVE")
  const totalInvestmentAmount = investments.reduce((sum: number, inv: RealEstateInvestment) => sum + Number(inv.amount), 0)
  const totalExpectedReturn = investments.reduce((sum: number, inv: RealEstateInvestment) => sum + Number(inv.expectedReturn || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Real Estate Transactions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all property and investment transactions
        </p>
      </div>
      
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Property Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyTransactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingPropertyTransactions.length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Property Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPropertyAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Share Investments</CardTitle>
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
      </div>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="shares">Shares</TabsTrigger>
        </TabsList>
        <TabsContent value="properties" className="mt-6">
          <Suspense fallback={<TransactionsLoading />}>
            <PropertyTransactionTable transactions={propertyTransactions} />
          </Suspense>
        </TabsContent>
        <TabsContent value="shares" className="mt-6">
          <Suspense fallback={<TransactionsLoading />}>
            <InvestmentTransactionTable investments={investments} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
} 