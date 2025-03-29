const fs = require('fs');
const path = require('path');

// Files with syntax errors
const filesToFix = [
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/green-energy/equipment/page.tsx',
  'src/app/(dashboard)/green-energy/portfolio/equipment/[id]/page.tsx',
  'src/app/(dashboard)/green-energy/portfolio/investments/[id]/page.tsx',
  'src/app/(dashboard)/green-energy/portfolio/page.tsx'
];

// Function to fix HTML entities in import statements
function fixHtmlEntities(filePath) {
  console.log(`Fixing HTML entities in ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace HTML entities in import statements with actual quotes
  let fixed = content.replace(/from &quot;([^&]+)&quot;/g, 'from "$1"');
  
  // Fix specific syntax errors in green-energy/equipment/page.tsx
  if (filePath.includes('green-energy/equipment/page.tsx')) {
    fixed = fixed.replace(/const equipment = = \[/g, 'const equipment = [');
  }
  
  // Fix specific syntax errors in portfolio/equipment/[id]/page.tsx
  if (filePath.includes('portfolio/equipment/[id]/page.tsx')) {
    fixed = fixed.replace(/forconst i = = 0;/g, 'for (let i = 0;');
  }
  
  fs.writeFileSync(filePath, fixed, 'utf8');
}

// Function to fix unescaped entities in JSX
function fixJsxEntities(filePath) {
  console.log(`Fixing JSX entities in ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace single quotes in JSX with proper JSX entities
  let fixed = content;
  
  // Find JSX content (between > and <)
  const jsxRegex = />([^<>]+)</g;
  let match;
  
  while ((match = jsxRegex.exec(content)) !== null) {
    const jsxContent = match[1];
    // Only replace if it contains a single quote
    if (jsxContent.includes("'")) {
      const fixedJsxContent = jsxContent.replace(/'/g, "{\'}");
      fixed = fixed.replace(jsxContent, fixedJsxContent);
    }
  }
  
  fs.writeFileSync(filePath, fixed, 'utf8');
}

// Main function
function main() {
  for (const file of filesToFix) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fixHtmlEntities(filePath);
      // Uncomment if needed
      // fixJsxEntities(filePath);
    }
  }
  
  console.log('Finished fixing syntax errors');
}

main();
