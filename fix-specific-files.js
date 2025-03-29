const fs = require('fs');
const path = require('path');

// List of files with known syntax errors
const problematicFiles = [
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/markets/portfolio/page.tsx',
  'src/app/(dashboard)/real-estate/portfolio/page.tsx',
  'src/app/(dashboard)/real-estate/shares/[id]/page.tsx',
  'src/app/(marketing)/about/page.tsx',
  'src/app/(dashboard)/green-energy/portfolio/investments/[id]/page.tsx',
  'src/app/(dashboard)/green-energy/portfolio/page.tsx',
  'src/app/(dashboard)/profile/notification-preferences/notification-preferences-form.tsx'
];

// Function to manually fix specific files
function fixFile(filePath) {
  console.log(`Manually fixing ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all HTML entities
    content = content
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
    
    // Fix specific issues in dashboard/page.tsx
    if (filePath.includes('dashboard/page.tsx')) {
      content = content.replace(/`\${session\.user\.firstName \|\| '} \${session\.user\.lastName \|\| '}`/g, 
        "`${session.user.firstName || ''} ${session.user.lastName || ''}`");
    }
    
    // Fix specific issues in markets/portfolio/page.tsx
    if (filePath.includes('markets/portfolio/page.tsx')) {
      content = content.replace(/if \(!date\) return 'N\/A'/g, "if (!date) return 'N/A';");
      content = content.replace(/const dateObj = typeof date === 'string' \? new Date\(date\) : date/g, 
        "const dateObj = typeof date === 'string' ? new Date(date) : date;");
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully fixed ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Main function
function main() {
  for (const file of problematicFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      fixFile(fullPath);
    } else {
      console.log(`File not found: ${fullPath}`);
    }
  }
  
  console.log('Finished fixing specific files');
}

main();
