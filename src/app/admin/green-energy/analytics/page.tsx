import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllEquipmentTransactions } from "@/lib/green-energy/actions/equipment"
import { getAllGreenEnergyInvestments, getAllGreenEnergyPlans } from "@/lib/green-energy/actions/investments"
import { formatCurrency } from "@/lib/green-energy/utils/formatting"
import { AnalyticsCharts } from "./analytics-charts"

export const metadata: Metadata = {
  title: "Green Energy Analytics",
  description: "Track and analyze green energy performance metrics",
}

export default async function AnalyticsPage() {
  // Fetch equipment transactions
  const equipmentResult = await getAllEquipmentTransactions()
  const equipmentTransactions = equipmentResult.success && equipmentResult.data ? equipmentResult.data : []
  
  // Fetch investment transactions
  const investmentResult = await getAllGreenEnergyInvestments()
  const investments = investmentResult.success && investmentResult.data ? investmentResult.data : []
  
  // Fetch plans
  const plansResult = await getAllGreenEnergyPlans()
  const plans = plansResult.success && plansResult.data ? plansResult.data : []
  
  // Calculate metrics
  const totalEquipmentSales = equipmentTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0)
  const totalInvestments = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const activeInvestments = investments.filter(inv => inv.status === "ACTIVE").length
  const totalExpectedReturns = investments.reduce((sum, inv) => sum + inv.expectedReturn, 0)
  const totalEquipmentCount = equipmentTransactions.reduce((sum, tx) => sum + tx.quantity, 0)
  
  // Calculate monthly trends
  const monthlyData = calculateMonthlyData(investments, equipmentTransactions)
  
  // Calculate ROI trends
  const roiTrends = calculateROITrends(investments)
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Green Energy Analytics</h2>
        <p className="text-muted-foreground">
          Track and analyze green energy performance metrics
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Equipment Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEquipmentSales)}</div>
            <p className="text-xs text-muted-foreground">
              {equipmentTransactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Equipment Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipmentCount}</div>
            <p className="text-xs text-muted-foreground">
              Total units sold
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
function calculateMonthlyData(investments: any[], equipmentTransactions: any[]) {
  const monthlyData: any[] = []
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  
  // Get current year
  const currentYear = new Date().getFullYear()
  
  // Initialize monthly totals
  months.forEach((month, index) => {
    monthlyData.push({
      month,
      investments: 0,
      equipmentSales: 0
    })
    
    // Sum investments for this month
    investments.forEach(inv => {
      const invDate = new Date(inv.createdAt)
      if (invDate.getFullYear() === currentYear && invDate.getMonth() === index) {
        monthlyData[index].investments += Number(inv.amount)
      }
    })
    
    // Sum equipment sales for this month
    equipmentTransactions.forEach(tx => {
      const txDate = new Date(tx.createdAt)
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === index) {
        monthlyData[index].equipmentSales += Number(tx.totalAmount)
      }
    })
  })
  
  return monthlyData
}

// Helper function to calculate ROI trends
function calculateROITrends(investments: any[]) {
  const monthlyROI: any[] = []
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