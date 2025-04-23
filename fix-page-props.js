const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to fix the PageProps interface issue
function fixPagePropsIssue(filePath) {
  console.log(`Fixing PageProps issue in ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file has the issue with awaiting params
  if (content.includes('await params')) {
    console.log(`Found 'await params' in ${filePath}`);
    
    // Replace 'await params' with just 'params'
    let fixed = content.replace(/const\s+\{\s*([^}]+)\s*\}\s*=\s*await\s+params/g, 'const { $1 } = params');
    
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`Fixed 'await params' in ${filePath}`);
  }
}

// Main function
function main() {
  try {
    // Find all page.tsx files in the project
    const files = execSync('find src -type f -name "[*.tsx" -o -name "*.page.tsx"', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    // Add known problematic files
    const knownFiles = [
      'src/app/(dashboard)/green-energy/equipment/[id]/page.tsx',
      'src/app/(dashboard)/green-energy/portfolio/equipment/[id]/page.tsx',
      'src/app/(dashboard)/green-energy/portfolio/investments/[id]/page.tsx',
      'src/app/(dashboard)/markets/portfolio/investments/[id]/page.tsx',
      'src/app/(dashboard)/real-estate/properties/[id]/page.tsx',
      'src/app/(dashboard)/real-estate/shares/[id]/page.tsx'
    ];
    
    const allFiles = [...new Set([...files, ...knownFiles])];
    
    console.log(`Found ${allFiles.length} potential files to check`);
    
    // Process each file
    for (const file of allFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        fixPagePropsIssue(filePath);
      }
    }
    
    // Specifically fix the known problematic file
    const specificFile = path.join(process.cwd(), 'src/app/(dashboard)/green-energy/equipment/[id]/page.tsx');
    if (fs.existsSync(specificFile)) {
      const content = fs.readFileSync(specificFile, 'utf8');
      
      // Fix the interface definition if needed
      if (content.includes('interface EquipmentDetailPageProps')) {
        console.log('Fixing EquipmentDetailPageProps interface');
        
        // Add the correct type for Next.js Page component
        let fixed = content.replace(
          /interface EquipmentDetailPageProps \{([^}]*)\}/s,
          'type EquipmentDetailPageProps = {\
$1}'
        );
        
        fs.writeFileSync(specificFile, fixed, 'utf8');
      }
    }
    
    console.log('Finished fixing PageProps issues');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
