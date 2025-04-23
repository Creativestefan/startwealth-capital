export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    // Check admin authorization
    const session = await getServerSession(authConfig)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }
    
    // Await the params object if it's a promise
    const paramsData = await params
    const userId = paramsData.userId
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Fetch real estate investments
    const realEstateInvestments = await prisma.realEstateInvestment.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        amount: true,
        expectedReturn: true,
        actualReturn: true,
        createdAt: true,
        status: true
      }
    })
    
    // Fetch green energy investments
    const greenEnergyInvestments = await prisma.greenEnergyInvestment.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        amount: true,
        expectedReturn: true,
        actualReturn: true,
        createdAt: true,
        status: true
      }
    })
    
    // Fetch market investments
    const marketInvestments = await prisma.marketInvestment.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        amount: true,
        expectedReturn: true,
        actualReturn: true,
        createdAt: true,
        status: true
      }
    })
    
    // Calculate totals for real estate
    const realEstateTotals = {
      totalInvested: realEstateInvestments.reduce((sum, inv) => 
        sum + Number(inv.amount), 0),
      count: realEstateInvestments.length,
      return: realEstateInvestments.reduce((sum, inv) => 
        sum + Number(inv.actualReturn || 0), 0)
    }
    
    // Calculate totals for green energy
    const greenEnergyTotals = {
      totalInvested: greenEnergyInvestments.reduce((sum, inv) => 
        sum + Number(inv.amount), 0),
      count: greenEnergyInvestments.length,
      return: greenEnergyInvestments.reduce((sum, inv) => 
        sum + Number(inv.actualReturn || 0), 0)
    }
    
    // Calculate totals for markets
    const marketsTotals = {
      totalInvested: marketInvestments.reduce((sum, inv) => 
        sum + Number(inv.amount), 0),
      count: marketInvestments.length,
      return: marketInvestments.reduce((sum, inv) => 
        sum + Number(inv.actualReturn || 0), 0)
    }
    
    // Generate real chart data from the user's investments by month
    // Get the last 6 months
    const months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i)
      return {
        month: format(date, "MMM"),
        date: date,
        startOfMonth: startOfMonth(date),
        endOfMonth: endOfMonth(date)
      }
    }).reverse() // To have months in ascending order
    
    // Calculate investment amounts for each month
    const chartData = months.map(monthData => {
      // Get real estate investments for this month
      const realEstateForMonth = realEstateInvestments.filter(inv => 
        inv.createdAt >= monthData.startOfMonth && 
        inv.createdAt <= monthData.endOfMonth
      )
      
      // Get green energy investments for this month
      const greenEnergyForMonth = greenEnergyInvestments.filter(inv => 
        inv.createdAt >= monthData.startOfMonth && 
        inv.createdAt <= monthData.endOfMonth
      )
      
      // Get market investments for this month
      const marketsForMonth = marketInvestments.filter(inv => 
        inv.createdAt >= monthData.startOfMonth && 
        inv.createdAt <= monthData.endOfMonth
      )
      
      // Calculate total investments for each type for this month
      const realEstateAmount = realEstateForMonth.reduce((sum, inv) => 
        sum + Number(inv.amount), 0)
      
      const greenEnergyAmount = greenEnergyForMonth.reduce((sum, inv) => 
        sum + Number(inv.amount), 0)
      
      const marketsAmount = marketsForMonth.reduce((sum, inv) => 
        sum + Number(inv.amount), 0)
      
      return {
        month: monthData.month,
        realEstate: realEstateAmount,
        greenEnergy: greenEnergyAmount,
        markets: marketsAmount
      }
    })
    
    // Chart config colors
    const chartConfig = {
      realEstate: {
        label: "Real Estate",
        color: "#3b82f6" // blue
      },
      greenEnergy: {
        label: "Green Energy",
        color: "#10b981" // green
      },
      markets: {
        label: "Markets",
        color: "#8b5cf6" // purple
      }
    }
    
    return NextResponse.json({
      realEstate: realEstateTotals,
      greenEnergy: greenEnergyTotals,
      markets: marketsTotals,
      chartData,
      chartConfig
    })
  } catch (error) {
    console.error("[ADMIN_USER_INVESTMENTS_API_ERROR]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 