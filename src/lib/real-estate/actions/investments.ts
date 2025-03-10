"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { Prisma } from "@prisma/client"
import { INVESTMENT_PLANS, INVESTMENT_STATUS, TRANSACTION_STATUS } from "../constants"
import { NotFoundError, ValidationError, UnauthorizedError, ForbiddenError } from "@/lib/errors"
import type { ApiResponse } from "../types"

// Import the KYC utility
import { checkKycStatus, type KycVerificationResponse } from "../utils/kyc-utils"
import { serializeData } from "../utils/formatting"
import { convertDecimalToNumber } from "../utils/decimal-converter"

interface InvestmentFilters {
  type?: string
  minAmount?: number
  maxAmount?: number
}

/**
 * Authentication middleware that handles both user and admin authentication
 *
 * @param callback Function to execute if authentication is successful
 * @param options Authentication options (adminOnly, requireKyc)
 * @returns ApiResponse with the result of the callback or an error
 */
async function withAuth<T>(
  callback: (session: any) => Promise<T>,
  options: { adminOnly?: boolean; requireKyc?: boolean } = {},
): Promise<ApiResponse<T>> {
  try {
    const session = await getServerSession(authConfig)

    // Check if user is authenticated
    if (!session?.user) {
      throw new UnauthorizedError()
    }

    // Check if admin access is required
    if (options.adminOnly && session.user.role !== "ADMIN") {
      throw new ForbiddenError("Admin access required")
    }

    // Check if KYC is required
    if (options.requireKyc && (!session.user.kycStatus || session.user.kycStatus !== "APPROVED")) {
      throw new Error("KYC verification required")
    }

    // Execute the callback with the session
    const result = await callback(session)
    return { success: true, data: result }
  } catch (error) {
    // Avoid using console.error with the error object directly
    console.error("[AUTH_MIDDLEWARE] Error occurred:", typeof error === 'object' ? 'Error object' : 'Unknown error type')
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to authenticate",
    }
  }
}

// ==========================================
// User-facing operations
// ==========================================

/**
 * Fetches available investment plans
 */
export async function getInvestmentPlans(filters?: InvestmentFilters): Promise<ApiResponse<any[]>> {
  try {
    const where: any = {}

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.minAmount) {
      where.minAmount = {
        gte: filters.minAmount,
      }
    }

    if (filters?.maxAmount) {
      where.maxAmount = {
        lte: filters.maxAmount,
      }
    }

    const plans = await prisma.investmentPlan.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Serialize the data to convert Decimal objects to numbers
    const serializedPlans = serializeData(plans)
    return { success: true, data: serializedPlans }
  } catch (error) {
    console.error("Error fetching investment plans:", error)
    return { success: false, error: "Failed to fetch investment plans" }
  }
}

/**
 * Get a single investment plan by ID
 * 
 * @param id Investment plan ID
 * @returns ApiResponse with the investment plan or an error
 */
export async function getInvestmentPlanById(id: string): Promise<ApiResponse<any>> {
  try {
    const plan = await prisma.investmentPlan.findUnique({
      where: { id },
    })

    if (!plan) {
      return { success: false, error: `Investment plan with ID ${id} not found` }
    }

    // Serialize the data to convert Decimal objects to numbers
    const serializedPlan = serializeData(plan)
    return { success: true, data: serializedPlan }
  } catch (error) {
    console.error(`Error fetching investment plan with ID ${id}:`, error)
    return { success: false, error: `Failed to fetch investment plan with ID ${id}` }
  }
}

/**
 * Makes an investment in a real estate share
 */
export async function makeInvestment(
  investmentId: string,
  type: "SEMI_ANNUAL" | "ANNUAL",
  amount: number,
): Promise<ApiResponse<any> | KycVerificationResponse> {
  try {
    const { isVerified, user } = await checkKycStatus()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check KYC status
    if (!isVerified) {
      return {
        success: false,
        requiresKyc: true,
        error: "KYC verification required to make investments",
      }
    }

    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate investment type
    const plan = INVESTMENT_PLANS[type]
    if (!plan) {
      return { success: false, error: "Invalid investment type" }
    }

    // Validate amount
    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return {
        success: false,
        error: `Investment amount must be between ${plan.minAmount} and ${plan.maxAmount}`,
      }
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }

    // Check if user has enough balance
    if (wallet.balance < amount) {
      return { success: false, error: "Insufficient funds" }
    }

    // Calculate expected return and end date
    const expectedReturn = amount * plan.returnRate
    
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + plan.durationMonths) // Fixed: using durationMonths instead of duration

    // Start a transaction to create investment and update wallet
    const result = await prisma.$transaction(async (tx) => {
      // Create investment
      const investment = await tx.realEstateInvestment.create({
        data: {
          userId: session.user.id,
          type,
          amount,
          status: INVESTMENT_STATUS.ACTIVE,
          startDate,
          endDate,
          expectedReturn,
          reinvest: false, // Default to false
        },
      })

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      })

      // Create wallet transaction
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "INVESTMENT",
          amount,
          status: TRANSACTION_STATUS.COMPLETED,
          cryptoType: "USDT", // Default to USDT
          description: `Investment in ${type} plan`,
        },
      })

      return {
        investment,
        wallet: updatedWallet,
        transaction: walletTransaction,
      }
    })

    revalidatePath("/dashboard/real-estate/shares")
    revalidatePath("/dashboard/real-estate/portfolio")
    // Serialize the result to convert Decimal objects to numbers
    return { success: true, data: convertDecimalToNumber(result) }
  } catch (error) {
    // Safely handle the error, even if it's null or undefined
    const errorMessage = error instanceof Error ? error.message : "Failed to make investment"
    
    // Fix the console.error call to avoid passing null directly
    if (error) {
      console.error("[MAKE_INVESTMENT]", error)
    } else {
      console.error("[MAKE_INVESTMENT] Unknown error occurred")
    }
    
    return {
      success: false,
      error: errorMessage,
      requiresKyc: false,
    }
  }
}

/**
 * Gets a single investment by ID for a regular user
 * Only allows users to view their own investments
 */
export async function getUserInvestmentById(id: string): Promise<ApiResponse<any>> {
  return withAuth(
    async (session) => {
      if (!session?.user?.email) {
        throw new UnauthorizedError("You must be logged in to view investments")
      }

      // Get the investment with user details
      const investment = await prisma.realEstateInvestment.findFirst({
        where: { 
          id,
          user: {
            email: session.user.email
          }
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
      })

      if (!investment) {
        throw new NotFoundError("Investment", id)
      }

      // Serialize the investment to convert Decimal objects to numbers
      const serializedInvestment = serializeData(investment)
      
      // Get property information separately if needed
      // This is a workaround since there's no direct relationship in the schema
      const propertyInfo = await prisma.property.findFirst({
        where: {
          // You might need to adjust this query based on your application logic
          // For example, you might have a way to link investments to properties
          // through transaction records or other means
        },
      });
      
      if (propertyInfo) {
        serializedInvestment.property = serializeData(propertyInfo);
      }
      
      return serializedInvestment
    },
    { adminOnly: false },
  )
}

// ==========================================
// Admin operations
// ==========================================

/**
 * Creates a new investment plan
 * Accessible only to admin users
 */
export async function createInvestmentPlan(data: {
  name: string
  description: string
  type: "SEMI_ANNUAL" | "ANNUAL"
  minAmount: number
  maxAmount: number
  returnRate: number
  durationMonths: number
  image: string
}): Promise<ApiResponse<any>> {
  return withAuth(
    async (session) => {
      try {
        // Validate input
        if (!data.name || data.name.length < 3) {
          throw new ValidationError("Name must be at least 3 characters")
        }

        if (!data.description || data.description.length < 10) {
          throw new ValidationError("Description must be at least 10 characters")
        }

        if (data.minAmount <= 0 || data.maxAmount <= 0 || data.minAmount >= data.maxAmount) {
          throw new ValidationError("Invalid amount range")
        }

        if (data.returnRate <= 0 || data.returnRate > 1) {
          throw new ValidationError("Return rate must be between 0 and 1")
        }
        
        // Set duration based on plan type
        const durationMonths = data.type === "SEMI_ANNUAL" ? 6 : 12;

        // Create the investment plan in the database
        const plan = await prisma.investmentPlan.create({
          data: {
            name: data.name,
            description: data.description,
            type: data.type,
            minAmount: new Prisma.Decimal(data.minAmount),
            maxAmount: new Prisma.Decimal(data.maxAmount),
            returnRate: new Prisma.Decimal(data.returnRate),
            durationMonths: durationMonths,
            image: data.image || "",
          } as any, // Use type assertion to avoid TypeScript error
        })

        // Revalidate the investment plans page to show the new plan
        revalidatePath("/admin/properties/plans")
        
        return serializeData(plan)
      } catch (error) {
        console.error("Error creating investment plan:", error instanceof Error ? error.message : "Unknown error");
        throw error;
      }
    },
    { adminOnly: true },
  )
}

/**
 * Update an existing investment plan
 * 
 * @param id Investment plan ID
 * @param data Updated investment plan data
 * @returns ApiResponse with the updated investment plan or an error
 */
export async function updateInvestmentPlan(
  id: string,
  data: {
    name: string
    description: string
    type: "SEMI_ANNUAL" | "ANNUAL"
    minAmount: number
    maxAmount: number
    returnRate: number
    durationMonths: number
    image: string
  }
): Promise<ApiResponse<any>> {
  return withAuth(
    async (session) => {
      try {
        // Check if the investment plan exists
        const existingPlan = await prisma.investmentPlan.findUnique({
          where: { id },
        })

        if (!existingPlan) {
          throw new NotFoundError("Investment Plan", id)
        }

        // Validate input
        if (!data.name || data.name.length < 3) {
          throw new ValidationError("Name must be at least 3 characters")
        }

        if (!data.description || data.description.length < 10) {
          throw new ValidationError("Description must be at least 10 characters")
        }

        if (data.minAmount <= 0 || data.maxAmount <= 0 || data.minAmount >= data.maxAmount) {
          throw new ValidationError("Invalid amount range")
        }

        if (data.returnRate <= 0 || data.returnRate > 1) {
          throw new ValidationError("Return rate must be between 0 and 1")
        }
        
        // Set duration based on plan type
        const durationMonths = data.type === "SEMI_ANNUAL" ? 6 : 12;

        // Update the investment plan in the database
        const updatedPlan = await prisma.investmentPlan.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
            type: data.type,
            minAmount: new Prisma.Decimal(data.minAmount),
            maxAmount: new Prisma.Decimal(data.maxAmount),
            returnRate: new Prisma.Decimal(data.returnRate),
            durationMonths: durationMonths,
            image: data.image || "",
          } as any, // Use type assertion to avoid TypeScript error
        })

        return serializeData(updatedPlan)
      } catch (error) {
        console.error("Error updating investment plan:", error instanceof Error ? error.message : "Unknown error");
        throw error;
      }
    },
    { adminOnly: true }
  )
}

/**
 * Gets all investments for admin dashboard
 * Accessible only to admin users
 */
export async function getAllInvestments(filters?: {
  userId?: string
  status?: "ACTIVE" | "MATURED" | "CANCELLED"
  type?: "SEMI_ANNUAL" | "ANNUAL"
}): Promise<ApiResponse<any[]>> {
  return withAuth(
    async () => {
      // Build where clause based on filters
      const where: any = {}

      if (filters?.userId) {
        where.userId = filters.userId
      }

      if (filters?.status) {
        where.status = filters.status
      }

      if (filters?.type) {
        where.type = filters.type
      }

      // Fetch all investments with user details
      const investments = await prisma.realEstateInvestment.findMany({
        where,
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
        orderBy: {
          createdAt: "desc",
        },
      })

      // Serialize the investments to convert Decimal objects to numbers
      const serializedInvestments = serializeData(investments)
      
      return serializedInvestments
    },
    { adminOnly: true },
  )
}

/**
 * Gets investment statistics for admin dashboard
 * Accessible only to admin users
 */
export async function getInvestmentStats(): Promise<ApiResponse<any>> {
  return withAuth(
    async () => {
      // Fixed: Removed the duplicate variable declaration and fixed the array destructuring
      const [
        totalInvestments,
        activeInvestments,
        maturedInvestments,
        cancelledInvestments,
        totalInvestmentAmount,
        totalExpectedReturn,
        totalActualReturn,
      ] = await Promise.all([
        prisma.realEstateInvestment.count(),
        prisma.realEstateInvestment.count({ where: { status: "ACTIVE" } }),
        prisma.realEstateInvestment.count({ where: { status: "MATURED" } }),
        prisma.realEstateInvestment.count({ where: { status: "CANCELLED" } }),
        prisma.realEstateInvestment.aggregate({
          _sum: { amount: true },
        }),
        prisma.realEstateInvestment.aggregate({
          _sum: { expectedReturn: true },
        }),
        prisma.realEstateInvestment.aggregate({
          _sum: { actualReturn: true },
        }),
      ])

      // Get investment counts by type
      const semiAnnualCount = await prisma.realEstateInvestment.count({
        where: { type: "SEMI_ANNUAL" },
      })
      
      const annualCount = await prisma.realEstateInvestment.count({
        where: { type: "ANNUAL" },
      })

      // Prepare the stats object
      const stats = {
        totalInvestments,
        activeInvestments,
        maturedInvestments,
        cancelledInvestments,
        totalInvestmentAmount: totalInvestmentAmount._sum.amount || 0,
        totalExpectedReturn: totalExpectedReturn._sum.expectedReturn || 0,
        totalActualReturn: totalActualReturn._sum.actualReturn || 0,
        semiAnnualCount,
        annualCount,
      }
      
      // Serialize the data to convert Decimal objects to numbers
      return serializeData(stats)
    },
    { adminOnly: true }
  )
}

/**
 * Manually matures an investment (admin only)
 * This is useful for testing or handling special cases
 */
export async function matureInvestment(investmentId: string, actualReturn?: number): Promise<ApiResponse<any>> {
  return withAuth(
    async () => {
      // Get the investment
      const investment = await prisma.realEstateInvestment.findUnique({
        where: { id: investmentId },
        include: { user: true },
      })

      if (!investment) {
        throw new NotFoundError("Investment", investmentId)
      }

      if (investment.status !== "ACTIVE") {
        throw new ValidationError("Only active investments can be matured")
      }

      // Calculate actual return if not provided
      const returnAmount = actualReturn !== undefined ? new Prisma.Decimal(actualReturn) : investment.expectedReturn

      // Update the investment with current date as end date
      const updatedInvestment = await prisma.realEstateInvestment.update({
        where: { id: investmentId },
        data: {
          status: "MATURED",
          actualReturn: returnAmount,
          endDate: new Date(), // Set the end date to the current date
        },
      })

      // Create notification for the user
      await prisma.notification.create({
        data: {
          userId: investment.userId,
          type: "INVESTMENT_MATURED",
          title: "Investment Matured",
          message: `Your investment of ${Number(investment.amount).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })} has matured and is ready for withdrawal.`,
          actionUrl: "/dashboard/real-estate/portfolio",
        },
      })

      revalidatePath("/admin/investments")
      revalidatePath("/dashboard/real-estate/portfolio")

      // Serialize the result to convert Decimal objects to numbers
      const serializedInvestment = serializeData(updatedInvestment)
      
      return serializedInvestment
    },
    { adminOnly: true },
  )
}

/**
 * Cancels an investment (admin only)
 */
export async function cancelInvestment(investmentId: string, refundAmount?: number): Promise<ApiResponse<any>> {
  return withAuth(
    async () => {
      // Get the investment
      const investment = await prisma.realEstateInvestment.findUnique({
        where: { id: investmentId },
        include: { user: true },
      })

      if (!investment) {
        throw new NotFoundError("Investment", investmentId)
      }

      if (investment.status === "CANCELLED") {
        throw new ValidationError("Investment is already cancelled")
      }

      // Start a transaction to update investment and refund wallet if needed
      const result = await prisma.$transaction(async (tx) => {
        // Update the investment with current date as end date
        const updatedInvestment = await tx.realEstateInvestment.update({
          where: { id: investmentId },
          data: {
            status: "CANCELLED",
            actualReturn: refundAmount !== undefined ? new Prisma.Decimal(refundAmount) : null,
            endDate: new Date(), // Set the end date to the current date
          },
        })

        // If refund amount is provided, update the user's wallet
        if (refundAmount !== undefined && refundAmount > 0) {
          // Get user's wallet
          const wallet = await tx.wallet.findUnique({
            where: { userId: investment.userId },
          })

          if (wallet) {
            // Update wallet balance
            const updatedWallet = await tx.wallet.update({
              where: { id: wallet.id },
              data: {
                balance: {
                  increment: refundAmount,
                },
              },
            })

            // Create wallet transaction
            const walletTransaction = await tx.walletTransaction.create({
              data: {
                walletId: wallet.id,
                type: "RETURN",
                amount: refundAmount,
                status: "COMPLETED",
                cryptoType: "USDT",
                description: `Refund from cancelled investment ${investmentId}`,
              },
            })

            return {
              investment: updatedInvestment,
              wallet: updatedWallet,
              transaction: walletTransaction,
            }
          }
        }

        return { investment: updatedInvestment }
      })

      // Create notification for the user
      await prisma.notification.create({
        data: {
          userId: investment.userId,
          type: "SYSTEM_UPDATE",
          title: "Investment Cancelled",
          message: `Your investment of ${Number(investment.amount).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })} has been cancelled.${
            refundAmount
              ? ` A refund of ${refundAmount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })} has been credited to your wallet.`
              : ""
          }`,
          actionUrl: "/dashboard/real-estate/portfolio",
        },
      })

      revalidatePath("/admin/investments")
      revalidatePath("/dashboard/real-estate/portfolio")

      // Serialize the result to convert Decimal objects to numbers
      const serializedResult = serializeData(result)
      
      return serializedResult
    },
    { adminOnly: true },
  )
}

/**
 * Deletes an investment plan (admin only)
 */
export async function deleteInvestmentPlan(id: string): Promise<ApiResponse<boolean>> {
  return withAuth(
    async () => {
      // Delete the investment plan from the database
      await (prisma as any).investmentPlan.delete({
        where: { id },
      })
      
      // Revalidate the investment plans page
      revalidatePath("/admin/properties/plans")
      
      return true
    },
    { adminOnly: true }
  )
}

/**
 * Gets a single investment by ID
 * Accessible only to admin users
 */
export async function getInvestmentById(id: string): Promise<ApiResponse<any>> {
  return withAuth(
    async () => {
      // Get the investment with user details
      const investment = await prisma.realEstateInvestment.findUnique({
        where: { id },
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
      })

      if (!investment) {
        throw new NotFoundError("Investment", id)
      }

      // Serialize the investment to convert Decimal objects to numbers
      const serializedInvestment = serializeData(investment)
      
      return serializedInvestment
    },
    { adminOnly: true },
  )
}

