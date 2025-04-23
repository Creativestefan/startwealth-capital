export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { KycStatus } from "@prisma/client"

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
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Fetch transactions (assuming there's a Transaction model)
    // Note: Update the field names and relationships to match your actual database schema
    const transactions = await prisma.walletTransaction.findMany({
      where: { 
        wallet: {
          userId: userId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true
      }
    })
    
    // Fetch commissions (assuming there's a Commission or ReferralCommission model)
    // Note: Update the field names and relationships to match your actual database schema
    const commissions = await prisma.referralCommission.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        referralId: true,
        transactionType: true
      }
    })
    
    // Fetch KYC and document submissions
    const documents = await prisma.kYC.findMany({
      where: { userId: userId },
      orderBy: { submittedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        status: true,
        submittedAt: true,
        documentType: true
      }
    })
    
    // Format documents to include a name field
    const formattedDocuments = documents.map((doc) => ({
      id: doc.id,
      status: doc.status,
      createdAt: doc.submittedAt,
      documentType: doc.documentType,
      name: doc.documentType === "PASSPORT" 
        ? "Passport" 
        : doc.documentType === "ID_CARD" 
          ? "ID Card" 
          : doc.documentType === "DRIVERS_LICENSE"
            ? "Driver's License"
            : "KYC Document",
      type: "KYC"
    }))
    
    return NextResponse.json({
      transactions,
      commissions,
      documents: formattedDocuments
    })
  } catch (error) {
    console.error("[ADMIN_USER_ACTIVITY_API_ERROR]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 