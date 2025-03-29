const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to fix HTML entities in a file
function fixHtmlEntities(filePath) {
  console.log(`Fixing HTML entities in ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all HTML entities with their actual characters
  let fixed = content
    .replace(/&quot;/g, '"')     // Replace &quot; with "
    .replace(/&apos;/g, "'")     // Replace &apos; with '
    .replace(/&amp;/g, '&')       // Replace &amp; with &
    .replace(/&lt;/g, '<')        // Replace &lt; with <
    .replace(/&gt;/g, '>')        // Replace &gt; with >
    .replace(/&nbsp;/g, ' ');     // Replace &nbsp; with space
  
  fs.writeFileSync(filePath, fixed, 'utf8');
}

// Main function
function main() {
  try {
    // Find all TypeScript and TSX files in the project
    const files = execSync('find src -type f -name "*.tsx" -o -name "*.ts"', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    console.log(`Found ${files.length} TypeScript/TSX files to process`);
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        fixHtmlEntities(filePath);
      }
    }
    
    console.log('Finished fixing HTML entities in all files');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
