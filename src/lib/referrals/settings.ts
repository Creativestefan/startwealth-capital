import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { randomUUID } from "crypto"

// Default commission rates
const DEFAULT_COMMISSION_RATES = {
  propertyCommissionRate: 0,    // 0% commission on property purchases
  equipmentCommissionRate: 0,   // 0% commission on equipment purchases
  marketCommissionRate: 0,      // 0% commission on market investments
  greenEnergyCommissionRate: 0, // 0% commission on green energy investments
}

/**
 * Check if the ReferralSettings model exists in the Prisma client
 * This helps prevent errors when trying to access a model that doesn't exist yet
 */
function hasReferralSettingsModel(): boolean {
  return Boolean(prisma.referralSettings)
}

/**
 * Check if the ReferralSettings table exists in the database
 * This helps prevent errors when the model exists in schema but the table hasn't been created yet
 */
async function doesReferralSettingsTableExist(): Promise<boolean> {
  try {
    // First check if the model exists in Prisma client
    if (!hasReferralSettingsModel()) {
      console.log("ReferralSettings model does not exist in Prisma client")
      return false
    }
    
    // Try a simple query to see if the table exists
    await prisma.$queryRaw`SELECT 1 FROM "ReferralSettings" LIMIT 1;`
    return true
  } catch (error) {
    // If error contains "relation does not exist", table doesn't exist
    if (error instanceof Error && error.message.includes('relation "ReferralSettings" does not exist')) {
      return false
    }
    
    // For other errors, rethrow
    throw error
  }
}

/**
 * Create default referral settings directly using SQL
 */
async function createDefaultSettingsWithRawSQL(): Promise<any> {
  try {
    const now = new Date().toISOString();
    
    // Insert default settings using raw SQL
    const result = await prisma.$executeRaw`
      INSERT INTO "ReferralSettings" (
        id, 
        "propertyCommissionRate", 
        "equipmentCommissionRate", 
        "marketCommissionRate", 
        "greenEnergyCommissionRate", 
        "createdAt", 
        "updatedAt"
      ) 
      VALUES (
        ${randomUUID()}, 
        ${DEFAULT_COMMISSION_RATES.propertyCommissionRate}, 
        ${DEFAULT_COMMISSION_RATES.equipmentCommissionRate}, 
        ${DEFAULT_COMMISSION_RATES.marketCommissionRate}, 
        ${DEFAULT_COMMISSION_RATES.greenEnergyCommissionRate}, 
        ${now}, 
        ${now}
      )
      ON CONFLICT DO NOTHING;
    `;
    
    return {
      ...DEFAULT_COMMISSION_RATES,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error("Error creating default settings with raw SQL:", error);
    return null;
  }
}

/**
 * Get settings from the database using raw SQL
 */
async function getSettingsWithRawSQL(): Promise<any> {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        "propertyCommissionRate", 
        "equipmentCommissionRate", 
        "marketCommissionRate", 
        "greenEnergyCommissionRate", 
        "createdAt", 
        "updatedAt" 
      FROM "ReferralSettings" 
      ORDER BY "createdAt" DESC 
      LIMIT 1;
    `;
    
    // Check if we have a result
    if (Array.isArray(result) && result.length > 0) {
      return result[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error getting settings with raw SQL:", error);
    return null;
  }
}

/**
 * Get the current referral settings safely 
 */
export async function getReferralSettings() {
  try {
    // First check if the table exists
    const tableExists = await doesReferralSettingsTableExist();
    
    if (!tableExists) {
      console.log("ReferralSettings table doesn't exist yet, returning default values");
      return {
        ...DEFAULT_COMMISSION_RATES,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    // Try to get settings with raw SQL first
    const sqlSettings = await getSettingsWithRawSQL();
    if (sqlSettings) {
      return sqlSettings;
    }
    
    // If model exists in Prisma, try to use it
    if (hasReferralSettingsModel()) {
      try {
        const settings = await prisma.referralSettings.findFirst({
          orderBy: {
            createdAt: "desc",
          },
        });
        
        if (settings) {
          return settings;
        }
      } catch (error) {
        console.error("Error using Prisma model:", error);
      }
    }
    
    // Return default values if all else fails
    return {
      ...DEFAULT_COMMISSION_RATES,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error("Error in getReferralSettings:", error);
    
    // Return default values on error
    return {
      ...DEFAULT_COMMISSION_RATES,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

/**
 * Create default referral settings if none exist
 */
export async function ensureDefaultReferralSettings() {
  try {
    // First check if the table exists
    const tableExists = await doesReferralSettingsTableExist();
    
    if (!tableExists) {
      console.log("ReferralSettings table doesn't exist yet, can't create default settings");
      return {
        ...DEFAULT_COMMISSION_RATES,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    // Try to get settings with raw SQL first
    const sqlSettings = await getSettingsWithRawSQL();
    if (sqlSettings) {
      return sqlSettings;
    }
    
    // If no settings found, create default ones using raw SQL
    const defaultSettings = await createDefaultSettingsWithRawSQL();
    if (defaultSettings) {
      return defaultSettings;
    }
    
    // If model exists in Prisma, try to use it
    if (hasReferralSettingsModel()) {
      try {
        // Check if any settings exist
        const existingSettings = await prisma.referralSettings.findFirst({
          orderBy: {
            createdAt: "desc",
          },
        });
        
        if (!existingSettings) {
          console.log("Creating default referral settings with Prisma");
          return await prisma.referralSettings.create({
            data: DEFAULT_COMMISSION_RATES,
          });
        }
        
        return existingSettings;
      } catch (error) {
        console.error("Error using Prisma model:", error);
      }
    }
    
    // Return default values if all else fails
    return {
      ...DEFAULT_COMMISSION_RATES,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error("Error in ensureDefaultReferralSettings:", error);
    
    // Return default values on error
    return {
      ...DEFAULT_COMMISSION_RATES,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

/**
 * Update referral settings
 */
export async function updateReferralSettings({
  propertyCommissionRate,
  equipmentCommissionRate,
  marketCommissionRate,
  greenEnergyCommissionRate,
  adminId,
}: {
  propertyCommissionRate?: number
  equipmentCommissionRate?: number
  marketCommissionRate?: number
  greenEnergyCommissionRate?: number
  adminId: string
}) {
  try {
    // First check if the table exists
    const tableExists = await doesReferralSettingsTableExist();
    
    if (!tableExists) {
      console.log("ReferralSettings table doesn't exist yet, creating it...");
      
      try {
        // Create the table if it doesn't exist
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
      } catch (tableCreateError) {
        console.error("Failed to create ReferralSettings table:", tableCreateError);
        return {
          ...DEFAULT_COMMISSION_RATES,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    }
    
    // Get current settings
    const currentSettings = await getReferralSettings();
    
    // Calculate new values
    const newPropertyRate = propertyCommissionRate !== undefined ? propertyCommissionRate : currentSettings.propertyCommissionRate;
    const newEquipmentRate = equipmentCommissionRate !== undefined ? equipmentCommissionRate : currentSettings.equipmentCommissionRate;
    const newMarketRate = marketCommissionRate !== undefined ? marketCommissionRate : currentSettings.marketCommissionRate;
    const newGreenEnergyRate = greenEnergyCommissionRate !== undefined ? greenEnergyCommissionRate : currentSettings.greenEnergyCommissionRate;
    
    // Generate a new UUID for the settings record
    const id = randomUUID();
    const now = new Date();
    const nowISOString = now.toISOString();
    
    // Try to use raw SQL to insert
    try {
      await prisma.$executeRaw`
        INSERT INTO "ReferralSettings" (
          "id", 
          "propertyCommissionRate", 
          "equipmentCommissionRate", 
          "marketCommissionRate", 
          "greenEnergyCommissionRate", 
          "createdAt", 
          "updatedAt",
          "updatedBy"
        ) 
        VALUES (
          ${id}, 
          ${newPropertyRate}, 
          ${newEquipmentRate}, 
          ${newMarketRate}, 
          ${newGreenEnergyRate}, 
          ${nowISOString}, 
          ${nowISOString},
          ${adminId}
        );
      `;
      
      return {
        id,
        propertyCommissionRate: newPropertyRate,
        equipmentCommissionRate: newEquipmentRate,
        marketCommissionRate: newMarketRate,
        greenEnergyCommissionRate: newGreenEnergyRate,
        createdAt: now,
        updatedAt: now,
        updatedBy: adminId
      };
    } catch (sqlError) {
      // Safe error logging
      console.error("Error updating settings with raw SQL:", sqlError ? sqlError.toString() : "Unknown SQL error");
      
      // Try alternative SQL approach with explicit types
      try {
        await prisma.$executeRaw`
          INSERT INTO "ReferralSettings" (
            "id", 
            "propertyCommissionRate", 
            "equipmentCommissionRate", 
            "marketCommissionRate", 
            "greenEnergyCommissionRate", 
            "createdAt", 
            "updatedAt",
            "updatedBy"
          ) 
          VALUES (
            ${id}::TEXT, 
            ${newPropertyRate}::DECIMAL(5,2), 
            ${newEquipmentRate}::DECIMAL(5,2), 
            ${newMarketRate}::DECIMAL(5,2), 
            ${newGreenEnergyRate}::DECIMAL(5,2), 
            ${nowISOString}::TIMESTAMP, 
            ${nowISOString}::TIMESTAMP,
            ${adminId}::TEXT
          );
        `;
        
        return {
          id,
          propertyCommissionRate: newPropertyRate,
          equipmentCommissionRate: newEquipmentRate,
          marketCommissionRate: newMarketRate,
          greenEnergyCommissionRate: newGreenEnergyRate,
          createdAt: now,
          updatedAt: now,
          updatedBy: adminId
        };
      } catch (alternativeSqlError) {
        // Safe error logging
        console.error("Alternative SQL approach also failed:", alternativeSqlError ? alternativeSqlError.toString() : "Unknown alternative SQL error");
      }
    }
    
    // If model exists in Prisma, try to use it as fallback
    if (hasReferralSettingsModel()) {
      try {
        // Create new settings record (we keep history of all settings)
        const newSettings = await prisma.referralSettings.create({
          data: {
            id,
            propertyCommissionRate: newPropertyRate,
            equipmentCommissionRate: newEquipmentRate,
            marketCommissionRate: newMarketRate,
            greenEnergyCommissionRate: newGreenEnergyRate,
            updatedAt: now,
            updatedBy: adminId,
          },
        });

        return newSettings;
      } catch (prismaError) {
        // Safe error logging
        console.error("Error using Prisma model for update:", prismaError ? prismaError.toString() : "Unknown Prisma error");
        
        // Try one more approach - direct query for Prisma-managed tables
        try {
          await prisma.$queryRaw`
            INSERT INTO "ReferralSettings" (
              "id", 
              "propertyCommissionRate", 
              "equipmentCommissionRate", 
              "marketCommissionRate", 
              "greenEnergyCommissionRate", 
              "createdAt", 
              "updatedAt",
              "updatedBy"
            ) 
            VALUES (
              ${id}, 
              ${newPropertyRate}, 
              ${newEquipmentRate}, 
              ${newMarketRate}, 
              ${newGreenEnergyRate}, 
              CURRENT_TIMESTAMP, 
              CURRENT_TIMESTAMP,
              ${adminId}
            );
          `;
          
          return {
            id,
            propertyCommissionRate: newPropertyRate,
            equipmentCommissionRate: newEquipmentRate,
            marketCommissionRate: newMarketRate,
            greenEnergyCommissionRate: newGreenEnergyRate,
            createdAt: now,
            updatedAt: now,
            updatedBy: adminId
          };
        } catch (finalError) {
          // Safe error logging
          console.error("All database approaches failed:", finalError ? finalError.toString() : "Unknown final error");
          throw new Error("Failed to update referral settings");
        }
      }
    }
    
    throw new Error("No viable method to update settings");
  } catch (error) {
    // Safe error logging for the outer try/catch
    console.error("Error in updateReferralSettings:", error ? error.toString() : "Unknown error");
    throw error;
  }
} 