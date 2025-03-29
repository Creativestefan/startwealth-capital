export const dynamic = 'force-dynamic';
import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/real-estate/utils/formatting"
import { AnalyticsCharts } from "./analytics-charts"

export const metadata: Metadata = {
  title: "Properties Analytics",
  description: "Track and analyze real estate performance metrics",
}

export default async function AnalyticsPage() {
  // Fetch property transactions
  const propertyTransactions = await prisma.propertyTransaction.findMany({
    include: {
      property: true,
    },
  })
  
  // Fetch real estate investments
  const investments = await prisma.realEstateInvestment.findMany()
  
  // Calculate metrics
  const totalPropertySales = propertyTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0)
  const totalInvestments = investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
  const activeInvestments = investments.filter(inv => inv.status === "ACTIVE").length
  const totalExpectedReturns = investments.reduce((sum, inv) => sum + Number(inv.expectedReturn), 0)
  const totalProperties = await prisma.property.count()
  const soldProperties = propertyTransactions.filter(tx => tx.status === "COMPLETED").length
  
  // Calculate monthly trends
  const monthlyData = calculateMonthlyData(investments, propertyTransactions)
  
  // Calculate ROI trends
  const roiTrends = calculateROITrends(investments)
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Properties Analytics</h2>
        <p className="text-muted-foreground">
          Track and analyze real estate performance metrics
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Property Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPropertySales)}</div>
            <p className="text-xs text-muted-foreground">
              {propertyTransactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Properties Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldProperties}</div>
            <p className="text-xs text-muted-foreground">
              Out of {totalProperties} total properties
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestments)}</div>
            <p className="text-xs text-muted-foreground">
              {investments.length} investments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvestments}</div>
            <p className="text-xs text-muted-foreground">
              {((activeInvestments / investments.length) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expected Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpectedReturns)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalExpectedReturns / totalInvestments) * 100).toFixed(1)}% return rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Property Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties - soldProperties}</div>
            <p className="text-xs text-muted-foreground">
              Available properties
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <AnalyticsCharts 
        monthlyData={monthlyData}
        roiTrends={roiTrends}
      />
    </div>
  )
}

// Helper function to calculate monthly data
function calculateMonthlyData(investments: unknown[], propertyTransactions: unknown[]) {
  const monthlyData: unknown[] = []
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  
  // Get current year
  const currentYear = new Date().getFullYear()
  
  // Initialize monthly totals
  months.forEach((month, index) => {
    monthlyData.push({
      month,
      investments: 0,
      propertySales: 0
    })
    
    // Sum investments for this month
    investments.forEach(inv => {
      const invDate = new Date(inv.createdAt)
      if (invDate.getFullYear() === currentYear && invDate.getMonth() === index) {
        monthlyData[index].investments += Number(inv.amount)
      }
    })
    
    // Sum property sales for this month
    propertyTransactions.forEach(tx => {
      const txDate = new Date(tx.createdAt)
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === index) {
        monthlyData[index].propertySales += Number(tx.amount)
      }
    })
  })
  
  return monthlyData
}

// Helper function to calculate ROI trends
function calculateROITrends(investments: unknown[]) {
  const monthlyROI: unknown[] = []
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  
  months.forEach((month, index) => {
    const monthInvestments = investments.filter(inv => {
      const invDate = new Date(inv.createdAt)
      return invDate.getMonth() === index
    })
    
    const totalInvested = monthInvestments.reduce((sum, inv) => sum + Number(inv.amount), 0)
    const totalReturns = monthInvestments.reduce((sum, inv) => sum + Number(inv.expectedReturn), 0)
    const roi = totalInvested > 0 ? ((totalReturns - totalInvested) / totalInvested) * 100 : 0
    
    monthlyROI.push({
      month,
      roi: parseFloat(roi.toFixed(2))
    })
  })
  
  return monthlyROI
} 