const fs = require('fs');
const path = require('path');

// Files with unescaped entities
const filesWithUnescapedEntities = [
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/green-energy/portfolio/investments/[id]/page.tsx',
  'src/app/(dashboard)/green-energy/portfolio/page.tsx',
  'src/app/(dashboard)/markets/portfolio/page.tsx',
  'src/app/(dashboard)/profile/notification-preferences/notification-preferences-form.tsx',
  'src/app/(dashboard)/real-estate/portfolio/page.tsx',
  'src/app/(dashboard)/real-estate/shares/[id]/page.tsx',
  'src/app/(marketing)/about/page.tsx',
  'src/app/(marketing)/green-energy-investments/page.tsx',
  'src/app/(marketing)/privacy/page.tsx',
  'src/app/(marketing)/terms/page.tsx',
];

// Function to fix unescaped entities
function fixUnescapedEntities(filePath) {
  console.log(`Fixing unescaped entities in ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace single quotes with &apos;
  let fixed = content.replace(/([>\s])'/g, '$1&apos;');
  
  // Replace double quotes with &quot;
  fixed = fixed.replace(/([>\s])"([^<]*?)"([<\s])/g, '$1&quot;$2&quot;$3');
  
  fs.writeFileSync(filePath, fixed, 'utf8');
}

// Function to remove unused imports
function removeUnusedImports(filePath) {
  console.log(`Removing unused imports in ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Get all import statements
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"][^'"]+['"];?/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      fullImport: match[0],
      importedItems: match[1].split(',').map(item => item.trim())
    });
  }
  
  // Create a new content with filtered imports
  let newContent = content;
  
  for (const importObj of imports) {
    // Check if any imported item is used in the file (excluding comments)
    const filteredItems = importObj.importedItems.filter(item => {
      // Skip if the item is already marked as unused with a comment
      if (item.includes('// eslint-disable-line') || item.includes('/* eslint-disable */')) {
        return true;
      }
      
      // Extract the actual import name (handling aliases)
      const importName = item.split(' as ').pop().trim();
      
      // Check if it's used in the file outside of import statements
      const usageRegex = new RegExp(`[^a-zA-Z0-9_]${importName}[^a-zA-Z0-9_]`, 'g');
      const importSectionEnd = content.indexOf('function') > -1 ? content.indexOf('function') : content.length;
      const nonImportContent = content.substring(importSectionEnd);
      
      return usageRegex.test(nonImportContent);
    });
    
    // If all items are unused, remove the entire import
    if (filteredItems.length === 0) {
      newContent = newContent.replace(importObj.fullImport, '');
    }
    // If some items are unused, update the import statement
    else if (filteredItems.length < importObj.importedItems.length) {
      const newImportItems = filteredItems.join(', ');
      const newImport = importObj.fullImport.replace(/\{([^}]+)\}/, `{ ${newImportItems} }`);
      newContent = newContent.replace(importObj.fullImport, newImport);
    }
  }
  
  fs.writeFileSync(filePath, newContent, 'utf8');
}

// Function to fix prefer-const warnings
function fixPreferConst(filePath) {
  console.log(`Fixing prefer-const in ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace 'let' with 'const' for variables that are never reassigned
  const letRegex = /let\s+([a-zA-Z0-9_]+)\s*=/g;
  let newContent = content;
  let match;
  
  while ((match = letRegex.exec(content)) !== null) {
    const varName = match[1];
    const restOfContent = content.substring(match.index + match[0].length);
    
    // Check if the variable is reassigned
    const reassignRegex = new RegExp(`${varName}\s*=`, 'g');
    if (!reassignRegex.test(restOfContent)) {
      // Replace only this occurrence of 'let' with 'const'
      newContent = newContent.substring(0, match.index) + 
                   'const ' + varName + ' =' + 
                   newContent.substring(match.index + match[0].length);
    }
  }
  
  fs.writeFileSync(filePath, newContent, 'utf8');
}

// Main function
function main() {
  // Fix unescaped entities
  for (const file of filesWithUnescapedEntities) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fixUnescapedEntities(filePath);
    }
  }
  
  // Fix other issues in specific files
  const filesToFix = [
    // Files with unused imports
    'src/app/(dashboard)/dashboard/notifications/page.tsx',
    'src/app/(dashboard)/dashboard/page.tsx',
    'src/app/(dashboard)/green-energy/equipment/[id]/page.tsx',
    'src/app/(dashboard)/green-energy/equipment/page.tsx',
    'src/app/(dashboard)/green-energy/portfolio/equipment/[id]/page.tsx',
    'src/app/(dashboard)/green-energy/portfolio/page.tsx',
    'src/app/(dashboard)/wallet/page.tsx',
    // Files with prefer-const warnings
    'src/app/(dashboard)/green-energy/equipment/page.tsx',
    'src/app/api/admin/dashboard/stats/route.ts',
  ];
  
  for (const file of filesToFix) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      // Fix unused imports
      removeUnusedImports(filePath);
      
      // Fix prefer-const warnings
      fixPreferConst(filePath);
    }
  }
  
  console.log('Finished fixing ESLint errors');
}

main();
