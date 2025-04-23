"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { CommissionStatus, NotificationType } from "@prisma/client"

/**
 * Get all referral commissions for the admin dashboard
 */
export async function getAllCommissions() {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    const commissions = await prisma.referralCommission.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        referral: {
          include: {
            referred: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    
    // Serialize Decimal objects to numbers for JSON
    return commissions.map(commission => ({
      ...commission,
      amount: Number(commission.amount),
    }))
  } catch (error) {
    console.error("[GET_ALL_COMMISSIONS]", error)
    throw error
  }
}

/**
 * Get all pending commissions that need admin approval
 */
export async function getPendingCommissions() {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    const commissions = await prisma.referralCommission.findMany({
      where: {
        status: CommissionStatus.PENDING
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
        referral: {
          include: {
            referred: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    
    // Serialize Decimal objects to numbers for JSON
    return commissions.map(commission => ({
      ...commission,
      amount: Number(commission.amount),
    }))
  } catch (error) {
    console.error("[GET_PENDING_COMMISSIONS]", error)
    throw error
  }
}

/**
 * Approve a commission and transfer the funds to the user's wallet
 */
export async function approveCommission(commissionId: string) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    // Get the commission details
    const commission = await prisma.referralCommission.findUnique({
      where: { id: commissionId },
      include: {
        user: true
      }
    })
    
    if (!commission) {
      return { success: false, error: "Commission not found" }
    }
    
    if (commission.status !== CommissionStatus.PENDING) {
      return { success: false, error: "Commission is not in pending status" }
    }
    
    // Get the user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: commission.userId },
    })
    
    if (!wallet) {
      return { success: false, error: "User wallet not found" }
    }
    
    // Process the commission and update the wallet
    const result = await prisma.$transaction(async (tx) => {
      // Update commission status
      const updatedCommission = await tx.referralCommission.update({
        where: { id: commissionId },
        data: {
          status: CommissionStatus.PAID,
          paidAt: new Date(),
        },
      })
      
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: Number(commission.amount),
          },
        },
      })
      
      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          amount: Number(commission.amount),
          status: "COMPLETED",
          cryptoType: "USDT",
          description: `Referral commission for ${commission.transactionType.replace(/_/g, " ").toLowerCase()}`,
        },
      })
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: commission.userId,
          type: NotificationType.COMMISSION_PAID,
          title: "Commission Approved",
          message: `Your referral commission of ${Number(commission.amount)} USDT has been approved and transferred to your wallet.`,
          read: false,
          actionUrl: "/profile/referrals"
        },
      })
      
      // Update the referral if all commissions are paid
      const pendingCommissionsCount = await tx.referralCommission.count({
        where: {
          referralId: commission.referralId,
          status: CommissionStatus.PENDING
        }
      })
      
      if (pendingCommissionsCount === 0) {
        await tx.referral.update({
          where: { id: commission.referralId },
          data: {
            commissionPaid: true
          }
        })
      }
      
      return { commission: updatedCommission, wallet: updatedWallet, transaction }
    })
    
    revalidatePath("/admin/users/comissions")
    revalidatePath("/profile/referrals")
    
    return { success: true, data: result }
  } catch (error) {
    console.error("[APPROVE_COMMISSION]", error)
    return { success: false, error: "Failed to approve commission" }
  }
}

/**
 * Reject a commission
 */
export async function rejectCommission(commissionId: string, reason: string) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    // Get the commission details
    const commission = await prisma.referralCommission.findUnique({
      where: { id: commissionId },
      include: {
        user: true
      }
    })
    
    if (!commission) {
      return { success: false, error: "Commission not found" }
    }
    
    if (commission.status !== CommissionStatus.PENDING) {
      return { success: false, error: "Commission is not in pending status" }
    }
    
    // Update the commission status
    const updatedCommission = await prisma.referralCommission.update({
      where: { id: commissionId },
      data: {
        status: CommissionStatus.REJECTED,
      },
    })
    
    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId: commission.userId,
        type: NotificationType.COMMISSION_EARNED,
        title: "Commission Rejected",
        message: `Your referral commission of ${Number(commission.amount)} USDT has been rejected. Reason: ${reason}`,
        read: false,
        actionUrl: "/profile/referrals"
      },
    })
    
    revalidatePath("/admin/users/comissions")
    
    return { success: true, data: updatedCommission }
  } catch (error) {
    console.error("[REJECT_COMMISSION]", error)
    return { success: false, error: "Failed to reject commission" }
  }
}

/**
 * Bulk approve commissions
 */
export async function bulkApproveCommissions(commissionIds: string[]) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }
    
    const results = []
    
    for (const commissionId of commissionIds) {
      const result = await approveCommission(commissionId)
      results.push({ commissionId, result })
    }
    
    return { success: true, data: results }
  } catch (error) {
    console.error("[BULK_APPROVE_COMMISSIONS]", error)
    return { success: false, error: "Failed to process bulk approval" }
  }
} 