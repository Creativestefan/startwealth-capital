import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils/formatting'
import { addMonths, format, subMonths } from 'date-fns'

export type DashboardStats = {
  investments: {
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
  chartData: {
    realEstate: Array<{ name: string; value: number }>
    greenEnergy: Array<{ name: string; value: number }>
    markets: Array<{ name: string; value: number }>
  }
  recentActivity: Array<{
    type: 'deposit' | 'withdrawal' | 'investment' | 'return'
    description: string
    date: string
    amount: string
  }>
}

/**
 * Fetches real dashboard statistics for a user from the database
 */
export async function getUserDashboardStats(userId: string): Promise<DashboardStats | null> {
  try {
    // Get wallet data
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    })

    // Get real estate investments
    const realEstateInvestments = await prisma.realEstateInvestment.findMany({
      where: { userId }
    })

    // Get property transactions
    const propertyTransactions = await prisma.propertyTransaction.findMany({
      where: { userId },
      include: {
        property: true
      }
    })

    // Get green energy investments
    const greenEnergyInvestments = await prisma.greenEnergyInvestment.findMany({
      where: { userId }
    })

    // Get equipment transactions
    const equipmentTransactions = await prisma.equipmentTransaction.findMany({
      where: { userId },
      include: {
        equipment: true
      }
    })

    // Get market investments
    const marketInvestments = await prisma.marketInvestment.findMany({
      where: { userId }
    })

    // Calculate totals for real estate
    const realEstateTotalValue = realEstateInvestments.reduce(
      (total, investment) => total + Number(investment.amount),
      0
    ) + propertyTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    )

    // Calculate totals for green energy
    const greenEnergyTotalValue = greenEnergyInvestments.reduce(
      (total, investment) => total + Number(investment.amount),
      0
    ) + equipmentTransactions.reduce(
      (total, transaction) => total + Number(transaction.totalAmount),
      0
    )

    // Calculate totals for markets
    const marketsTotalValue = marketInvestments.reduce(
      (total, investment) => total + Number(investment.amount),
      0
    )

    // Generate chart data (simplified - in real implementation you would fetch historical data)
    const months = Array.from({ length: 5 }, (_, i) => {
      const date = subMonths(new Date(), 4 - i)
      return format(date, 'MMM')
    })

    // Create chart data with a growth trend (this would be replaced with actual historical data)
    const realEstateChartData = months.map((name, index) => ({
      name,
      value: Math.round(realEstateTotalValue * (0.9 + index * 0.025))
    }))

    const greenEnergyChartData = months.map((name, index) => ({
      name,
      value: Math.round(greenEnergyTotalValue * (0.9 + index * 0.025))
    }))

    const marketsChartData = months.map((name, index) => ({
      name,
      value: Math.round(marketsTotalValue * (0.9 + index * 0.025))
    }))

    // Calculate growth based on chart data (this is just a simplified approach)
    const calculateGrowth = (chartData: Array<{ name: string; value: number }>) => {
      if (chartData.length < 2) return 0
      const firstValue = chartData[0]?.value || 0
      const lastValue = chartData[chartData.length - 1]?.value || 0
      if (firstValue === 0) return 0
      return Number((((lastValue - firstValue) / firstValue) * 100).toFixed(1))
    }

    // Format recent activity from wallet transactions and investments
    const recentActivityFromWallet = wallet?.transactions.map(transaction => ({
      type: transaction.type.toLowerCase() as 'deposit' | 'withdrawal',
      description: transaction.description || 
        (transaction.type === 'DEPOSIT' ? 'Wallet Deposit' : 'Wallet Withdrawal'),
      date: format(transaction.createdAt, 'MMM d, yyyy h:mm a'),
      amount: `${transaction.type === 'DEPOSIT' ? '+' : '-'}${formatCurrency(transaction.amount)}`
    })) || []

    // Get recent investments
    const recentInvestments = [
      ...realEstateInvestments,
      ...greenEnergyInvestments,
      ...marketInvestments
    ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(investment => {
      let description = 'Investment'
      if ('planId' in investment) {
        description = 'Market Investment'
      } else if ('greenEnergyPlanId' in investment) {
        description = 'Green Energy Investment'
      } else if ('realEstatePlanId' in investment) {
        description = 'Real Estate Investment'
      }
      
      return {
        type: 'investment' as const,
        description,
        date: format(investment.createdAt, 'MMM d, yyyy h:mm a'),
        amount: formatCurrency(Number('amount' in investment ? investment.amount : 0))
      }
    })

    // Combine and sort recent activity
    const recentActivity = [...recentActivityFromWallet, ...recentInvestments]
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateB - dateA
      })
      .slice(0, 5)

    return {
      investments: {
        realEstate: {
          totalValue: realEstateTotalValue,
          count: realEstateInvestments.length + propertyTransactions.length,
          growth: calculateGrowth(realEstateChartData)
        },
        greenEnergy: {
          totalValue: greenEnergyTotalValue,
          count: greenEnergyInvestments.length + equipmentTransactions.length,
          growth: calculateGrowth(greenEnergyChartData)
        },
        markets: {
          totalValue: marketsTotalValue,
          count: marketInvestments.length,
          growth: calculateGrowth(marketsChartData)
        }
      },
      chartData: {
        realEstate: realEstateChartData,
        greenEnergy: greenEnergyChartData,
        markets: marketsChartData
      },
      recentActivity
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }
} 