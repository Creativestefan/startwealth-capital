import { prisma } from "@/lib/prisma"
import { CommissionStatus, ReferralStatus, ReferralTransactionType, NotificationType } from "@prisma/client"

/**
 * Calculate and process referral commission when a user makes an investment
 */
export async function processReferralCommission({
  userId,
  amount,
  investmentId,
  investmentType,
}: {
  userId: string
  amount: number
  investmentId: string
  investmentType: ReferralTransactionType
}) {
  try {
    // Check if the user was referred by someone
    const referral = await prisma.referral.findFirst({
      where: { 
        referredId: userId,
        status: ReferralStatus.COMPLETED
      },
      include: {
        referrer: true
      }
    })

    // If no active referral found, no commission to process
    if (!referral) return null

    // Get the commission rate for this investment type
    const referralSettings = await prisma.referralSettings.findFirst({
      orderBy: {
        createdAt: "desc"  // Get the most recent settings
      }
    })

    // Default to 0 if no settings found
    if (!referralSettings) return null

    // Calculate commission amount based on investment type
    let commissionRate = 0
    switch (investmentType) {
      case ReferralTransactionType.REAL_ESTATE_INVESTMENT:
        commissionRate = Number(referralSettings.propertyCommissionRate)
        break
      case ReferralTransactionType.EQUIPMENT_PURCHASE:
        commissionRate = Number(referralSettings.equipmentCommissionRate)
        break
      case ReferralTransactionType.MARKET_INVESTMENT:
        commissionRate = Number(referralSettings.marketCommissionRate)
        break
      case ReferralTransactionType.GREEN_ENERGY_INVESTMENT:
        commissionRate = Number(referralSettings.greenEnergyCommissionRate)
        break
      case ReferralTransactionType.PROPERTY_PURCHASE:
        commissionRate = Number(referralSettings.propertyCommissionRate)
        break
      default:
        commissionRate = 0
    }

    // Calculate commission amount
    const commissionAmount = (amount * commissionRate) / 100

    // Only proceed if there's a commission to pay
    if (commissionAmount <= 0) return null

    // Create the commission record
    const commissionData: any = {
      referralId: referral.id,
      userId: referral.referrerId,
      amount: commissionAmount,
      status: CommissionStatus.PENDING,
      transactionType: investmentType,
    }

    // Add the specific investment type ID to the commission record
    switch (investmentType) {
      case ReferralTransactionType.REAL_ESTATE_INVESTMENT:
        commissionData.realEstateInvestmentId = investmentId
        break
      case ReferralTransactionType.EQUIPMENT_PURCHASE:
        commissionData.equipmentTransactionId = investmentId
        break
      case ReferralTransactionType.MARKET_INVESTMENT:
        commissionData.marketInvestmentId = investmentId
        break
      case ReferralTransactionType.GREEN_ENERGY_INVESTMENT:
        commissionData.greenEnergyInvestmentId = investmentId
        break
      case ReferralTransactionType.PROPERTY_PURCHASE:
        commissionData.propertyTransactionId = investmentId
        break
    }

    // Create the commission record
    const commission = await prisma.referralCommission.create({
      data: commissionData
    })

    // Create a notification for the referrer
    await prisma.notification.create({
      data: {
        userId: referral.referrerId,
        type: NotificationType.COMMISSION_EARNED,
        title: "New Referral Commission",
        message: `You've earned a ${commissionRate}% commission of $${commissionAmount.toFixed(2)} from your referral's investment.`,
        read: false,
        actionUrl: "/profile/referrals"
      }
    })

    return commission
  } catch (error) {
    console.error("Error processing referral commission:", error)
    return null
  }
} 