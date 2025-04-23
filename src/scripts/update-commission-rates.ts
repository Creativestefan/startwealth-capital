// Script to update all referral commission rates to 0%
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

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
    const now = new Date().toISOString();
    const id = randomUUID();
    
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
    
    console.log(`Successfully inserted new settings record with ID: ${id}`);
    console.log("All commission rates have been set to 0%");
    
    // Verify the new settings
    const settings = await prisma.$queryRaw`
      SELECT * FROM "ReferralSettings" 
      WHERE id = ${id}
    `;
    
    console.log("New settings:", settings);
    
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

export { updateCommissionRates }; 