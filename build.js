const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting custom build process...');

// Generate Prisma client
console.log('📊 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Error generating Prisma client:', error);
  process.exit(1);
}

// Run Next.js build with environment variables to disable checks
console.log('🏗️ Building Next.js application with checks disabled...');
try {
  // Set environment variables to disable TypeScript and ESLint checks
  const env = {
    ...process.env,
    NEXT_DISABLE_ESLINT: 'true',
    NEXT_DISABLE_TYPECHECK: 'true',
    NODE_ENV: 'production'
  };
  
  execSync('next build', { 
    stdio: 'inherit',
    env: env
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
