const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Routes that need to be marked as dynamic
const routesToFix = [
  // Admin routes
  'src/app/admin',
  // Property investment routes
  'src/app/(dashboard)/property-investments',
  // Wallet routes
  'src/app/(dashboard)/wallet',
  // Other routes mentioned in error messages
  'src/app/(dashboard)/markets/shares',
  'src/app/(dashboard)/green-energy',
  'src/app/(dashboard)/real-estate',
  // API routes
  'src/app/api',
];

// Function to add dynamic export to a file
function addDynamicExport(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, colors.yellow);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if the file already has a dynamic export
  if (content.includes("export const dynamic = 'force-dynamic'")) {
    log(`File already has dynamic export: ${filePath}`, colors.blue);
    return false;
  }

  // Add the dynamic export at the top of the file
  content = `export const dynamic = 'force-dynamic';
${content}`;

  fs.writeFileSync(filePath, content, 'utf8');
  log(`Added dynamic export to: ${filePath}`, colors.green);
  return true;
}

// Function to recursively process all page.tsx files in a directory
function processDirectory(directory) {
  if (!fs.existsSync(directory)) {
    log(`Directory not found: ${directory}`, colors.yellow);
    return 0;
  }

  const items = fs.readdirSync(directory, { withFileTypes: true });
  let modifiedFiles = 0;

  for (const item of items) {
    const itemPath = path.join(directory, item.name);

    if (item.isDirectory()) {
      // Recursively process subdirectories
      modifiedFiles += processDirectory(itemPath);
    } else if (item.name === 'page.tsx' || item.name === 'route.ts' || item.name === 'route.js' || item.name === 'route.tsx') {
      // Process page.tsx and route.ts/js/tsx files
      if (addDynamicExport(itemPath)) {
        modifiedFiles++;
      }
    }
  }

  return modifiedFiles;
}

// Main function
function main() {
  log('Starting to fix dynamic routes...', colors.cyan);
  let totalModifiedFiles = 0;

  for (const route of routesToFix) {
    log(`Processing route: ${route}`, colors.cyan);
    totalModifiedFiles += processDirectory(route) || 0;
  }

  log(`Completed! Modified ${totalModifiedFiles} files.`, colors.green);
}

// Run the main function
main();
