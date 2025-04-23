const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateAdminVerified() {
  console.log("Starting admin user email verification update...");
  
  try {
    // Update admin user to ensure emailVerified is set
    console.log("Updating admin user...");
    
    const admin = await prisma.user.update({
      where: { email: "admin@startwealth.com" },
      data: { 
        emailVerified: new Date()
      }
    });
    
    console.log(`Admin user updated with ID: ${admin.id}`);
    console.log(`Email verified status: ${admin.emailVerified ? 'Verified' : 'Not Verified'}`);
    
    console.log("\nUpdate completed successfully!");
  } catch (error) {
    console.error("Error during admin update:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminVerified();
