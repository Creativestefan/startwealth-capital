-- Script to update all referral commission rates to 0%

-- Check if the table exists and create it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ReferralSettings') THEN
        CREATE TABLE IF NOT EXISTS "ReferralSettings" (
            "id" TEXT NOT NULL,
            "propertyCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
            "equipmentCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
            "marketCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
            "greenEnergyCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "createdBy" TEXT,
            "updatedBy" TEXT,
            CONSTRAINT "ReferralSettings_pkey" PRIMARY KEY ("id")
        );
        RAISE NOTICE 'ReferralSettings table created';
    ELSE
        RAISE NOTICE 'ReferralSettings table already exists';
    END IF;
END
$$;

-- Insert a new record with all commission rates set to 0%
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
    gen_random_uuid(), 
    0, 
    0, 
    0, 
    0, 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP,
    'sql-script'
);

-- Update existing settings to 0% if any exist
UPDATE "ReferralSettings"
SET 
    "propertyCommissionRate" = 0,
    "equipmentCommissionRate" = 0,
    "marketCommissionRate" = 0,
    "greenEnergyCommissionRate" = 0,
    "updatedAt" = CURRENT_TIMESTAMP,
    "updatedBy" = 'sql-script';

-- Verify the settings
SELECT * FROM "ReferralSettings"; 