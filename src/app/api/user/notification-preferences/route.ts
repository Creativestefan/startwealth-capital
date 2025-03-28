import { z } from "zod";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

// Schema for notification preferences update
const notificationPreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  investmentNotifications: z.boolean().optional(),
  paymentNotifications: z.boolean().optional(),
  kycNotifications: z.boolean().optional(),
  referralNotifications: z.boolean().optional(),
  walletNotifications: z.boolean().optional(),
  systemNotifications: z.boolean().optional(),
  commissionNotifications: z.boolean().optional(),
  securityNotifications: z.boolean().optional(),
});

// Ensure the NotificationPreference table exists
async function ensureTableExists() {
  try {
    // Check if table exists
    await prisma.$queryRaw`SELECT 1 FROM "NotificationPreference" LIMIT 1`;
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('relation "NotificationPreference" does not exist')) {
      // Create table if it doesn't exist
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "NotificationPreference" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL UNIQUE,
            "emailEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
            "pushEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
            "investmentNotifications" BOOLEAN NOT NULL DEFAULT TRUE,
            "paymentNotifications" BOOLEAN NOT NULL DEFAULT TRUE,
            "kycNotifications" BOOLEAN NOT NULL DEFAULT TRUE,
            "referralNotifications" BOOLEAN NOT NULL DEFAULT TRUE,
            "walletNotifications" BOOLEAN NOT NULL DEFAULT TRUE,
            "systemNotifications" BOOLEAN NOT NULL DEFAULT TRUE,
            "commissionNotifications" BOOLEAN NOT NULL DEFAULT TRUE,
            "securityNotifications" BOOLEAN NOT NULL DEFAULT TRUE,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
          );
          
          CREATE INDEX IF NOT EXISTS "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");
        `;
        console.log("Created NotificationPreference table");
        return true;
      } catch (createError) {
        console.error("Error creating NotificationPreference table:", createError);
        return false;
      }
    }
    return false;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Ensure the table exists
    await ensureTableExists();
    
    // Try to fetch preferences with direct SQL
    const result = await prisma.$queryRaw`
      SELECT * FROM "NotificationPreference" WHERE "userId" = ${userId}
    `;
    
    // Type assertion for the result
    const preferencesArray = result as any[];
    
    // If no preferences exist, create default preferences
    if (preferencesArray.length === 0) {
      try {
        // Create default preferences
        const uuid = uuidv4();
        const newPrefs = await prisma.$queryRaw`
          INSERT INTO "NotificationPreference" (
            "id", "userId", "emailEnabled", "pushEnabled", 
            "investmentNotifications", "paymentNotifications", 
            "kycNotifications", "referralNotifications", 
            "walletNotifications", "systemNotifications", 
            "commissionNotifications", "securityNotifications",
            "createdAt", "updatedAt"
          ) 
          VALUES (
            ${uuid}, ${userId}, TRUE, TRUE, 
            TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE,
            NOW(), NOW()
          )
          RETURNING *
        `;
        
        return NextResponse.json((newPrefs as any[])[0]);
      } catch (error) {
        console.error("Error creating notification preferences:", error);
        return NextResponse.json(
          { error: "Failed to create notification preferences" },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(preferencesArray[0]);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    
    // Validate request data
    const validatedData = notificationPreferencesSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    // Ensure the table exists
    await ensureTableExists();
    
    // Check if preferences exist
    const existingResult = await prisma.$queryRaw`
      SELECT * FROM "NotificationPreference" WHERE "userId" = ${userId}
    `;
    
    // Type assertion for the result
    const existingPrefs = existingResult as any[];
    
    const updateFields = Object.entries(validatedData.data)
      .map(([key, value]) => `"${key}" = ${value === true ? 'TRUE' : 'FALSE'}`)
      .join(', ');
    
    if (existingPrefs.length === 0) {
      // Create new preferences
      const defaultValues = {
        emailEnabled: true,
        pushEnabled: true,
        investmentNotifications: true,
        paymentNotifications: true,
        kycNotifications: true,
        referralNotifications: true,
        walletNotifications: true,
        systemNotifications: true,
        commissionNotifications: true,
        securityNotifications: true,
        ...validatedData.data
      };
      
      // Generate a UUID
      const uuid = uuidv4();
      
      // Use raw query with individual fields for safety
      await prisma.$executeRaw`
        INSERT INTO "NotificationPreference" (
          "id", "userId", 
          "emailEnabled", "pushEnabled", 
          "investmentNotifications", "paymentNotifications", 
          "kycNotifications", "referralNotifications", 
          "walletNotifications", "systemNotifications", 
          "commissionNotifications", "securityNotifications", 
          "createdAt", "updatedAt"
        ) 
        VALUES (
          ${uuid}, ${userId}, 
          ${!!defaultValues.emailEnabled}, ${!!defaultValues.pushEnabled}, 
          ${!!defaultValues.investmentNotifications}, ${!!defaultValues.paymentNotifications}, 
          ${!!defaultValues.kycNotifications}, ${!!defaultValues.referralNotifications}, 
          ${!!defaultValues.walletNotifications}, ${!!defaultValues.systemNotifications}, 
          ${!!defaultValues.commissionNotifications}, ${!!defaultValues.securityNotifications}, 
          NOW(), NOW()
        )
      `;
      
      // Fetch the newly created preferences
      const fetchResult = await prisma.$queryRaw`
        SELECT * FROM "NotificationPreference" WHERE "userId" = ${userId}
      `;
      
      return NextResponse.json((fetchResult as any[])[0]);
    } else {
      // Update existing preferences
      if (updateFields) {
        // For each field, create a separate update
        for (const [key, value] of Object.entries(validatedData.data)) {
          await prisma.$executeRaw`
            UPDATE "NotificationPreference" 
            SET "${Prisma.raw(key)}" = ${value === true}, "updatedAt" = NOW() 
            WHERE "userId" = ${userId}
          `;
        }
        
        // Fetch the updated preferences
        const updatedResult = await prisma.$queryRaw`
          SELECT * FROM "NotificationPreference" WHERE "userId" = ${userId}
        `;
        
        return NextResponse.json((updatedResult as any[])[0]);
      }
      
      return NextResponse.json(existingPrefs[0]);
    }
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
