// Script to update all referral commission rates to 0%
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Path to the SQL script
const sqlScriptPath = path.join(__dirname, 'update-commission-rates.sql');

// Create a new instance of PrismaClient
const prisma = new PrismaClient();

async function updateCommissionRates() {
  try {
    console.log("Checking if ReferralSettings table exists...");
    
    // Check if the table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "ReferralSettings" LIMIT 1;`;
      console.log("ReferralSettings table exists, proceeding...");
    } catch (err) {
      if (err instanceof Error && err.message.includes('relation "ReferralSettings" does not exist')) {
        console.log("ReferralSettings table doesn't exist, creating it...");
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
        console.log("ReferralSettings table created.");
      } else {
        throw err;
      }
    }
    
    // Insert a new record with all commission rates set to 0%
    const now = new Date();
    const id = crypto.randomUUID();
    
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
        0, 
        0, 
        0, 
        0, 
        ${now}, 
        ${now},
        'script'
      );
    `;
    
    // Update all existing settings to 0%
    await prisma.$executeRaw`
      UPDATE "ReferralSettings"
      SET 
        "propertyCommissionRate" = 0,
        "equipmentCommissionRate" = 0,
        "marketCommissionRate" = 0,
        "greenEnergyCommissionRate" = 0,
        "updatedAt" = ${now},
        "updatedBy" = 'script'
      WHERE "id" != ${id};
    `;
    
    console.log(`Successfully inserted new settings record with ID: ${id}`);
    console.log("All commission rates have been set to 0%");
    
    // Verify the new settings
    const settings = await prisma.$queryRaw`
      SELECT * FROM "ReferralSettings" 
      ORDER BY "createdAt" DESC 
      LIMIT 5;
    `;
    
    console.log("Most recent settings:", settings);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating commission rates:", error);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateCommissionRates()
  .then(result => {
    if (result.success) {
      console.log("Script completed successfully.");
      process.exit(0);
    } else {
      console.error("Script failed:", result.error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error("Unexpected error:", err);
    process.exit(1);
  }); 