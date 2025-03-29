export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { 
  getReferralSettings, 
  updateReferralSettings, 
  ensureDefaultReferralSettings 
} from "@/lib/referrals/settings"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"

// Schema for validating the update request
const updateSettingsSchema = z.object({
  propertyCommissionRate: z.number().min(0).max(20).optional(),
  equipmentCommissionRate: z.number().min(0).max(20).optional(),
  marketCommissionRate: z.number().min(0).max(20).optional(),
  greenEnergyCommissionRate: z.number().min(0).max(20).optional(),
})

// Helper function to initialize the database table if needed
async function initializeDatabase() {
  try {
    // Check if the ReferralSettings table exists by running a raw query
    try {
      await prisma.$queryRaw`SELECT 1 FROM "ReferralSettings" LIMIT 1;`
    } catch (err) {
      if (err instanceof Error && err.message.includes('relation "ReferralSettings" does not exist')) {
        console.log("Creating ReferralSettings table via raw SQL");
        // Create the table manually if it doesn't exist
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "ReferralSettings" (
            "id" TEXT NOT NULL,
            "propertyCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
            "equipmentCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
            "marketCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
            "greenEnergyCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "createdBy" TEXT,
            "updatedBy" TEXT,
            CONSTRAINT "ReferralSettings_pkey" PRIMARY KEY ("id")
          );
        `;
      }
    }
    
    // Check if any settings exist and create default if not
    const settingsResult = await prisma.$queryRaw`SELECT COUNT(*) FROM "ReferralSettings";`;
    // Type assertion for the result
    const settingsArray = settingsResult as Array<{ count: string | number }>;
    const count = Number(settingsArray[0]?.count || 0);
    
    if (count === 0) {
      console.log("No settings found, creating default");
      // Insert default settings
      const now = new Date().toISOString();
      await prisma.$executeRaw`
        INSERT INTO "ReferralSettings" (
          "id", 
          "propertyCommissionRate", 
          "equipmentCommissionRate", 
          "marketCommissionRate", 
          "greenEnergyCommissionRate", 
          "createdAt", 
          "updatedAt"
        ) 
        VALUES (
          ${randomUUID()}, 
          0, 
          0, 
          0, 
          0, 
          ${now}, 
          ${now}
        );
      `;
    }
    
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
}

// GET to retrieve current referral settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Make sure the database is properly initialized
    await initializeDatabase();

    try {
      // Try to ensure default settings exist, but don't fail if there's an error
      await ensureDefaultReferralSettings();
    } catch (err) {
      console.error("Error ensuring default settings, continuing with GET:", err);
    }

    // Get current settings directly from database with raw SQL
    let settings;
    try {
      // Add explicit caching control headers to prevent caching
      const headers = new Headers();
      headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      headers.append('Pragma', 'no-cache');
      headers.append('Expires', '0');
      headers.append('Surrogate-Control', 'no-store');
      
      // Check if we need to force revalidation
      const shouldRevalidate = request.nextUrl.searchParams.get('revalidate') === 'true';
      if (shouldRevalidate) {
        // Revalidate the referral settings page
        revalidatePath('/admin/settings/referrals');
        console.log('Revalidated /admin/settings/referrals path');
      }
      
      // Always invalidate any previous queries by closing and reconnecting
      try {
        await prisma.$disconnect();
        await prisma.$connect();
      } catch (connError) {
        console.error("Error reconnecting prisma:", connError);
      }
      
      // Query the latest settings with a fresh direct query
      const result = await prisma.$queryRaw`
        SELECT 
          "id",
          "propertyCommissionRate", 
          "equipmentCommissionRate", 
          "marketCommissionRate", 
          "greenEnergyCommissionRate", 
          "createdAt", 
          "updatedAt" 
        FROM "ReferralSettings" 
        ORDER BY "updatedAt" DESC 
        LIMIT 1;
      `;
      
      // Type assertion for the result
      const settingsArray = result as Array<{
        id: string;
        propertyCommissionRate: number;
        equipmentCommissionRate: number;
        marketCommissionRate: number;
        greenEnergyCommissionRate: number;
        createdAt: Date;
        updatedAt: Date;
      }>;
      
      if (settingsArray.length > 0) {
        settings = settingsArray[0];
        
        // Log to help debug
        console.log("GET settings from database:", {
          id: settings.id,
          propertyCommissionRate: settings.propertyCommissionRate,
          equipmentCommissionRate: settings.equipmentCommissionRate,
          marketCommissionRate: settings.marketCommissionRate,
          greenEnergyCommissionRate: settings.greenEnergyCommissionRate,
          updatedAt: settings.updatedAt
        });
      } else {
        // Fallback to library function which will return defaults
        settings = await getReferralSettings();
        console.log("No settings found in database, using defaults:", settings);
      }
    } catch (err) {
      console.error("Error fetching settings with raw SQL:", err);
      // Fallback to library function which will return defaults
      settings = await getReferralSettings();
    }
    
    // Use NextResponse with cache control headers
    return new NextResponse(
      JSON.stringify({ 
        settings,
        timestamp: Date.now() // Add timestamp to show when the data was fetched
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    console.error("[API_ADMIN_REFERRAL_SETTINGS_GET]", error);
    // Return default values on error
    return NextResponse.json({ 
      settings: {
        propertyCommissionRate: 0,
        equipmentCommissionRate: 0,
        marketCommissionRate: 0,
        greenEnergyCommissionRate: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      timestamp: Date.now(),
      error: "Failed to fetch settings"
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}

// PUT to update referral settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.format() },
        { status: 400 }
      );
    }

    // Make sure the database is properly initialized
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      return NextResponse.json(
        { error: "Database initialization failed" },
        { status: 500 }
      );
    }

    try {
      // Extract validated data
      const { 
        propertyCommissionRate, 
        equipmentCommissionRate, 
        marketCommissionRate, 
        greenEnergyCommissionRate 
      } = validation.data;
      
      const now = new Date();
      
      // First check if any settings exist
      const existingSettings = await prisma.$queryRaw`
        SELECT "id" FROM "ReferralSettings" ORDER BY "updatedAt" DESC LIMIT 1;
      `;
      
      const settingsArray = existingSettings as Array<{ id: string }>;
      
      let updatedSettings;
      
      if (settingsArray.length > 0) {
        // Update the existing row instead of creating a new one
        const existingId = settingsArray[0].id;
        
        // Update the existing record - fixed query to avoid SQL syntax errors with conditional parts
        const updateQuery = `
          UPDATE "ReferralSettings"
          SET 
            "propertyCommissionRate" = ${propertyCommissionRate ?? 0},
            "equipmentCommissionRate" = ${equipmentCommissionRate ?? 0},
            "marketCommissionRate" = ${marketCommissionRate ?? 0},
            "greenEnergyCommissionRate" = ${greenEnergyCommissionRate ?? 0},
            "updatedAt" = '${now.toISOString()}'
            ${session.user?.id ? `, "updatedBy" = '${session.user.id}'` : ''}
          WHERE "id" = '${existingId}';
        `;
        
        console.log("Executing update query:", updateQuery);
        
        await prisma.$executeRawUnsafe(updateQuery);
        
        updatedSettings = {
          id: existingId,
          propertyCommissionRate: propertyCommissionRate ?? 0,
          equipmentCommissionRate: equipmentCommissionRate ?? 0,
          marketCommissionRate: marketCommissionRate ?? 0,
          greenEnergyCommissionRate: greenEnergyCommissionRate ?? 0,
          updatedAt: now,
          updatedBy: session.user?.id || null
        };
        
        console.log("Updated existing settings row with ID:", existingId);
      } else {
        // If no settings exist, create a new record
        const id = randomUUID();
        
        // Create safer insert query with optional fields
        let insertFields = `
          "id", 
          "propertyCommissionRate", 
          "equipmentCommissionRate", 
          "marketCommissionRate", 
          "greenEnergyCommissionRate", 
          "createdAt", 
          "updatedAt"
        `;
        
        let insertValues = `
          '${id}', 
          ${propertyCommissionRate ?? 0}, 
          ${equipmentCommissionRate ?? 0}, 
          ${marketCommissionRate ?? 0}, 
          ${greenEnergyCommissionRate ?? 0}, 
          '${now.toISOString()}', 
          '${now.toISOString()}'
        `;
        
        // Add optional user ID fields if available
        if (session.user?.id) {
          insertFields += `, "updatedBy", "createdBy"`;
          insertValues += `, '${session.user.id}', '${session.user.id}'`;
        }
        
        const insertQuery = `
          INSERT INTO "ReferralSettings" (
            ${insertFields}
          ) 
          VALUES (
            ${insertValues}
          );
        `;
        
        console.log("Executing insert query:", insertQuery);
        
        await prisma.$executeRawUnsafe(insertQuery);
        
        updatedSettings = {
          id,
          propertyCommissionRate: propertyCommissionRate ?? 0,
          equipmentCommissionRate: equipmentCommissionRate ?? 0,
          marketCommissionRate: marketCommissionRate ?? 0,
          greenEnergyCommissionRate: greenEnergyCommissionRate ?? 0,
          createdAt: now,
          updatedAt: now,
          updatedBy: session.user?.id || null,
          createdBy: session.user?.id || null
        };
        
        console.log("Created new settings row with ID:", id);
      }
      
      // Revalidate the referral settings page after update
      revalidatePath('/admin/settings/referrals');

      return NextResponse.json({ 
        message: "Settings updated successfully", 
        settings: updatedSettings 
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
    } catch (error) {
      // Safe error logging
      console.error("[API_ADMIN_REFERRAL_SETTINGS_PUT]", error ? error.toString() : "Unknown error");
      return NextResponse.json(
        { error: "Failed to update referral settings" },
        { status: 500 }
      );
    }
  } catch (error) {
    // Safe error logging for the outer try/catch
    console.error("[API_ADMIN_REFERRAL_SETTINGS_PUT]", error ? error.toString() : "Unknown error");
    return NextResponse.json(
      { error: "Failed to update referral settings" },
      { status: 500 }
    );
  }
} 