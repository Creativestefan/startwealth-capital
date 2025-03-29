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
    log('Starting data migration to Supabase...');

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

    // Get list of models from schema
    log('Analyzing Prisma schema to identify models...');
    const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const modelRegex = /model\s+(\w+)\s+\{/g;
    const models = [];
    let match;

    while ((match = modelRegex.exec(schemaContent)) !== null) {
      models.push(match[1]);
    }

    log(`Found ${models.length} models in the schema`);

    // Export data from local database
    log('Exporting data from local database...');
    
    // Create export script
    const exportScriptPath = path.join(process.cwd(), 'prisma/temp-export.js');
    let exportScriptContent = `
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  try {
`;

    // Add export code for each model
    for (const model of models) {
      exportScriptContent += `
    // Export ${model}
    try {
      const ${model.toLowerCase()}Data = await prisma.${model.charAt(0).toLowerCase() + model.slice(1)}.findMany();
      fs.writeFileSync(
        path.join(__dirname, 'data-export/${model}.json'),
        JSON.stringify(${model.toLowerCase()}Data, null, 2)
      );
      console.log('✅ Exported ${model}: ' + ${model.toLowerCase()}Data.length + ' records');
    } catch (err) {
      console.error('Error exporting ${model}:', err.message);
    }
`;
    }

    exportScriptContent += `
    console.log('Export completed successfully!');
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
`;

    fs.writeFileSync(exportScriptPath, exportScriptContent);

    // Update .env to use local database
    fs.copyFileSync(sourceEnvPath, envPath);
    
    // Generate Prisma client for local database
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Run export script
    execSync('node prisma/temp-export.js', { stdio: 'inherit' });

    // Switch to Supabase connection
    log('\nSwitching to Supabase connection for import...');
    fs.copyFileSync(targetEnvPath, envPath);
    
    // Generate Prisma client for Supabase
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Create import script
    const importScriptPath = path.join(process.cwd(), 'prisma/temp-import.js');
    let importScriptContent = `
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importData() {
  try {
`;

    // Add import code for each model
    for (const model of models) {
      importScriptContent += `
    // Import ${model}
    try {
      if (fs.existsSync(path.join(__dirname, 'data-export/${model}.json'))) {
        const ${model.toLowerCase()}Data = JSON.parse(
          fs.readFileSync(path.join(__dirname, 'data-export/${model}.json'), 'utf8')
        );
        
        if (${model.toLowerCase()}Data.length > 0) {
          // Clear existing data first (optional, comment out if you want to keep existing data)
          // await prisma.${model.charAt(0).toLowerCase() + model.slice(1)}.deleteMany({});
          
          // Import records one by one to handle any potential errors
          let importedCount = 0;
          for (const record of ${model.toLowerCase()}Data) {
            try {
              // Remove id field to let Supabase generate new IDs
              const { id, ...dataWithoutId } = record;
              
              await prisma.${model.charAt(0).toLowerCase() + model.slice(1)}.create({
                data: dataWithoutId
              });
              importedCount++;
            } catch (recordError) {
              console.error('Error importing a ${model} record:', recordError.message);
            }
          }
          console.log('✅ Imported ${model}: ' + importedCount + '/' + ${model.toLowerCase()}Data.length + ' records');
        } else {
          console.log('⚠️ No data to import for ${model}');
        }
      } else {
        console.log('⚠️ No export file found for ${model}');
      }
    } catch (err) {
      console.error('Error importing ${model}:', err.message);
    }
`;
    }

    importScriptContent += `
    console.log('Import completed!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
`;

    fs.writeFileSync(importScriptPath, importScriptContent);

    // Ask user if they want to proceed with import
    const confirmImport = await prompt('\nReady to import data to Supabase. This may overwrite existing data. Continue? (y/n): ');
    
    if (confirmImport.toLowerCase() === 'y') {
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
