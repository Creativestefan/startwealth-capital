const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(`[${timestamp}] ${message}`);
}

log('Starting Supabase migration process...');

// Supabase connection string
const supabaseUrl = 'postgresql://postgres:gybtag-5qemwe-kujViq@db.utctjrzcisanoxackbdt.supabase.co:5432/postgres';

// Backup the current .env file if it exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  log('Backing up current .env file...');
  fs.copyFileSync(envPath, `${envPath}.backup`);
  log('✅ Backup created at .env.backup');
}

// Create or update .env file with Supabase connection
log('Updating .env with Supabase connection...');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  // Replace existing DATABASE_URL if present
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL=.*\n/g, `DATABASE_URL="${supabaseUrl}"\n`);
  } else {
    envContent += `\nDATABASE_URL="${supabaseUrl}"\n`;
  }
} else {
  envContent = `DATABASE_URL="${supabaseUrl}"\n`;
}

fs.writeFileSync(envPath, envContent);
log('✅ .env updated with Supabase connection');

// Generate Prisma client
log('Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  log('✅ Prisma client generated successfully!');
} catch (error) {
  log(`❌ Error generating Prisma client: ${error.message}`);
  process.exit(1);
}

// Push the schema to Supabase
log('Pushing schema to Supabase...');
try {
  // Using db push for initial setup - this will create the schema without migrations
  execSync('npx prisma db push', { stdio: 'inherit' });
  log('✅ Schema pushed to Supabase successfully!');
} catch (error) {
  log(`❌ Error pushing schema to Supabase: ${error.message}`);
  process.exit(1);
}

// Seed the database with initial data if needed
log('Would you like to seed the database with initial data?');
log('To seed the database, run: npx prisma db seed');

log('✅ Migration to Supabase completed successfully!');
log('Next steps:');
log('1. Add your Supabase DATABASE_URL to Vercel environment variables');
log('2. Deploy your application to Vercel');
log('3. Test your application to ensure everything is working correctly');
