const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const colors = require('colors/safe');

// Helper function to log with timestamp
function log(message, colorFn = colors.white) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(colorFn(`[${timestamp}] ${message}`));
}

log('Starting Vercel build process...', colors.green);

// Step 1: Generate Prisma client
log('Generating Prisma client...', colors.cyan);
execSync('npx prisma generate', { stdio: 'inherit' });
log('✅ Prisma client generated successfully!', colors.green);

// Step 2: Setup SQLite database for deployment
log('Setting up SQLite database for deployment...', colors.cyan);

// Check if we're using SQLite (for Vercel deployment) or PostgreSQL (for production with Supabase)
const isDatabaseUrlSet = !!process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase');

if (!isDatabaseUrlSet) {
  log('No Supabase DATABASE_URL detected, using SQLite for deployment', colors.yellow);
  
  // Create a temporary .env file with SQLite configuration if it doesn't exist
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath) || !fs.readFileSync(envPath, 'utf8').includes('DATABASE_URL')) {
    log('Creating temporary .env with SQLite configuration...', colors.cyan);
    fs.appendFileSync(envPath, '\nDATABASE_URL="file:./dev.db"\n');
    log('✅ Temporary .env created with SQLite configuration', colors.green);
  }
  
  // Create a temporary schema.prisma file with SQLite provider
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Replace PostgreSQL provider with SQLite
  schemaContent = schemaContent.replace(
    'provider = "postgresql"',
    'provider = "sqlite"'
  );
  
  // Create a backup of the original schema
  fs.writeFileSync(`${schemaPath}.backup`, fs.readFileSync(schemaPath));
  
  // Write the modified schema
  fs.writeFileSync(schemaPath, schemaContent);
  log('✅ Modified schema.prisma to use SQLite provider', colors.green);
  
  // Run Prisma migrations
  log('Running Prisma migrations for SQLite...', colors.cyan);
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
} else {
  log('Using Supabase PostgreSQL database', colors.green);
  // Skip migrations for now when using Supabase to avoid connection issues during build
  log('Skipping database migrations during build for Supabase deployment', colors.yellow);
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

// Restore schema.prisma if we modified it
if (!isDatabaseUrlSet) {
  const schemaBackupPath = path.join(process.cwd(), 'prisma', 'schema.prisma.backup');
  if (fs.existsSync(schemaBackupPath)) {
    fs.copyFileSync(schemaBackupPath, path.join(process.cwd(), 'prisma', 'schema.prisma'));
    fs.unlinkSync(schemaBackupPath);
  }
}

log('✅ Original configuration files restored successfully!', colors.green);
log('Build process completed successfully! 🎉', colors.green);
