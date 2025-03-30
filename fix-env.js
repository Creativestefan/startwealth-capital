#!/usr/bin/env node

/**
 * This script fixes environment variable issues in Vercel deployments
 * by creating a simplified .env file without comments or quotes
 * that won't cause parsing errors.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting environment variable fix script...');

// Define the simplified environment variables
const envVars = {
  // NextAuth
  NEXTAUTH_SECRET: 'AyNMFch6Afx+tMnnv0Zn6wXfR+ksJAV4lIGB+eU6IsM=',
  NEXTAUTH_URL: 'https://startwealth-capital.vercel.app',
  
  // Database
  DATABASE_URL: 'postgresql://postgres.utctjrzcisanoxackbdt:AXdBBB1Y8umPhZzj@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  
  // Cloudflare R2
  CLOUDFLARE_R2_ACCESS_KEY_ID: '5183d8de58e27bfbcafd7969497188ab',
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: '9ea81a9df4937a897a3bb0dac2c8d1ba35f161a69e2f551a42050df7b2ca2a0a',
  CLOUDFLARE_R2_ENDPOINT: '3c3049b93386c9d1425392ee596bc359.r2.cloudflarestorage.com',
  CLOUDFLARE_R2_BUCKET_NAME: 'startwealth',
  CLOUDFLARE_PUBLIC_DOMAIN: 'startwealth.3c3049b93386c9d1425392ee596bc359.r2.cloudflarestorage.com',
};

// Create the .env file content without quotes or comments
let envContent = '';
for (const [key, value] of Object.entries(envVars)) {
  envContent += `${key}=${value}\n`;
}

// Write to .env.production file
const envProductionPath = path.join(process.cwd(), '.env.production');
fs.writeFileSync(envProductionPath, envContent, 'utf8');
console.log(`Created simplified .env.production file at ${envProductionPath}`);

// Create a package.json script to run this before deployment
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add the fix-env script if it doesn't exist
  if (!packageJson.scripts['fix-env']) {
    packageJson.scripts['fix-env'] = 'node fix-env.js';
    console.log('Added fix-env script to package.json');
  }
  
  // Update the build:vercel script to run fix-env first
  if (packageJson.scripts['build:vercel'] && !packageJson.scripts['build:vercel'].includes('fix-env')) {
    packageJson.scripts['build:vercel'] = 'node fix-env.js && node vercel-build.js';
    console.log('Updated build:vercel script to run fix-env first');
  }
  
  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('Updated package.json with new scripts');
}

console.log('Environment variable fix script completed successfully!');
