export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

// Validation schema for user updates
const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  password: z.string().optional(),
  image: z.string().optional(),
  adminPassword: z.string().min(1, "Admin password is required"),
  isBanned: z.boolean().optional(),
})

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
    
    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kyc: true,
        wallet: true,
        accounts: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Format user data for response
    const formattedUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      kycStatus: user.kyc?.status || "NOT_SUBMITTED",
      kycUpdatedAt: user.kyc?.submittedAt || null,
      emailVerified: user.emailVerified,
      isBanned: user.isBanned,
      wallet: user.wallet ? {
        id: user.wallet.id,
        balance: user.wallet.balance,
        createdAt: user.wallet.createdAt
      } : null,
      provider: user.accounts[0]?.provider || "credentials"
    }
    
    return NextResponse.json(formattedUser)
  } catch (error) {
    // Safely log error without using console.error directly
    try {
      console.error("[ADMIN_USER_DETAIL_API_ERROR]", error ? JSON.stringify(error) : "Unknown error");
    } catch (logError) {
      console.error("[ADMIN_USER_DETAIL_API_ERROR] Error logging failed");
    }
    
    return NextResponse.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    
    // Parse and validate request body
    const body = await req.json()
    const validationResult = updateUserSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const { adminPassword, ...updateData } = validationResult.data
    
    // Verify admin password
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })
    
    // Use bcrypt.compare to verify the admin password against the stored hash
    const isPasswordValid = await bcrypt.compare(adminPassword, admin?.password || "")
    if (!admin || !isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid admin password" },
        { status: 401 }
      )
    }
    
    // Hash password if it's included in the update
    const finalUpdateData = { ...updateData };
    if (finalUpdateData.password) {
      finalUpdateData.password = await bcrypt.hash(finalUpdateData.password, 10);
    }
    
    // Log update details for debugging
    console.log("[ADMIN_USER_UPDATE]", {
      userId,
      updatedFields: Object.keys(finalUpdateData),
      adminId: session.user.id
    })
    
    // Add detailed logging of the update data
    console.log("[ADMIN_USER_UPDATE_DATA]", JSON.stringify(finalUpdateData, null, 2))
    
    // Clean up any undefined or null values from finalUpdateData
    // This prevents Prisma validation errors with empty fields
    Object.keys(finalUpdateData).forEach(key => {
      const k = key as keyof typeof finalUpdateData;
      if (finalUpdateData[k] === undefined || finalUpdateData[k] === null) {
        delete finalUpdateData[k];
      }
    });
    
    // For email specifically, validate it's a proper email
    if (finalUpdateData.email && !finalUpdateData.email.includes('@')) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }
    
    // Update user - with a try/catch specifically for the Prisma operation
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: finalUpdateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          image: true,
          updatedAt: true,
          isBanned: true
        }
      });
      
      // Create a notification for the user
      await prisma.notification.create({
        data: {
          userId: userId,
          type: "SYSTEM_UPDATE",
          title: "Account Updated",
          message: "Your account details have been updated by an administrator.",
          read: false
        }
      });
      
      return NextResponse.json(updatedUser);
    } catch (prismaError: any) {
      // If the error is specifically about an unknown field in select
      if (prismaError?.name === "PrismaClientValidationError" && 
          prismaError.message.includes("Unknown field")) {
        
        console.log("[PRISMA_SELECT_ERROR] Falling back to minimal selection");
        
        // Fallback to minimal selection
        const updatedUserMinimal = await prisma.user.update({
          where: { id: userId },
          data: finalUpdateData,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            updatedAt: true
          }
        });
        
        // Create a notification for the user
        await prisma.notification.create({
          data: {
            userId: userId,
            type: "SYSTEM_UPDATE",
            title: "Account Updated",
            message: "Your account details have been updated by an administrator.",
            read: false
          }
        });
        
        return NextResponse.json(updatedUserMinimal);
      }
      
      // Re-throw for the outer catch to handle
      throw prismaError;
    }
  } catch (error: any) {
    // Safely log error without using console.error directly
    try {
      console.error("[ADMIN_USER_UPDATE_API_ERROR]", error ? JSON.stringify(error) : "Unknown error");
      
      // Additional detailed logging for Prisma errors
      if (error?.name === "PrismaClientValidationError") {
        console.error("[PRISMA_VALIDATION_ERROR_DETAILS]", {
          message: error.message,
          meta: error.meta || {},
          code: error.code || "unknown"
        });
      }
    } catch (logError) {
      console.error("[ADMIN_USER_UPDATE_API_ERROR] Error logging failed");
    }
    
    // Handle not found error
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Handle unique constraint violations (e.g., email already in use)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      )
    }
    
    // Handle Prisma validation errors
    if (error?.name === "PrismaClientValidationError") {
      return NextResponse.json(
        { 
          error: "Invalid data format", 
          message: "The data provided doesn't match the required format. Please check all fields and try again.",
          details: error.message 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal Server Error", message: error?.message || "Unknown error occurred" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    
    // Prevent deletion of the current admin
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true }
    })
    
    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Begin a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete PropertyTransactions
      await tx.propertyTransaction.deleteMany({
        where: { userId: userId }
      });
      
      // 2. Delete RealEstateInvestments
      await tx.realEstateInvestment.deleteMany({
        where: { userId: userId }
      });
      
      // 3. Delete EquipmentTransactions
      await tx.equipmentTransaction.deleteMany({
        where: { userId: userId }
      });
      
      // 4. Delete GreenEnergyInvestments
      await tx.greenEnergyInvestment.deleteMany({
        where: { userId: userId }
      });
      
      // 5. Delete MarketInvestments
      await tx.marketInvestment.deleteMany({
        where: { userId: userId }
      });
      
      // 6. Delete user's ReferralCommissions
      await tx.referralCommission.deleteMany({
        where: { userId: userId }
      });
      
      // 7. Delete Referrals given by the user
      await tx.referral.deleteMany({
        where: { referrerId: userId }
      });
      
      // 8. Delete Referrals received by the user
      await tx.referral.deleteMany({
        where: { referredId: userId }
      });
      
      // 9. Delete UserActivities
      await tx.userActivity.deleteMany({
        where: { userId: userId }
      });
      
      // 10. Delete Notifications
      await tx.notification.deleteMany({
        where: { userId: userId }
      });
      
      // 11. Delete NotificationPreference
      await tx.notificationPreference.deleteMany({
        where: { userId: userId }
      });
      
      // 12. Delete PushSubscription
      await tx.pushSubscription.deleteMany({
        where: { userId: userId }
      });
      
      // 13. Delete KYC
      await tx.kYC.deleteMany({
        where: { userId: userId }
      });
      
      // 14. Delete Wallet Transactions
      if (await tx.wallet.findUnique({ where: { userId: userId } })) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: userId },
          select: { id: true }
        });
        
        if (wallet) {
          await tx.walletTransaction.deleteMany({
            where: { walletId: wallet.id }
          });
        }
      }
      
      // 15. Delete Wallet
      await tx.wallet.deleteMany({
        where: { userId: userId }
      });
      
      // 16. Delete Sessions
      await tx.session.deleteMany({
        where: { userId: userId }
      });
      
      // 17. Delete Accounts
      await tx.account.deleteMany({
        where: { userId: userId }
      });
      
      // 18. Finally, delete the User
      return await tx.user.delete({
        where: { id: userId }
      });
    }, {
      timeout: 30000 // 30 second timeout for this complex transaction
    });
    
    return NextResponse.json({
      success: true,
      message: `User ${userExists.firstName} ${userExists.lastName} has been permanently deleted`,
      user: {
        id: result.id,
        email: result.email
      }
    });
  } catch (error: any) {
    // Safely log error without using console.error directly
    try {
      console.error("[ADMIN_USER_DELETE_API_ERROR]", error ? JSON.stringify(error) : "Unknown error");
    } catch (logError) {
      console.error("[ADMIN_USER_DELETE_API_ERROR] Error logging failed");
    }
    
    // Handle not found error
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal Server Error", message: error?.message || "Unknown error occurred" },
      { status: 500 }
    )
  }
} 