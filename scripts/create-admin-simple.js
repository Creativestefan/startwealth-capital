const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin() {
  console.log("Starting admin user creation...");
  
  try {
    // Create or update admin user
    console.log("Creating/updating admin user...");
    const adminPassword = await bcrypt.hash("admin123456", 10);
    
    const admin = await prisma.user.upsert({
      where: { email: "admin@startwealth.com" },
      update: { 
        password: adminPassword,
        emailVerified: new Date()
      },
      create: {
        email: "admin@startwealth.com",
        firstName: "Admin",
        lastName: "User",
        dateOfBirth: new Date("1990-01-01"),
        password: adminPassword,
        role: "ADMIN",
        emailVerified: new Date()
      }
    });
    
    console.log(`Admin user created/updated with ID: ${admin.id}`);
    
    // Now create the wallet if it doesn't exist
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId: admin.id }
    });
    
    if (!existingWallet) {
      const wallet = await prisma.wallet.create({
        data: {
          userId: admin.id,
          balance: 1000000
        }
      });
      console.log(`Admin wallet created with ID: ${wallet.id}`);
    } else {
      console.log(`Admin wallet already exists with ID: ${existingWallet.id}`);
    }
    
    console.log("\nUser creation completed successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@startwealth.com / admin123456");
  } catch (error) {
    console.error("Error during user creation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
