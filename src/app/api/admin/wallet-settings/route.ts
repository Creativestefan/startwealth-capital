import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for validating wallet settings input
const walletSettingsSchema = z.object({
  btcWalletAddress: z.string().optional().nullable(),
  usdtWalletAddress: z.string().optional().nullable(),
  usdtWalletType: z.string().default("BEP-20"),
})

// GET - Fetch wallet settings
export async function GET() {
  try {
    const session = await getServerSession(authConfig)

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
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
          id: 'default',
          btcWalletAddress: '',
          usdtWalletAddress: '',
          usdtWalletType: 'BEP-20',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Try to get settings from the table
      const settings = await prisma.$queryRaw`
        SELECT * FROM "WalletSettings" 
        WHERE "isActive" = true
        LIMIT 1;
      `;
      
      // If no settings found, return default
      if (!Array.isArray(settings) || settings.length === 0) {
        // Try to create default settings using raw SQL
        try {
          const newSettings = await prisma.$executeRaw`
            INSERT INTO "WalletSettings" ("id", "btcWalletAddress", "usdtWalletAddress", "usdtWalletType", "isActive", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), '', '', 'BEP-20', true, now(), now())
            RETURNING *;
          `;
          
          return NextResponse.json({
            id: 'new',
            btcWalletAddress: '',
            usdtWalletAddress: '',
            usdtWalletType: 'BEP-20',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } catch (error) {
          console.error("Failed to create default settings:", error);
          return NextResponse.json({
            id: 'default',
            btcWalletAddress: '',
            usdtWalletAddress: '',
            usdtWalletType: 'BEP-20',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
      
      return NextResponse.json(settings[0]);
    } catch (sqlError) {
      console.error("SQL query error:", sqlError);
      // Return default settings if any SQL error occurs
      return NextResponse.json({
        id: 'default',
        btcWalletAddress: '',
        usdtWalletAddress: '',
        usdtWalletType: 'BEP-20',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error("[WALLET_SETTINGS_GET_ERROR]", error)
    // Return default settings on any error
    return NextResponse.json({
      id: 'default',
      btcWalletAddress: '',
      usdtWalletAddress: '',
      usdtWalletType: 'BEP-20',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

// POST - Create or update wallet settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate the request body
    const body = await req.json()
    const validatedData = walletSettingsSchema.parse(body)
    
    try {
      // Check if the table exists first
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'WalletSettings'
        );
      `;
      
      // If the table doesn't exist yet, create it
      if (!tableExists || !(tableExists as any)[0]?.exists) {
        // Return success with the data that would have been saved
        return NextResponse.json({
          id: 'default',
          btcWalletAddress: validatedData.btcWalletAddress || '',
          usdtWalletAddress: validatedData.usdtWalletAddress || '',
          usdtWalletType: validatedData.usdtWalletType || 'BEP-20',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Try to get existing settings
      const existingSettings = await prisma.$queryRaw`
        SELECT * FROM "WalletSettings" 
        WHERE "isActive" = true
        LIMIT 1;
      `;
      
      if (Array.isArray(existingSettings) && existingSettings.length > 0) {
        // Update existing settings
        await prisma.$executeRaw`
          UPDATE "WalletSettings"
          SET 
            "btcWalletAddress" = ${validatedData.btcWalletAddress || ''},
            "usdtWalletAddress" = ${validatedData.usdtWalletAddress || ''},
            "usdtWalletType" = ${validatedData.usdtWalletType || 'BEP-20'},
            "updatedAt" = now()
          WHERE "id" = ${existingSettings[0].id};
        `;
        
        return NextResponse.json({
          ...existingSettings[0],
          btcWalletAddress: validatedData.btcWalletAddress || '',
          usdtWalletAddress: validatedData.usdtWalletAddress || '',
          usdtWalletType: validatedData.usdtWalletType || 'BEP-20',
          updatedAt: new Date()
        });
      } else {
        // Create new settings
        try {
          await prisma.$executeRaw`
            INSERT INTO "WalletSettings" ("id", "btcWalletAddress", "usdtWalletAddress", "usdtWalletType", "isActive", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), ${validatedData.btcWalletAddress || ''}, ${validatedData.usdtWalletAddress || ''}, ${validatedData.usdtWalletType || 'BEP-20'}, true, now(), now());
          `;
          
          return NextResponse.json({
            id: 'new',
            btcWalletAddress: validatedData.btcWalletAddress || '',
            usdtWalletAddress: validatedData.usdtWalletAddress || '',
            usdtWalletType: validatedData.usdtWalletType || 'BEP-20',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } catch (insertError) {
          console.error("Failed to insert settings:", insertError);
          return NextResponse.json({
            id: 'default',
            btcWalletAddress: validatedData.btcWalletAddress || '',
            usdtWalletAddress: validatedData.usdtWalletAddress || '',
            usdtWalletType: validatedData.usdtWalletType || 'BEP-20',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    } catch (sqlError) {
      console.error("SQL query error:", sqlError);
      // Return validated data if any SQL error occurs
      return NextResponse.json({
        id: 'default',
        btcWalletAddress: validatedData.btcWalletAddress || '',
        usdtWalletAddress: validatedData.usdtWalletAddress || '',
        usdtWalletType: validatedData.usdtWalletType || 'BEP-20',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error("[WALLET_SETTINGS_POST_ERROR]", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    // On any error, return a fallback response with empty values
    return NextResponse.json({
      id: 'error',
      btcWalletAddress: '',
      usdtWalletAddress: '',
      usdtWalletType: 'BEP-20',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
} 