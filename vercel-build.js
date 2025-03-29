const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Simple colored console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Helper function to log with timestamp
function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

log('Starting Vercel build process...', colors.green);

// Step 1: Generate Prisma client
log('Generating Prisma client...', colors.cyan);
execSync('npx prisma generate', { stdio: 'inherit' });
log('✅ Prisma client generated successfully!', colors.green);

// Step 2: Setup database for deployment
log('Setting up database for deployment...', colors.cyan);

// Check if we're using Supabase or local PostgreSQL
const isSupabaseUrlSet = !!process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase');
const isLocalPostgresUrlSet = !!process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost');

// If no database URL is set, use the local PostgreSQL connection
if (!process.env.DATABASE_URL) {
  log('No DATABASE_URL detected, using local PostgreSQL for deployment', colors.yellow);
  
  // Create a temporary .env file with PostgreSQL configuration if it doesn't exist
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath) || !fs.readFileSync(envPath, 'utf8').includes('DATABASE_URL')) {
    log('Creating temporary .env with local PostgreSQL configuration...', colors.cyan);
    fs.appendFileSync(envPath, '\nDATABASE_URL="postgresql://startwealth:password123@localhost:5432/startwealth?schema=public"\n');
    log('✅ Temporary .env created with local PostgreSQL configuration', colors.green);
  }
}

// Run database migrations if using local PostgreSQL
if (isLocalPostgresUrlSet) {
  log('Using local PostgreSQL database', colors.green);
  log('Running Prisma migrations...', colors.cyan);
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    log('✅ Prisma migrations applied successfully!', colors.green);
  } catch (error) {
    log(`⚠️ Warning: Prisma migrations failed: ${error.message}`, colors.yellow);
    log('Attempting to create database schema from scratch...', colors.yellow);
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      log('✅ Database schema created successfully!', colors.green);
    } catch (pushError) {
      log(`❌ Error creating database schema: ${pushError.message}`, colors.red);
      log('Continuing with the build process...', colors.yellow);
    }
  }
} else if (isSupabaseUrlSet) {
  log('Using Supabase PostgreSQL database', colors.green);
  // Skip migrations for now when using Supabase to avoid connection issues during build
  log('Skipping database migrations during build for Supabase deployment', colors.yellow);
} else {
  log('No valid database connection detected, build may fail', colors.red);
}

// Step 3: Create a temporary next.config.js without 'output: export'
log('Creating temporary Next.js configuration...', colors.cyan);
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
const originalConfig = fs.readFileSync(nextConfigPath, 'utf8');

// Create a backup of the original config
fs.writeFileSync(`${nextConfigPath}.backup`, originalConfig);

// Create a modified config without 'output: export'
const modifiedConfig = originalConfig.replace(/output: ['"]export['"],?\n?/g, '');
fs.writeFileSync(nextConfigPath, modifiedConfig);
log('✅ Temporary Next.js configuration created successfully!', colors.green);

// Step 4: Run the Next.js build
log('Running Next.js build...', colors.cyan);
execSync('next build', { stdio: 'inherit' });
log('✅ Next.js build completed successfully!', colors.green);

// Step 5: Restore original files
log('Restoring original configuration files...', colors.cyan);

// Restore next.config.js
fs.writeFileSync(nextConfigPath, originalConfig);
log('✅ Original configuration files restored successfully!', colors.green);
log('Build process completed successfully! 🎉', colors.green);
