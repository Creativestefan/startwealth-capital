const fs = require('fs');
const path = require('path');

// Files with syntax errors
const filesToFix = [
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/green-energy/portfolio/investments/[id]/page.tsx',
  'src/app/(dashboard)/green-energy/portfolio/page.tsx',
  'src/app/(dashboard)/markets/portfolio/page.tsx',
  'src/app/(dashboard)/profile/notification-preferences/notification-preferences-form.tsx'
];

// Function to fix HTML entities and JSX issues
function fixSyntaxIssues(filePath) {
  console.log(`Fixing syntax issues in ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace HTML entities in import statements and other places
  let fixed = content
    // Fix quotes in imports and other places
    .replace(/&quot;/g, '"')
    // Fix specific issue in dashboard/page.tsx
    .replace(/if \(session\.user\.role === "ADMIN"\) \{/g, 'if (session.user.role === "ADMIN") {')
    // Fix any other potential issues
    .replace(/= =/g, '=');
  
  fs.writeFileSync(filePath, fixed, 'utf8');
}

// Main function
function main() {
  for (const file of filesToFix) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fixSyntaxIssues(filePath);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  }
  
  console.log('Finished fixing syntax issues');
}

main();
