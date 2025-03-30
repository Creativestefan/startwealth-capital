const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(`[${timestamp}] ${message}`);
}

log('Starting Vercel build process...');

// Step 1: Generate Prisma client
log('Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });
log('✅ Prisma client generated successfully!');

// Step 2: Setup database for deployment
log('Setting up database for deployment...');

// Check if we're using Supabase or local PostgreSQL
const isSupabaseUrlSet = !!process.env.DATABASE_URL && 
  (process.env.DATABASE_URL.includes('supabase') || process.env.DATABASE_URL.includes('utctjrzcisanoxackbdt'));
const isLocalPostgresUrlSet = !!process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost');

// Log database connection information (without exposing full credentials)
if (process.env.DATABASE_URL) {
  const dbUrlStart = process.env.DATABASE_URL.substring(0, 15);
  const dbUrlEnd = process.env.DATABASE_URL.substring(process.env.DATABASE_URL.length - 15);
  log(`Database URL detected: ${dbUrlStart}...${dbUrlEnd}`);
  log(`Is Supabase URL: ${isSupabaseUrlSet}, Is Local URL: ${isLocalPostgresUrlSet}`);

  // Check if DATABASE_URL starts with the correct protocol
  if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
    log('WARNING: DATABASE_URL does not start with postgresql:// or postgres://');
    // Try to fix it by prepending the protocol
    if (process.env.DATABASE_URL.includes('@') && process.env.DATABASE_URL.includes(':')) {
      log('Attempting to fix DATABASE_URL by adding protocol...');
      process.env.DATABASE_URL = `postgresql://${process.env.DATABASE_URL}`;
      log(`Fixed DATABASE_URL: ${process.env.DATABASE_URL.substring(0, 15)}...`);
    }
  }
} else {
  log('No DATABASE_URL detected, setting Supabase connection string with connection pooling...');
  // Set the Supabase connection string directly with connection pooling
  process.env.DATABASE_URL = "postgresql://postgres.utctjrzcisanoxackbdt:AXdBBB1Y8umPhZzj@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
  log('Supabase connection string with connection pooling set successfully');
}

// Step 3: Ensure Cloudflare R2 environment variables are set
log('Checking Cloudflare R2 environment variables...');
const requiredR2Vars = [
  'CLOUDFLARE_R2_ACCESS_KEY_ID',
  'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
  'CLOUDFLARE_R2_ENDPOINT',
  'CLOUDFLARE_R2_BUCKET_NAME',
  'CLOUDFLARE_PUBLIC_DOMAIN'
];

requiredR2Vars.forEach(varName => {
  if (!process.env[varName]) {
    log(`WARNING: ${varName} is not set in environment variables`);
  } else {
    log(`✅ ${varName} is set`);
  }
});

// Step 4: Run database migrations
log('Running database migrations...');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  log('✅ Database migrations completed successfully!');
} catch (error) {
  log(`⚠️ Error running migrations: ${error.message}`);
  log('Continuing with build process despite migration error...');
}

// Step 5: Build the Next.js application
log('Building Next.js application...');
try {
  // First, try cleaning the .next directory
  try {
    log('Cleaning previous build artifacts...');
    if (fs.existsSync(path.join(process.cwd(), '.next'))) {
      execSync('rm -rf .next', { stdio: 'inherit' });
    }
    log('✅ Previous build artifacts cleaned successfully!');
  } catch (cleanError) {
    log(`⚠️ Warning: Could not clean previous build artifacts: ${cleanError.message}`);
    // Continue anyway
  }

  // Set NODE_OPTIONS to increase memory limit
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
  log('Set NODE_OPTIONS to increase memory limit to 4GB');

  // Run the Next.js build
  execSync('next build', { stdio: 'inherit' });
  log('✅ Next.js application built successfully!');
} catch (buildError) {
  log(`❌ ERROR: Failed to build Next.js application: ${buildError.message}`);
  process.exit(1); // Exit with error code
}

log('✅ Vercel build process completed successfully!');
