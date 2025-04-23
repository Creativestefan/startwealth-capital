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

// Function to fix client component files
function fixClientComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, colors.yellow);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if the file has both "use client" and dynamic export
  if (content.includes('"use client"') && content.includes("export const dynamic = 'force-dynamic'")) {
    // Remove the dynamic export
    content = content.replace("export const dynamic = 'force-dynamic';\n", '');
    
    // Add the dynamic export after the "use client" directive
    content = content.replace('"use client"', '"use client"\n\nexport const dynamic = \'force-dynamic\'');
    
    fs.writeFileSync(filePath, content, 'utf8');
    log(`Fixed client component: ${filePath}`, colors.green);
    return true;
  }

  return false;
}

// Function to recursively process all files in a directory
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
    } else if (item.name.endsWith('.tsx') || item.name.endsWith('.jsx')) {
      // Process TSX and JSX files
      if (fixClientComponent(itemPath)) {
        modifiedFiles++;
      }
    }
  }

  return modifiedFiles;
}

// Main function
function main() {
  log('Starting to fix client components...', colors.cyan);
  let totalModifiedFiles = 0;

  // Process the entire app directory
  totalModifiedFiles += processDirectory('src/app');

  log(`Completed! Modified ${totalModifiedFiles} files.`, colors.green);
}

// Run the main function
main();
