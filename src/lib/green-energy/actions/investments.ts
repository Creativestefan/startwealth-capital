"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GreenEnergyInvestment, GreenEnergyPlan, serializeGreenEnergyInvestment, serializeGreenEnergyPlan } from "../types";
import { GreenEnergyInvestmentType, InvestmentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { redirect } from "next/navigation";

// Get all green energy plans
export async function getAllGreenEnergyPlans(options?: { 
  take?: number; 
  skip?: number; 
  filter?: { type?: GreenEnergyInvestmentType } 
}) {
  try {
    const plans = await prisma.greenEnergyPlan.findMany({
      take: options?.take || undefined,
      skip: options?.skip || undefined,
      where: options?.filter ? {
        type: options.filter.type
      } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: plans.map((plan) => serializeGreenEnergyPlan(plan as unknown as GreenEnergyPlan)),
    };
  } catch (error) {
    console.error("Error fetching green energy plans:", error);
    return {
      success: false,
      error: "Failed to fetch green energy plans",
    };
  }
}

// Get green energy plan by ID
export async function getGreenEnergyPlanById(id: string) {
  try {
    const plan = await prisma.greenEnergyPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return {
        success: false,
        error: "Green energy plan not found",
      };
    }

    return {
      success: true,
      data: serializeGreenEnergyPlan(plan as unknown as GreenEnergyPlan),
    };
  } catch (error) {
    console.error("Error fetching green energy plan:", error);
    return {
      success: false,
      error: "Failed to fetch green energy plan",
    };
  }
}

// Create new green energy plan (admin only)
export async function createGreenEnergyPlan(data: {
  name: string;
  description: string;
  type: GreenEnergyInvestmentType;
  minAmount: number;
  maxAmount: number;
  returnRate: number;
  durationMonths: number;
  image?: string;
}) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const plan = await prisma.greenEnergyPlan.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        returnRate: data.returnRate,
        durationMonths: data.durationMonths,
        image: data.image,
      },
    });

    revalidatePath("/admin/green-energy/plans");
    
    return {
      success: true,
      data: serializeGreenEnergyPlan(plan as unknown as GreenEnergyPlan),
    };
  } catch (error) {
    console.error("Error creating green energy plan:", error);
    return {
      success: false,
      error: "Failed to create green energy plan",
    };
  }
}

// Update green energy plan (admin only)
export async function updateGreenEnergyPlan(id: string, data: {
  name?: string;
  description?: string;
  type?: GreenEnergyInvestmentType;
  minAmount?: number;
  maxAmount?: number;
  returnRate?: number;
  durationMonths?: number;
  image?: string;
}) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const plan = await prisma.greenEnergyPlan.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.type && { type: data.type }),
        ...(data.minAmount !== undefined && { minAmount: data.minAmount }),
        ...(data.maxAmount !== undefined && { maxAmount: data.maxAmount }),
        ...(data.returnRate !== undefined && { returnRate: data.returnRate }),
        ...(data.durationMonths !== undefined && { durationMonths: data.durationMonths }),
        ...(data.image && { image: data.image }),
      },
    });

    revalidatePath("/admin/green-energy/plans");
    
    return {
      success: true,
      data: serializeGreenEnergyPlan(plan as unknown as GreenEnergyPlan),
    };
  } catch (error) {
    console.error("Error updating green energy plan:", error);
    return {
      success: false,
      error: "Failed to update green energy plan",
    };
  }
}

// Delete green energy plan (admin only)
export async function deleteGreenEnergyPlan(id: string) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if there are any investments for this plan
    const investments = await prisma.greenEnergyInvestment.findMany({
      where: { planId: id },
    });

    if (investments.length > 0) {
      return {
        success: false,
        error: "Cannot delete plan with existing investments",
      };
    }

    await prisma.greenEnergyPlan.delete({
      where: { id },
    });

    revalidatePath("/admin/green-energy/plans");
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting green energy plan:", error);
    return {
      success: false,
      error: "Failed to delete green energy plan",
    };
  }
}

// Invest in green energy plan
export async function investInGreenEnergy(planId: string, amount: number, reinvest: boolean = false) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Check KYC status
    if (!session.user.kycStatus || session.user.kycStatus !== "APPROVED") {
      return {
        success: false,
        requiresKyc: true,
        error: "KYC verification required to make investments",
      };
    }

    // Get plan details
    const plan = await prisma.greenEnergyPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return {
        success: false,
        error: "Green energy plan not found",
      };
    }

    // Validate investment amount
    if (Number(amount) < Number(plan.minAmount) || Number(amount) > Number(plan.maxAmount)) {
      return {
        success: false,
        error: `Investment amount must be between ${plan.minAmount} and ${plan.maxAmount}`,
      };
    }

    // Get user wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return {
        success: false,
        error: "Wallet not found",
      };
    }

    // Check if user has enough balance
    if (wallet.balance < amount) {
      return {
        success: false,
        error: "Insufficient wallet balance",
      };
    }

    // Calculate expected return
    const expectedReturn = Number(amount) * (Number(plan.returnRate) / 100);

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // Create wallet transaction
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "INVESTMENT",
          amount: amount,
          status: "COMPLETED",
          cryptoType: "USDT", // Default to USDT
          description: `Investment in ${plan.name} (${plan.type})`,
        },
      });

      // Create green energy investment
      const investment = await tx.greenEnergyInvestment.create({
        data: {
          userId,
          planId,
          type: plan.type,
          amount,
          expectedReturn,
          reinvest,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: new Date(Date.now() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000), // Approximate end date
        },
      });

      return {
        investment,
        updatedWallet,
        walletTransaction
      };
    });

    revalidatePath("/green-energy/shares");
    revalidatePath("/green-energy/portfolio");
    revalidatePath("/dashboard/wallet");
    
    return {
      success: true,
      data: serializeGreenEnergyInvestment(result.investment as unknown as GreenEnergyInvestment),
    };
  } catch (error) {
    // Safely handle the error, even if it's null or undefined
    const errorMessage = error instanceof Error ? error.message : "Failed to invest in green energy";
    
    // Fix the console.error call to avoid passing null directly
    if (error) {
      console.error("Error investing in green energy:", typeof error === 'object' ? 'Error object' : 'Unknown error type');
    } else {
      console.error("Error investing in green energy: Unknown error occurred");
    }
    
    return {
      success: false,
      error: errorMessage,
      requiresKyc: false
    };
  }
}

// Get user green energy investments
export async function getUserGreenEnergyInvestments() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      redirect("/login");
    }

    const userId = session.user.id;

    const investments = await prisma.greenEnergyInvestment.findMany({
      where: { userId },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: investments.map((inv) => serializeGreenEnergyInvestment(inv as unknown as GreenEnergyInvestment)),
    };
  } catch (error) {
    console.error("Error fetching green energy investments:", error);
    return {
      success: false,
      error: "Failed to fetch green energy investments",
    };
  }
}

// Get all green energy investments (admin only)
export async function getAllGreenEnergyInvestments() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const investments = await prisma.greenEnergyInvestment.findMany({
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: investments.map((inv) => serializeGreenEnergyInvestment(inv as unknown as GreenEnergyInvestment)),
    };
  } catch (error) {
    console.error("Error fetching green energy investments:", error);
    return {
      success: false,
      error: "Failed to fetch green energy investments",
    };
  }
}

// Mature green energy investment (admin only)
export async function matureGreenEnergyInvestment(id: string, actualReturn?: number) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get investment details
    const investment = await prisma.greenEnergyInvestment.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!investment) {
      return {
        success: false,
        error: "Investment not found",
      };
    }

    if (investment.status !== InvestmentStatus.ACTIVE) {
      return {
        success: false,
        error: "Investment is not active",
      };
    }

    // Use expected return if actual return is not provided
    const returnAmount = actualReturn !== undefined ? actualReturn : investment.expectedReturn;

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update investment status
      const updatedInvestment = await tx.greenEnergyInvestment.update({
        where: { id },
        data: {
          status: InvestmentStatus.MATURED,
          actualReturn: returnAmount,
          endDate: new Date(),
        },
      });

      // If reinvest is true, create a new investment
      if (investment.reinvest) {
        // Get the plan
        const plan = await tx.greenEnergyPlan.findUnique({
          where: { id: investment.planId },
        });

        if (!plan) {
          throw new Error("Plan not found");
        }

        // Calculate new investment amount (original + return)
        const newAmount = Number(investment.amount) + Number(returnAmount);

        // Create new investment
        await tx.greenEnergyInvestment.create({
          data: {
            userId: investment.userId,
            planId: investment.planId,
            type: investment.type,
            amount: newAmount,
            expectedReturn: newAmount * (Number(plan.returnRate) / 100),
            reinvest: investment.reinvest,
            status: InvestmentStatus.ACTIVE,
            startDate: new Date(),
            endDate: new Date(Date.now() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000),
          },
        });
      } else {
        // Update wallet balance
        const wallet = await tx.wallet.findUnique({
          where: { userId: investment.userId },
        });

        if (!wallet) {
          throw new Error("Wallet not found");
        }

        // Return original investment + return
        const totalReturn = Number(investment.amount) + Number(returnAmount);

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: totalReturn,
            },
          },
        });

        // Create wallet transaction
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "RETURN",
            amount: totalReturn,
            status: "COMPLETED",
            cryptoType: "USDT", // Default to USDT
            description: `Return from green energy investment (${investment.type})`,
          },
        });
      }

      return {
        updatedInvestment,
      };
    });

    revalidatePath("/admin/green-energy/investments");
    
    return {
      success: true,
      data: serializeGreenEnergyInvestment(result.updatedInvestment as unknown as GreenEnergyInvestment),
    };
  } catch (error) {
    console.error("Error maturing green energy investment:", error);
    return {
      success: false,
      error: "Failed to mature investment",
    };
  }
}

// Cancel green energy investment (admin only)
export async function cancelGreenEnergyInvestment(id: string) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get investment details
    const investment = await prisma.greenEnergyInvestment.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!investment) {
      return {
        success: false,
        error: "Investment not found",
      };
    }

    if (investment.status !== InvestmentStatus.ACTIVE) {
      return {
        success: false,
        error: "Investment is not active",
      };
    }

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update investment status
      const updatedInvestment = await tx.greenEnergyInvestment.update({
        where: { id },
        data: {
          status: InvestmentStatus.CANCELLED,
          endDate: new Date(),
        },
      });

      // Update wallet balance (return original investment)
      const wallet = await tx.wallet.findUnique({
        where: { userId: investment.userId },
      });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: Number(investment.amount),
          },
        },
      });

      // Create wallet transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "RETURN",
          amount: Number(investment.amount),
          status: "COMPLETED",
          cryptoType: "USDT", // Default to USDT
          description: `Refund from cancelled green energy investment (${investment.type})`,
        },
      });

      return {
        updatedInvestment,
      };
    });

    revalidatePath("/admin/green-energy/investments");
    
    return {
      success: true,
      data: serializeGreenEnergyInvestment(result.updatedInvestment as unknown as GreenEnergyInvestment),
    };
  } catch (error) {
    console.error("Error cancelling green energy investment:", error);
    return {
      success: false,
      error: "Failed to cancel investment",
    };
  }
}

// Get green energy investment by ID
export async function getGreenEnergyInvestmentById(id: string) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      redirect("/login");
    }

    const userId = session.user.id;

    const investment = await prisma.greenEnergyInvestment.findUnique({
      where: { 
        id,
        ...(session.user.role !== "ADMIN" ? { userId } : {}) // Only admins can view any investment
      },
      include: {
        plan: true,
        user: true,
      },
    });

    if (!investment) {
      return {
        success: false,
        error: "Investment not found",
      };
    }

    return {
      success: true,
      data: serializeGreenEnergyInvestment(investment as unknown as GreenEnergyInvestment),
    };
  } catch (error) {
    console.error("Error fetching green energy investment:", error);
    return {
      success: false,
      error: "Failed to fetch green energy investment",
    };
  }
} 