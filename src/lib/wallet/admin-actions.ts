"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { toast } from "sonner"

/**
 * Get all wallets for admin dashboard
 */
export async function getAllWallets() {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    const wallets = await prisma.wallet.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })
    
    // Serialize Decimal objects to numbers for JSON serialization
    const serializedWallets = wallets.map(wallet => ({
      ...wallet,
      balance: Number(wallet.balance),
      transactions: wallet.transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount)
      }))
    }))
    
    return { success: true, data: serializedWallets }
  } catch (error) {
    console.error("[GET_ALL_WALLETS]", error)
    return { success: false, error: "Failed to fetch wallets" }
  }
}

/**
 * Get a specific user's wallet for admin
 */
export async function getUserWalletForAdmin(userId: string) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            wallet: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          }
        },
      },
    })
    
    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }
    
    // Get property transactions for this user
    const propertyTransactions = await prisma.propertyTransaction.findMany({
      where: { userId },
      include: {
        property: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    
    // Convert Decimal objects to numbers for serialization
    const serializedWallet = {
      ...wallet,
      balance: Number(wallet.balance),
      transactions: wallet.transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount)
      }))
    }
    
    const serializedPropertyTransactions = propertyTransactions.map(pt => ({
      ...pt,
      amount: Number(pt.amount),
      installmentAmount: pt.installmentAmount ? Number(pt.installmentAmount) : null,
      property: {
        ...pt.property,
        price: Number(pt.property.price)
      }
    }))
    
    return { 
      success: true, 
      data: { 
        wallet: serializedWallet,
        propertyTransactions: serializedPropertyTransactions
      } 
    }
  } catch (error) {
    console.error("[GET_USER_WALLET]", error)
    return { success: false, error: "Failed to fetch wallet" }
  }
}

/**
 * Approve a deposit transaction
 */
export async function approveDeposit(transactionId: string) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    // Get the transaction
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    })
    
    if (!transaction) {
      return { success: false, error: "Transaction not found" }
    }
    
    if (transaction.status !== "PENDING") {
      return { success: false, error: "Transaction is not pending" }
    }
    
    // Update transaction status and wallet balance
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Update transaction status
      const updated = await tx.walletTransaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      })
      
      // Update wallet balance
      await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      })
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: transaction.wallet.userId,
          type: "WALLET_UPDATED",
          title: "Deposit Approved",
          message: `Your deposit of ${transaction.amount} ${transaction.cryptoType} has been approved.`,
          read: false,
        },
      })
      
      return updated
    })
    
    revalidatePath(`/admin/users/wallets/${transaction.wallet.userId}`)
    
    return { success: true, data: updatedTransaction }
  } catch (error) {
    console.error("[APPROVE_DEPOSIT]", error)
    return { success: false, error: "Failed to approve deposit" }
  }
}

/**
 * Reject a deposit transaction
 */
export async function rejectDeposit(transactionId: string, reason: string) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    // Get the transaction
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    })
    
    if (!transaction) {
      return { success: false, error: "Transaction not found" }
    }
    
    if (transaction.status !== "PENDING") {
      return { success: false, error: "Transaction is not pending" }
    }
    
    // Update transaction status
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Update transaction status
      const updated = await tx.walletTransaction.update({
        where: { id: transactionId },
        data: { 
          status: "FAILED",
          description: transaction.description + ` (Rejected: ${reason})`,
        },
      })
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: transaction.wallet.userId,
          type: "WALLET_UPDATED",
          title: "Deposit Rejected",
          message: `Your deposit of ${transaction.amount} ${transaction.cryptoType} has been rejected. Reason: ${reason}`,
          read: false,
        },
      })
      
      return updated
    })
    
    revalidatePath(`/admin/users/wallets/${transaction.wallet.userId}`)
    
    return { success: true, data: updatedTransaction }
  } catch (error) {
    console.error("[REJECT_DEPOSIT]", error)
    return { success: false, error: "Failed to reject deposit" }
  }
}

/**
 * Approve a withdrawal transaction
 */
export async function approveWithdrawal(transactionId: string) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    // Get the transaction
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    })
    
    if (!transaction) {
      return { success: false, error: "Transaction not found" }
    }
    
    if (transaction.status !== "PENDING") {
      return { success: false, error: "Transaction is not pending" }
    }
    
    // Update transaction status
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Update transaction status
      const updated = await tx.walletTransaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      })
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: transaction.wallet.userId,
          type: "WALLET_UPDATED",
          title: "Withdrawal Approved",
          message: `Your withdrawal of ${transaction.amount} ${transaction.cryptoType} has been approved.`,
          read: false,
        },
      })
      
      return updated
    })
    
    revalidatePath(`/admin/users/wallets/${transaction.wallet.userId}`)
    
    return { success: true, data: updatedTransaction }
  } catch (error) {
    console.error("[APPROVE_WITHDRAWAL]", error)
    return { success: false, error: "Failed to approve withdrawal" }
  }
}

/**
 * Reject a withdrawal transaction
 */
export async function rejectWithdrawal(transactionId: string, reason: string) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    // Get the transaction
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    })
    
    if (!transaction) {
      return { success: false, error: "Transaction not found" }
    }
    
    if (transaction.status !== "PENDING") {
      return { success: false, error: "Transaction is not pending" }
    }
    
    // Update transaction status and refund wallet
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Update transaction status
      const updated = await tx.walletTransaction.update({
        where: { id: transactionId },
        data: { 
          status: "FAILED",
          description: transaction.description + ` (Rejected: ${reason})`,
        },
      })
      
      // Refund wallet balance
      await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      })
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: transaction.wallet.userId,
          type: "WALLET_UPDATED",
          title: "Withdrawal Rejected",
          message: `Your withdrawal of ${transaction.amount} ${transaction.cryptoType} has been rejected. Reason: ${reason}`,
          read: false,
        },
      })
      
      return updated
    })
    
    revalidatePath(`/admin/users/wallets/${transaction.wallet.userId}`)
    
    return { success: true, data: updatedTransaction }
  } catch (error) {
    console.error("[REJECT_WITHDRAWAL]", error)
    return { success: false, error: "Failed to reject withdrawal" }
  }
}

/**
 * Fund a user's wallet (admin only)
 */
export async function fundUserWallet(userId: string, amount: number, reason: string) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    // Get the user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })
    
    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }
    
    // Fund the wallet
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      })
      
      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          amount,
          status: "COMPLETED",
          cryptoType: "USDT",
          description: `Admin funding: ${reason}`,
        },
      })
      
      // Create notification
      await tx.notification.create({
        data: {
          userId,
          type: "WALLET_UPDATED",
          title: "Wallet Funded",
          message: `Your wallet has been funded with ${amount} USDT by admin. Reason: ${reason}`,
          read: false,
        },
      })
      
      return { wallet: updatedWallet, transaction }
    })
    
    revalidatePath(`/admin/users/wallets/${userId}`)
    
    return { success: true, data: result }
  } catch (error) {
    console.error("[FUND_USER_WALLET]", error)
    return { success: false, error: "Failed to fund wallet" }
  }
}

/**
 * Deduct from a user's wallet (admin only)
 */
export async function deductFromUserWallet(userId: string, amount: number, reason: string) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    // Get the user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })
    
    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }
    
    // Check if wallet has enough balance
    if (wallet.balance < amount) {
      return { success: false, error: "Insufficient wallet balance" }
    }
    
    // Deduct from the wallet
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      })
      
      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: reason.includes("Tesla Powerwall") ? "PURCHASE" : "WITHDRAWAL",
          amount,
          status: "COMPLETED",
          cryptoType: "USDT",
          description: reason.includes("Tesla Powerwall") ? `Purchase of ${reason}` : `Admin deduction: ${reason}`,
        },
      })
      
      // Create notification
      await tx.notification.create({
        data: {
          userId,
          type: "WALLET_UPDATED",
          title: reason.includes("Tesla Powerwall") ? "Purchase Completed" : "Wallet Deduction",
          message: reason.includes("Tesla Powerwall") 
            ? `${amount} USDT has been deducted from your wallet for the purchase of ${reason}`
            : `${amount} USDT has been deducted from your wallet by admin. Reason: ${reason}`,
          read: false,
        },
      })
      
      return { wallet: updatedWallet, transaction }
    })
    
    revalidatePath(`/admin/users/wallets/${userId}`)
    
    return { success: true, data: result }
  } catch (error) {
    console.error("[DEDUCT_FROM_USER_WALLET]", error)
    return { success: false, error: "Failed to deduct from wallet" }
  }
}

/**
 * Create a property purchase transaction (admin only)
 */
export async function createPropertyPurchaseTransaction(userId: string, propertyId: string, amount: number, propertyName: string) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    // Get the user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })
    
    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }
    
    // Check if wallet has enough balance
    if (wallet.balance < amount) {
      return { success: false, error: "Insufficient wallet balance" }
    }
    
    // Create the purchase transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      })
      
      // Create wallet transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "PURCHASE",
          amount,
          status: "COMPLETED",
          cryptoType: "USDT",
          description: `Purchase of property: ${propertyName}`,
        },
      })
      
      // Create notification
      await tx.notification.create({
        data: {
          userId,
          type: "WALLET_UPDATED",
          title: "Property Purchase",
          message: `${amount} USDT has been deducted from your wallet for the purchase of property: ${propertyName}`,
          read: false,
        },
      })
      
      return { wallet: updatedWallet, transaction }
    })
    
    revalidatePath(`/admin/users/wallets/${userId}`)
    
    return { success: true, data: result }
  } catch (error) {
    console.error("[CREATE_PROPERTY_PURCHASE]", error)
    return { success: false, error: "Failed to create property purchase transaction" }
  }
} 