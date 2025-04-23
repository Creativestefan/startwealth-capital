const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to fix unescaped entities
function fixUnescapedEntities(content) {
  // Replace single quotes
  let fixed = content.replace(/([^\\])'/g, "$1&apos;");
  // Replace double quotes
  fixed = fixed.replace(/([^\\])"/g, "$1&quot;");
  return fixed;
}

// Function to remove unused imports
function removeUnusedImports(filePath) {
  try {
    console.log(`Fixing unused imports in ${filePath}`);
    execSync(`npx eslint --fix ${filePath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error fixing imports in ${filePath}:`, error.message);
  }
}

// Function to process a file
async function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Fix unescaped entities
    if (content.includes("'") || content.includes('"')) {
      console.log(`Fixing unescaped entities in ${filePath}`);
      const fixedContent = fixUnescapedEntities(content);
      fs.writeFileSync(filePath, fixedContent, 'utf8');
    }
    
    // Remove unused imports
    removeUnusedImports(filePath);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Main function to process all files
async function main() {
  // Get list of files from the error log
  const errorLog = fs.readFileSync('eslint-errors.log', 'utf8');
  const fileMatches = errorLog.match(/\.\/[^\s]+\.tsx?/g);
  
  if (!fileMatches) {
    console.error('No files found in error log');
    return;
  }
  
  // Remove duplicates
  const uniqueFiles = [...new Set(fileMatches)];
  
  console.log(`Found ${uniqueFiles.length} files to process`);
  
  // Process each file
  for (const relativeFilePath of uniqueFiles) {
    const filePath = path.join(process.cwd(), relativeFilePath.replace(/^\.\//, ''));
    await processFile(filePath);
  }
  
  console.log('Finished processing files');
}

// Run the main function
main().catch(console.error);
