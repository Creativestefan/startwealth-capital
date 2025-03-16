"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { WalletDepositInput, WalletWithdrawalInput, WalletPayoutInput } from "@/types/wallet"

/**
 * Get the current user's wallet
 */
export async function getUserWallet() {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" }
  }
  
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })
    
    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }
    
    return { success: true, data: wallet }
  } catch (error) {
    console.error("Error fetching wallet:", error)
    return { success: false, error: "Failed to fetch wallet" }
  }
}

/**
 * Get all transactions for the current user's wallet
 */
export async function getWalletTransactions() {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" }
  }
  
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    
    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }
    
    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
    })
    
    return { success: true, data: transactions }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return { success: false, error: "Failed to fetch transactions" }
  }
}

/**
 * Submit a deposit request
 */
export async function depositFunds(data: WalletDepositInput) {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" }
  }
  
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })
    
    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }
    
    // Create a pending deposit transaction
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "DEPOSIT",
        amount: data.amount,
        status: "PENDING",
        cryptoType: data.cryptoType,
        txHash: data.txHash,
        description: `Deposit of ${data.amount} USD via ${data.cryptoType}`,
      },
    })
    
    // Create a notification for the admin
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "WALLET_UPDATED",
        title: "New Deposit Request",
        message: `A new deposit request of ${data.amount} USD has been submitted.`,
        read: false,
      },
    })
    
    revalidatePath("/wallet")
    
    return { success: true, data: transaction }
  } catch (error) {
    console.error("Error creating deposit:", error)
    return { success: false, error: "Failed to create deposit request" }
  }
}

/**
 * Submit a withdrawal request
 * Withdrawals are internal transfers to the user's investment accounts
 */
export async function withdrawFunds(data: WalletWithdrawalInput) {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" }
  }
  
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })
    
    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }
    
    // Check if user has sufficient balance
    if (wallet.balance < data.amount) {
      return { success: false, error: "Insufficient balance" }
    }
    
    // Create a pending withdrawal transaction
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "WITHDRAWAL",
        amount: data.amount,
        status: "PENDING",
        cryptoType: data.cryptoType,
        description: `Withdrawal of ${data.amount} USD via ${data.cryptoType} for internal investment`,
      },
    })
    
    // Create a notification for the admin
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "WALLET_UPDATED",
        title: "New Withdrawal Request",
        message: `A new withdrawal request of ${data.amount} USD has been submitted.`,
        read: false,
      },
    })
    
    revalidatePath("/wallet")
    
    return { success: true, data: transaction }
  } catch (error) {
    console.error("Error creating withdrawal:", error)
    return { success: false, error: "Failed to create withdrawal request" }
  }
}

/**
 * Submit a payout request
 * Payouts are external transfers to the user's personal crypto wallets
 */
export async function payoutFunds(data: WalletPayoutInput) {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" }
  }
  
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })
    
    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }
    
    // Check if user has sufficient balance
    if (wallet.balance < data.amount) {
      return { success: false, error: "Insufficient balance" }
    }
    
    // Create a pending payout transaction
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "PAYOUT",
        amount: data.amount,
        status: "PENDING",
        cryptoType: data.cryptoType,
        description: `Payout of ${data.amount} USD via ${data.cryptoType} to external wallet${data.reason ? `: ${data.reason}` : ''}`,
      },
    })
    
    // Create a notification for the admin
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "WALLET_UPDATED",
        title: "New Payout Request",
        message: `A new payout request of ${data.amount} USD has been submitted.`,
        read: false,
      },
    })
    
    revalidatePath("/wallet")
    
    return { success: true, data: transaction }
  } catch (error) {
    console.error("Error creating payout:", error)
    return { success: false, error: "Failed to create payout request" }
  }
}

/**
 * Get wallet statistics for the current user
 */
export async function getWalletStats() {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" }
  }
  
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    
    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }
    
    // Get total deposits
    const totalDeposits = await prisma.walletTransaction.aggregate({
      where: {
        walletId: wallet.id,
        type: "DEPOSIT",
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    })
    
    // Get total withdrawals (internal)
    const totalWithdrawals = await prisma.walletTransaction.aggregate({
      where: {
        walletId: wallet.id,
        type: "WITHDRAWAL",
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    })
    
    // Get total payouts (external)
    // Include both PENDING and COMPLETED transactions for deposits
    const allDeposits = await prisma.walletTransaction.aggregate({
      where: {
        walletId: wallet.id,
        type: "DEPOSIT",
      },
      _sum: {
        amount: true,
      },
    })
    
    // Get total returns
    const totalReturns = await prisma.walletTransaction.aggregate({
      where: {
        walletId: wallet.id,
        type: "RETURN",
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    })
    
    return {
      success: true,
      data: {
        totalDeposits: allDeposits._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        totalPayouts: 0, // Set to 0 for now until migration is complete
        totalReturns: totalReturns._sum.amount || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching wallet stats:", error instanceof Error ? error.message : String(error))
    return { success: false, error: "Failed to fetch wallet statistics" }
  }
} 