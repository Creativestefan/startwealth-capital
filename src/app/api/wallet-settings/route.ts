import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

// GET - Fetch wallet settings (public endpoint accessible to all authenticated users)
export async function GET() {
  try {
    const session = await getServerSession(authConfig)

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use raw SQL query to fetch wallet settings
    try {
      // Check if the table exists first
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'WalletSettings'
        );
      `;
      
      // If the table doesn't exist, return default settings
      if (!tableExists || !(tableExists as any)[0]?.exists) {
        return NextResponse.json({
          btcWalletAddress: '',
          usdtWalletAddress: '',
          usdtWalletType: 'BEP-20'
        });
      }
      
      // Try to get settings from the table
      const settings = await prisma.$queryRaw`
        SELECT "btcWalletAddress", "usdtWalletAddress", "usdtWalletType"
        FROM "WalletSettings" 
        WHERE "isActive" = true
        LIMIT 1;
      `;
      
      // If no settings found, return default
      if (!Array.isArray(settings) || settings.length === 0) {
        return NextResponse.json({
          btcWalletAddress: '',
          usdtWalletAddress: '',
          usdtWalletType: 'BEP-20'
        });
      }
      
      // Return only the wallet addresses (no admin data)
      return NextResponse.json({
        btcWalletAddress: settings[0].btcWalletAddress || '',
        usdtWalletAddress: settings[0].usdtWalletAddress || '',
        usdtWalletType: settings[0].usdtWalletType || 'BEP-20'
      });
    } catch (sqlError) {
      console.error("SQL query error:", sqlError);
      // Return default settings if any SQL error occurs
      return NextResponse.json({
        btcWalletAddress: '',
        usdtWalletAddress: '',
        usdtWalletType: 'BEP-20'
      });
    }
  } catch (error) {
    console.error("[WALLET_SETTINGS_GET_ERROR]", error)
    // Return default settings on any error
    return NextResponse.json({
      btcWalletAddress: '',
      usdtWalletAddress: '',
      usdtWalletType: 'BEP-20'
    });
  }
} 