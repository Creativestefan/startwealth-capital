const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(`[${timestamp}] ${message}`);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main function to run the migration
async function migrateData() {
  try {
    log('Starting data migration to Supabase (preserving IDs)...');

    // Get local database connection string
    let localDbUrl = process.env.LOCAL_DATABASE_URL;
    if (!localDbUrl) {
      localDbUrl = await prompt('Enter your local database connection string: ');
    }

    // Get Supabase connection string
    let supabaseUrl = process.env.SUPABASE_DATABASE_URL;
    if (!supabaseUrl) {
      supabaseUrl = await prompt('Enter your Supabase connection string: ');
    }

    // Backup current .env file
    const envPath = path.join(process.cwd(), '.env');
    const envBackupPath = path.join(process.cwd(), '.env.backup');
    if (fs.existsSync(envPath)) {
      log('Backing up current .env file...');
      fs.copyFileSync(envPath, envBackupPath);
      log('✅ Backup created at .env.backup');
    }

    // Create temporary .env files for source and target connections
    const sourceEnvPath = path.join(process.cwd(), '.env.source');
    const targetEnvPath = path.join(process.cwd(), '.env.target');

    log('Creating temporary connection files...');
    fs.writeFileSync(sourceEnvPath, `DATABASE_URL="${localDbUrl}"\n`);
    fs.writeFileSync(targetEnvPath, `DATABASE_URL="${supabaseUrl}"\n`);

    // Create data export directory
    const exportDir = path.join(process.cwd(), 'prisma/data-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Define model import order based on dependencies
    const modelOrder = [
      'User',           // Base model
      'Wallet',         // Depends on User
      'KYC',            // Depends on User
      'Account',        // Depends on User
      'Session',        // Depends on User
      'NotificationPreference', // Depends on User
      'PushSubscription', // Depends on User
      'Property',       // Independent model
      'Equipment',      // Independent model
      'ReferralSettings', // Independent model
      'WalletSettings', // Independent model
      'InvestmentPlan', // Independent model
      'GreenEnergyPlan', // Independent model
      'MarketInvestmentPlan', // Independent model
      'WalletTransaction', // Depends on Wallet
      'PropertyTransaction', // Depends on Property and User
      'EquipmentTransaction', // Depends on Equipment and User
      'RealEstateInvestment', // Depends on User
      'GreenEnergyInvestment', // Depends on User
      'MarketInvestment', // Depends on User and MarketInvestmentPlan
      'Referral',       // Depends on User
      'ReferralCommission', // Depends on Referral and User
      'Notification',   // Depends on User
      'UserActivity',   // Depends on User
    ];

    // Export data from local database
    log('Exporting data from local database...');
    
    // Update .env to use local database
    fs.copyFileSync(sourceEnvPath, envPath);
    
    // Generate Prisma client for local database
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Create export script
    const exportScriptPath = path.join(process.cwd(), 'prisma/temp-export.js');
    let exportScript = `
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  try {
    // Export in order
    const models = ${JSON.stringify(modelOrder)};
    
    for (const model of models) {
      try {
        const modelName = model.charAt(0).toLowerCase() + model.slice(1);
        const data = await prisma[modelName].findMany();
        
        fs.writeFileSync(
          path.join(__dirname, 'data-export/' + model + '.json'),
          JSON.stringify(data, null, 2)
        );
        
        console.log('✅ Exported ' + model + ': ' + data.length + ' records');
      } catch (err) {
        console.error('Error exporting ' + model + ':', err.message);
      }
    }

    console.log('Export completed successfully!');
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
`;

    fs.writeFileSync(exportScriptPath, exportScript);

    // Run export script
    execSync('node prisma/temp-export.js', { stdio: 'inherit' });

    // Switch to Supabase connection
    log('\nSwitching to Supabase connection for import...');
    fs.copyFileSync(targetEnvPath, envPath);
    
    // Generate Prisma client for Supabase
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Create import script
    const importScriptPath = path.join(process.cwd(), 'prisma/temp-import.js');
    let importScript = `
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importData() {
  try {
    // First clear all existing data if requested
    const shouldClearData = process.env.CLEAR_EXISTING_DATA === 'true';
    if (shouldClearData) {
      console.log('Clearing existing data from Supabase...');
      // Delete in reverse dependency order
      const deleteOrder = ${JSON.stringify(modelOrder.slice().reverse())};
      
      for (const model of deleteOrder) {
        try {
          const modelName = model.charAt(0).toLowerCase() + model.slice(1);
          await prisma[modelName].deleteMany({});
          console.log('✅ Cleared all ' + model + ' records');
        } catch (err) {
          console.error('Error clearing ' + model + ':', err.message);
        }
      }
    }

    // Import in dependency order
    const importOrder = ${JSON.stringify(modelOrder)};
    
    for (const model of importOrder) {
      try {
        if (fs.existsSync(path.join(__dirname, 'data-export/' + model + '.json'))) {
          const data = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'data-export/' + model + '.json'), 'utf8')
          );
          
          if (data.length > 0) {
            const modelName = model.charAt(0).toLowerCase() + model.slice(1);
            let importedCount = 0;
            
            for (const record of data) {
              try {
                // Preserve the original ID
                await prisma[modelName].upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                importedCount++;
              } catch (recordError) {
                console.error('Error importing a ' + model + ' record:', recordError.message);
              }
            }
            console.log('✅ Imported ' + model + ': ' + importedCount + '/' + data.length + ' records');
          } else {
            console.log('⚠️ No data to import for ' + model);
          }
        } else {
          console.log('⚠️ No export file found for ' + model);
        }
      } catch (err) {
        console.error('Error importing ' + model + ':', err.message);
      }
    }

    console.log('Import completed!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
`;

    fs.writeFileSync(importScriptPath, importScript);

    // Ask user if they want to proceed with import
    const confirmImport = await prompt('\nReady to import data to Supabase. This may overwrite existing data. Continue? (y/n): ');
    
    if (confirmImport.toLowerCase() === 'y') {
      // Ask if they want to clear existing data
      const clearData = await prompt('Do you want to clear all existing data in Supabase before importing? (y/n): ');
      process.env.CLEAR_EXISTING_DATA = clearData.toLowerCase() === 'y' ? 'true' : 'false';
      
      // Run import script
      log('Importing data to Supabase...');
      execSync('node prisma/temp-import.js', { stdio: 'inherit' });
      log('\n✅ Data migration completed successfully!');
    } else {
      log('\n⚠️ Import canceled by user.');
    }

    // Clean up temporary files
    log('Cleaning up temporary files...');
    fs.unlinkSync(sourceEnvPath);
    fs.unlinkSync(targetEnvPath);
    fs.unlinkSync(exportScriptPath);
    fs.unlinkSync(importScriptPath);

    // Restore original .env file
    if (fs.existsSync(envBackupPath)) {
      fs.copyFileSync(envBackupPath, envPath);
      log('✅ Original .env file restored');
    }

    log('\n✅ Migration process completed!');
    log('Next steps:');
    log('1. Verify your data in Supabase');
    log('2. Update your Vercel environment variables with the Supabase connection string');
    log('3. Deploy your application');

  } catch (error) {
    log(`\n❌ Error during migration: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the migration
migrateData();
