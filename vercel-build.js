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

// Skip migrations as they've already been applied to Supabase
log('Skipping database migrations as they have already been applied to Supabase...');

// Step 2: Build the Next.js application
log('Building Next.js application...');
try {
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
