"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { TRANSACTION_STATUS, INVESTMENT_STATUS } from "../constants"
import { NotFoundError, UnauthorizedError, ForbiddenError } from "@/lib/errors"
import type { ApiResponse } from "../types"
import { Prisma } from "@prisma/client"
import { serializeData } from "../utils/formatting"

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
    console.error("[AUTH_MIDDLEWARE]", error)
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
 * Fetches the user's real estate portfolio data
 */
export async function getUserPortfolio(): Promise<
  ApiResponse<{
    properties: any[]
    investments: any[]
    totalValue: number
    totalReturn: number
  }>
> {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    // Fetch property transactions
    const propertyTransactions = await prisma.propertyTransaction.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        property: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Fetch real estate investments
    const realEstateInvestments = await prisma.realEstateInvestment.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate total value and return
    const totalPropertyValue = propertyTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0)
    
    const totalInvestmentValue = realEstateInvestments.reduce((sum, investment) => sum + Number(investment.amount), 0)
    
    const totalInvestmentReturn = realEstateInvestments.reduce(
      (sum, investment) => sum + Number(investment.expectedReturn),
      0,
    )

    // Create the portfolio data object
    const portfolioData = {
      properties: serializeData(propertyTransactions),
      investments: serializeData(realEstateInvestments),
      totalValue: totalPropertyValue + totalInvestmentValue,
      totalReturn: totalInvestmentReturn,
    }

    return {
      success: true,
      data: portfolioData,
    }
  } catch (error) {
    console.error("[GET_USER_PORTFOLIO]", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch portfolio data",
    }
  }
}

/**
 * Withdraws a matured investment to the user's wallet
 */
export async function withdrawInvestment(investmentId: string): Promise<ApiResponse<any>> {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    // Get the investment
    const investment = await prisma.realEstateInvestment.findUnique({
      where: {
        id: investmentId,
      },
    })

    if (!investment) {
      return { success: false, error: "Investment not found" }
    }

    // Check if the investment belongs to the user
    if (investment.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if the investment is matured
    if (investment.status !== INVESTMENT_STATUS.MATURED) {
      return {
        success: false,
        error: "Only matured investments can be withdrawn",
      }
    }

    // Start a transaction to update investment and wallet
    const result = await prisma.$transaction(async (tx) => {
      // Update investment status
      const updatedInvestment = await tx.realEstateInvestment.update({
        where: {
          id: investmentId,
        },
        data: {
          status: INVESTMENT_STATUS.CANCELLED,
          actualReturn: investment.expectedReturn,
        },
      })

      // Get user's wallet
      const wallet = await tx.wallet.findUnique({
        where: {
          userId: session.user.id,
        },
      })

      if (!wallet) {
        throw new Error("Wallet not found")
      }

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            increment: Number(investment.amount) + Number(investment.expectedReturn),
          },
        },
      })

      // Create wallet transaction
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "RETURN",
          amount: Number(investment.amount) + Number(investment.expectedReturn),
          status: TRANSACTION_STATUS.COMPLETED,
          cryptoType: "USDT", // Default to USDT
          description: `Return from investment ${investmentId}`,
        },
      })

      return {
        investment: updatedInvestment,
        wallet: updatedWallet,
        transaction: walletTransaction,
      }
    })

    revalidatePath("/dashboard/real-estate/portfolio")
    
    // Serialize the data to convert Decimal objects to numbers
    return { success: true, data: serializeData(result) }
  } catch (error) {
    console.error("[WITHDRAW_INVESTMENT]", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to withdraw investment",
    }
  }
}

/**
 * Makes an installment payment for a property
 */
export async function makeInstallmentPayment(transactionId: string): Promise<ApiResponse<any>> {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    // Get the property transaction
    const transaction = await prisma.propertyTransaction.findUnique({
      where: {
        id: transactionId,
      },
    })

    if (!transaction) {
      return { success: false, error: "Transaction not found" }
    }

    // Check if the transaction belongs to the user
    if (transaction.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if the transaction is an installment
    if (transaction.type !== "INSTALLMENT") {
      return { success: false, error: "Not an installment transaction" }
    }

    // Check if all installments are already paid
    if (transaction.paidInstallments >= (transaction.installments || 0)) {
      return { success: false, error: "All installments are already paid" }
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
    if (wallet.balance < Number(transaction.installmentAmount)) {
      return { success: false, error: "Insufficient funds" }
    }

    // Start a transaction to update transaction and wallet
    const result = await prisma.$transaction(async (tx) => {
      // Update transaction
      const updatedTransaction = await tx.propertyTransaction.update({
        where: {
          id: transactionId,
        },
        data: {
          paidInstallments: {
            increment: 1,
          },
          nextPaymentDue:
            transaction.paidInstallments + 1 >= (transaction.installments || 0)
              ? null
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status:
            transaction.paidInstallments + 1 >= (transaction.installments || 0)
              ? TRANSACTION_STATUS.COMPLETED
              : TRANSACTION_STATUS.PENDING,
        },
      })

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            decrement: Number(transaction.installmentAmount),
          },
        },
      })

      // Create wallet transaction
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "INVESTMENT",
          amount: Number(transaction.installmentAmount),
          status: TRANSACTION_STATUS.COMPLETED,
          cryptoType: "USDT", // Default to USDT
          description: `Installment payment for property transaction ${transactionId}`,
        },
      })

      return {
        transaction: updatedTransaction,
        wallet: updatedWallet,
        walletTransaction,
      }
    })

    revalidatePath("/dashboard/real-estate/portfolio")
    
    // Serialize the data to convert Decimal objects to numbers
    return { success: true, data: serializeData(result) }
  } catch (error) {
    console.error("[MAKE_INSTALLMENT_PAYMENT]", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to make installment payment",
    }
  }
}

/**
 * Gets detailed information about a property transaction
 */
export async function getPropertyTransactionById(transactionId: string): Promise<ApiResponse<any>> {
  return withAuth(async (session) => {
    // Find the transaction with related property data
    const transaction = await prisma.propertyTransaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            location: true,
            mainImage: true,
            features: true,
            status: true,
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
      },
    });

    if (!transaction) {
      throw new NotFoundError("Property transaction", transactionId);
    }

    // Verify the user owns this transaction or is an admin
    if (transaction.userId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError("You don't have permission to view this transaction");
    }

    return serializeData(transaction);
  });
}

// ==========================================
// Admin operations
// ==========================================

/**
 * Gets all user portfolios for admin dashboard
 * Accessible only to admin users
 */
export async function getAllUserPortfolios(): Promise<ApiResponse<any[]>> {
  return withAuth(
    async () => {
      // Get all users with their property transactions and investments
      const users = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          propertyTransactions: {
            include: {
              property: true,
            },
          },
          realEstateInvestments: true,
        },
      })

      // Calculate portfolio values for each user
      const portfolios = users.map((user) => {
        const totalPropertyValue = user.propertyTransactions.reduce(
          (sum, transaction) => sum + Number(transaction.amount),
          0,
        )

        const totalInvestmentValue = user.realEstateInvestments.reduce(
          (sum, investment) => sum + Number(investment.amount),
          0,
        )

        const totalInvestmentReturn = user.realEstateInvestments.reduce(
          (sum, investment) => sum + Number(investment.expectedReturn),
          0,
        )

        return {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          propertyCount: user.propertyTransactions.length,
          investmentCount: user.realEstateInvestments.length,
          totalPropertyValue,
          totalInvestmentValue,
          totalPortfolioValue: totalPropertyValue + totalInvestmentValue,
          totalExpectedReturn: totalInvestmentReturn,
        }
      })

      // Serialize the data to convert any remaining Decimal objects to numbers
      return serializeData(portfolios)
    },
    { adminOnly: true },
  )
}

/**
 * Gets a specific user's portfolio for admin review
 * Accessible only to admin users
 */
export async function getUserPortfolioByAdmin(userId: string): Promise<ApiResponse<any>> {
  return withAuth(
    async () => {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      })

      if (!user) {
        throw new NotFoundError("User", userId)
      }

      // Fetch property transactions
      const propertyTransactions = await prisma.propertyTransaction.findMany({
        where: { userId },
        include: { property: true },
        orderBy: { createdAt: "desc" },
      })

      // Fetch real estate investments
      const realEstateInvestments = await prisma.realEstateInvestment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      })

      // Calculate total value and return
      const totalPropertyValue = propertyTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0)
      
      const totalInvestmentValue = realEstateInvestments.reduce((sum, investment) => sum + Number(investment.amount), 0)
      
      const totalInvestmentReturn = realEstateInvestments.reduce(
        (sum, investment) => sum + Number(investment.expectedReturn),
        0,
      )

      // Create the portfolio data object with serialized data
      return {
        user,
        properties: serializeData(propertyTransactions),
        investments: serializeData(realEstateInvestments),
        totalPropertyValue,
        totalInvestmentValue,
        totalPortfolioValue: totalPropertyValue + totalInvestmentValue,
        totalExpectedReturn: totalInvestmentReturn,
      }
    },
    { adminOnly: true },
  )
}

/**
 * Admin function to manually update an investment status
 * Useful for marking investments as matured or handling special cases
 */
export async function updateInvestmentStatus(
  investmentId: string,
  status: "ACTIVE" | "MATURED" | "CANCELLED",
  actualReturn?: number,
): Promise<ApiResponse<any>> {
  return withAuth(
    async () => {
      // Get the investment
      const investment = await prisma.realEstateInvestment.findUnique({
        where: { id: investmentId },
      })

      if (!investment) {
        throw new NotFoundError("Investment", investmentId)
      }

      // Update the investment
      const updatedInvestment = await prisma.realEstateInvestment.update({
        where: { id: investmentId },
        data: {
          status,
          actualReturn: actualReturn !== undefined ? new Prisma.Decimal(actualReturn) : undefined,
        },
      })

      // If marking as matured, create a notification for the user
      if (status === "MATURED") {
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
      }

      revalidatePath("/dashboard/real-estate/portfolio")
      revalidatePath("/admin/properties")
      revalidatePath("/dashboard/real-estate/property")

      // Serialize the data to convert Decimal objects to numbers
      return serializeData(updatedInvestment)
    },
    { adminOnly: true },
  )
}

/**
 * Admin function to manually update a property transaction status
 */
export async function updatePropertyTransactionStatus(
  transactionId: string,
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED",
): Promise<ApiResponse<any>> {
  return withAuth(
    async () => {
      // Get the transaction
      const transaction = await prisma.propertyTransaction.findUnique({
        where: { id: transactionId },
        include: { property: true },
      })

      if (!transaction) {
        throw new NotFoundError("Property Transaction", transactionId)
      }

      // Update the transaction
      const updatedTransaction = await prisma.propertyTransaction.update({
        where: { id: transactionId },
        data: { status },
      })

      // If marking as completed, update the property status if needed
      if (status === "COMPLETED" && transaction.property.status === "PENDING") {
        await prisma.property.update({
          where: { id: transaction.propertyId },
          data: { status: "SOLD" },
        })
      }

      // Create a notification for the user
      await prisma.notification.create({
        data: {
          userId: transaction.userId,
          type: "SYSTEM_UPDATE",
          title: "Property Transaction Updated",
          message: `Your property transaction for ${transaction.property.name} has been updated to ${status}.`,
          actionUrl: "/dashboard/real-estate/portfolio",
        },
      })

      revalidatePath("/dashboard/real-estate/property")
      revalidatePath("/admin/properties")
      revalidatePath("/dashboard/real-estate/portfolio")

      // Serialize the data to convert Decimal objects to numbers
      return serializeData(updatedTransaction)
    },
    { adminOnly: true },
  )
}

/**
 * Gets portfolio statistics for admin dashboard
 */
export async function getPortfolioStats(): Promise<ApiResponse<any>> {
  return withAuth(
    async () => {
      const [
        totalUsers,
        totalProperties,
        totalInvestments,
        totalPropertyValue,
        totalInvestmentValue,
        totalExpectedReturns,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.propertyTransaction.count(),
        prisma.realEstateInvestment.count(),
        prisma.propertyTransaction.aggregate({
          _sum: { amount: true },
        }),
        prisma.realEstateInvestment.aggregate({
          _sum: { amount: true },
        }),
        prisma.realEstateInvestment.aggregate({
          _sum: { expectedReturn: true },
        }),
      ])

      // Get recent transactions
      const recentTransactions = await prisma.propertyTransaction.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          property: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      // Get recent investments
      const recentInvestments = await prisma.realEstateInvestment.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      // Convert Decimal values to numbers
      const propertyValueNum = totalPropertyValue._sum.amount ? Number(totalPropertyValue._sum.amount) : 0
      const investmentValueNum = totalInvestmentValue._sum.amount ? Number(totalInvestmentValue._sum.amount) : 0
      const expectedReturnsNum = totalExpectedReturns._sum.expectedReturn ? Number(totalExpectedReturns._sum.expectedReturn) : 0

      // Prepare stats object
      const stats = {
        totalUsers,
        totalProperties,
        totalInvestments,
        totalPropertyValue: propertyValueNum,
        totalInvestmentValue: investmentValueNum,
        totalExpectedReturns: expectedReturnsNum,
        totalPortfolioValue: propertyValueNum + investmentValueNum,
        recentTransactions,
        recentInvestments,
      }

      // Serialize the data to convert Decimal objects to numbers
      return serializeData(stats)
    },
    { adminOnly: true },
  )
}

