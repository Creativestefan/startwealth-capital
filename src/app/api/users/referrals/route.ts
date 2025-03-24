import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { CommissionStatus } from "@prisma/client"
import { ensureDefaultReferralSettings } from "@/lib/referrals/settings"

export async function GET() {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure default referral settings exist
    await ensureDefaultReferralSettings()

    // Get user referral code, creating one if it doesn't exist
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true }
    })

    // If user has no referral code, generate one
    if (!user?.referralCode) {
      // Generate a unique referral code (first 3 chars of firstName + first 3 chars of lastName + random 4 digits)
      const firstName = session.user.firstName || "user"
      const lastName = session.user.lastName || "name"
      const firstPart = firstName.substring(0, 3).toUpperCase()
      const secondPart = lastName.substring(0, 3).toUpperCase()
      const randomPart = Math.floor(1000 + Math.random() * 9000).toString()
      const referralCode = `${firstPart}${secondPart}${randomPart}`

      // Update user with the new referral code
      await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode }
      })

      user = { referralCode }
    }

    // Get users referred by this user
    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      include: {
        referred: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Format referrals for the frontend
    const formattedReferrals = referrals.map(referral => ({
      id: referral.id,
      firstName: referral.referred.firstName,
      lastName: referral.referred.lastName,
      email: referral.referred.email,
      status: referral.status,
      commission: referral.commission,
      commissionPaid: referral.commissionPaid,
      createdAt: referral.createdAt
    }))

    // Get commission data
    const commissions = await prisma.referralCommission.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    // Calculate total earned and pending commissions
    const totalEarned = commissions
      .filter(c => c.status === CommissionStatus.PAID)
      .reduce((sum, c) => sum + Number(c.amount), 0)

    const totalPending = commissions
      .filter(c => c.status === CommissionStatus.PENDING)
      .reduce((sum, c) => sum + Number(c.amount), 0)

    return NextResponse.json({
      referralCode: user.referralCode,
      referrals: formattedReferrals,
      commissions,
      totalEarned,
      totalPending
    })
  } catch (error) {
    console.error("[API_REFERRALS]", error)
    return NextResponse.json(
      { error: "Failed to fetch referral data" },
      { status: 500 }
    )
  }
} 