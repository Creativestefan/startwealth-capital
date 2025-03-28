import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { EquipmentType } from "@prisma/client"

interface PropertyData {
  id: string
  price: number | string
  status: string
}

interface EquipmentData {
  id: string
  price: number | string
  status: string
}

interface ActivityData {
  id: string
  type: string
  description: string
  timestamp: Date
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

/**
 * GET - Fetch comprehensive admin dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    })
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get time range from query params (default to 30 days)
    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get("timeRange") || "30days"
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case "7days":
        startDate.setDate(now.getDate() - 7)
        break
      case "90days":
        startDate.setDate(now.getDate() - 90)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default: // 30days
        startDate.setDate(now.getDate() - 30)
    }

    // Fetch user statistics
    const [totalUsers, newUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
    ])

    // Get KYC statistics
    const [kycPending, kycApproved, kycRejected] = await Promise.all([
      prisma.kYC.count({
        where: { status: "PENDING" },
      }),
      prisma.kYC.count({
        where: { status: "APPROVED" },
      }),
      prisma.kYC.count({
        where: { status: "REJECTED" },
      }),
    ]);

    // Fetch property data
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        price: true,
        status: true,
      },
    });
    
    const propertiesTotal = properties.length;
    const propertiesAvailable = properties.filter(p => p.status === "AVAILABLE").length;
    const propertiesSold = properties.filter(p => p.status === "SOLD").length;
    const propertiesPending = properties.filter(p => p.status === "PENDING").length;
    const propertiesTotalValue = properties.reduce((sum, p) => {
      return sum + Number(p.price);
    }, 0);

    // Fetch investment data
    const [realEstateInvestments, greenEnergyInvestments, marketInvestments] = await Promise.all([
      prisma.realEstateInvestment.count(),
      prisma.greenEnergyInvestment.count(),
      prisma.marketInvestment.count(),
    ]);

    const totalInvestments = realEstateInvestments + greenEnergyInvestments + marketInvestments;

    // Fetch equipment data (for green energy)
    // Since there's no GREEN_ENERGY type, using SOLAR_PANEL as an example
    const solarEquipment = await prisma.equipment.findMany({
      where: {
        type: EquipmentType.SOLAR_PANEL,
      },
      select: {
        id: true,
        price: true,
        status: true,
      },
    });
    
    // Combine multiple green energy equipment types
    const windEquipment = await prisma.equipment.findMany({
      where: {
        type: EquipmentType.WIND_TURBINE,
      },
      select: {
        id: true,
        price: true,
        status: true,
      },
    });
    
    const batteryEquipment = await prisma.equipment.findMany({
      where: {
        type: EquipmentType.BATTERY_STORAGE,
      },
      select: {
        id: true,
        price: true,
        status: true,
      },
    });
    
    const inverterEquipment = await prisma.equipment.findMany({
      where: {
        type: EquipmentType.INVERTER,
      },
      select: {
        id: true,
        price: true,
        status: true,
      },
    });
    
    // Combine all green energy equipment
    const allGreenEnergyEquipment = [
      ...solarEquipment,
      ...windEquipment,
      ...batteryEquipment,
      ...inverterEquipment
    ];
    
    const greenEnergyTotalEquipment = allGreenEnergyEquipment.length;
    const greenEnergySoldEquipment = allGreenEnergyEquipment.filter(e => e.status === "SOLD").length;
    const greenEnergyTotalValue = allGreenEnergyEquipment.reduce((sum, e) => {
      return sum + Number(e.price);
    }, 0);

    // Fetch market plans
    const marketPlans = await prisma.marketInvestmentPlan.count();
    
    // Calculate market investments value
    const marketInvestmentsData = await prisma.marketInvestment.findMany({
      select: {
        amount: true,
      },
    });
    
    const marketsTotalValue = marketInvestmentsData.reduce((sum, m) => {
      return sum + Number(m.amount);
    }, 0);

    // Calculate total investment value
    const totalInvestmentValue = await calculateTotalInvestmentValue();
    
    // Calculate revenue data
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch wallet transactions for revenue calculation
    const allTransactions = await prisma.walletTransaction.findMany({
      where: {
        type: "DEPOSIT",
        status: "COMPLETED",
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });
    
    // Calculate revenue metrics
    const totalRevenue = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    const thisMonthRevenue = allTransactions
      .filter(t => t.createdAt >= thisMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    const lastMonthRevenue = allTransactions
      .filter(t => t.createdAt >= lastMonth && t.createdAt < thisMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate revenue growth
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Fetch recent activities with proper field names
    const activities = await prisma.userActivity.findMany({
      take: 10,
      orderBy: {
        timestamp: "desc", // Match schema field name
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Fetch recent transactions
    const recentTransactions = await prisma.walletTransaction.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Helper function to calculate total investment value
    async function calculateTotalInvestmentValue() {
      // Implement this based on your schema
      // This is a simplified implementation
      const [realEstateValue, greenEnergyValue, marketValue] = await Promise.all([
        prisma.realEstateInvestment.aggregate({
          _sum: {
            amount: true,
          },
        }),
        prisma.greenEnergyInvestment.aggregate({
          _sum: {
            amount: true,
          },
        }),
        prisma.marketInvestment.aggregate({
          _sum: {
            amount: true,
          },
        }),
      ]);
      
      return (
        Number(realEstateValue._sum.amount || 0) +
        Number(greenEnergyValue._sum.amount || 0) +
        Number(marketValue._sum.amount || 0)
      );
    }

    // Build the response object with activities and their user data
    const dashboardData = {
      users: {
        total: totalUsers,
        new: newUsers,
        kycPending,
        kycApproved,
        kycRejected,
      },
      properties: {
        total: propertiesTotal,
        available: propertiesAvailable,
        sold: propertiesSold,
        pending: propertiesPending,
        totalValue: propertiesTotalValue,
      },
      greenEnergy: {
        totalEquipment: greenEnergyTotalEquipment,
        soldEquipment: greenEnergySoldEquipment,
        investments: greenEnergyInvestments,
        activeInvestments: greenEnergyInvestments, // For simplicity
        totalValue: greenEnergyTotalValue,
      },
      markets: {
        totalPlans: marketPlans,
        investments: marketInvestments,
        activeInvestments: marketInvestments, // For simplicity
        totalValue: marketsTotalValue,
      },
      investments: {
        total: totalInvestments,
        realEstate: realEstateInvestments,
        greenEnergy: greenEnergyInvestments,
        markets: marketInvestments,
        totalValue: totalInvestmentValue,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        previousMonth: lastMonthRevenue,
        growth: revenueGrowth,
      },
      // Map activities with proper field access
      activities: activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp,
        user: activity.user,
      })),
      recentTransactions,
    };
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
} 