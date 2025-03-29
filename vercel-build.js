const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Main build function
async function build() {
  try {
    // Step 1: Generate Prisma client
    log('Generating Prisma client...', colors.cyan);
    execSync('npx prisma generate', { stdio: 'inherit' });
    log('✅ Prisma client generated successfully!', colors.green);

    // Step 2: Run Prisma migrations (only in production)
    if (process.env.NODE_ENV === 'production') {
      log('Running Prisma migrations...', colors.cyan);
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        log('✅ Prisma migrations applied successfully!', colors.green);
      } catch (error) {
        // Log the error but continue with the build
        log(`⚠️ Warning: Prisma migrations failed: ${error.message}`, colors.yellow);
        log('Continuing with the build process...', colors.yellow);
      }
    }
    
    // Step 3: Run the Next.js build with environment variables set
    log('Building Next.js application...', colors.cyan);
    execSync('next build', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_DISABLE_ESLINT: 'true',
        NEXT_DISABLE_TYPECHECK: 'true'
      }
    });
    
    log('✅ Build completed successfully!', colors.green);
  } catch (error) {
    log(`❌ Build failed: ${error.message}`, colors.yellow);
    process.exit(1);
  }
}

// Run the build
build();
