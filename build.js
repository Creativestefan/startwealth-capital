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

    // Step 2: Set environment variables to bypass checks
    log('Setting up environment for build...', colors.cyan);
    process.env.NEXT_DISABLE_ESLINT = 'true';
    process.env.NEXT_DISABLE_TYPECHECK = 'true';
    
    // Step 3: Run the Next.js build
    log('Building Next.js application...', colors.cyan);
    execSync('next build', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_DISABLE_ESLINT: 'true',
        NEXT_DISABLE_TYPECHECK: 'true',
        NODE_ENV: 'production'
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
