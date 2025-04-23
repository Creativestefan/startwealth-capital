export const dynamic = 'force-dynamic';
import { Metadata } from "next"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllEquipmentTransactions } from "@/lib/green-energy/actions/equipment"
import { getAllGreenEnergyInvestments } from "@/lib/green-energy/actions/investments"
import { EquipmentTransactionTable } from "@/components/admin/green-energy/equipment-transaction-table"
import { InvestmentTransactionTable } from "@/components/admin/green-energy/investment-transaction-table"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { TransactionStatus, InvestmentStatus } from "@prisma/client"

export const metadata: Metadata = {
  title: "Green Energy Transactions",
  description: "Manage green energy equipment sales and investments",
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

export default async function AdminGreenEnergyTransactionsPage() {
  // Fetch equipment transactions
  const equipmentResult = await getAllEquipmentTransactions()
  const equipmentTransactions = equipmentResult.success && equipmentResult.data ? equipmentResult.data : []
  
  // Fetch investment transactions
  const investmentResult = await getAllGreenEnergyInvestments()
  const investments = investmentResult.success && investmentResult.data ? investmentResult.data : []
  
  // Calculate statistics for equipment transactions
  const pendingEquipmentTransactions = equipmentTransactions.filter((tx) => tx.status === TransactionStatus.PENDING)
  const totalEquipmentAmount = equipmentTransactions.reduce((sum, tx) => sum + Number(tx.totalAmount), 0)
  
  // Calculate statistics for investments
  const activeInvestments = investments.filter((inv) => inv.status === InvestmentStatus.ACTIVE)
  const totalInvestmentAmount = investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
  const totalExpectedReturn = investments.reduce((sum, inv) => sum + Number(inv.expectedReturn || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Green Energy Transactions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all equipment sales and investment transactions
        </p>
      </div>
      
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipmentTransactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingEquipmentTransactions.length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEquipmentAmount)}</div>
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

      <Tabs defaultValue="equipment" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
        </TabsList>
        <TabsContent value="equipment" className="mt-6">
          <Suspense fallback={<TransactionsLoading />}>
            <EquipmentTransactionTable transactions={equipmentTransactions} />
          </Suspense>
        </TabsContent>
        <TabsContent value="investments" className="mt-6">
          <Suspense fallback={<TransactionsLoading />}>
            <InvestmentTransactionTable investments={investments} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
} 