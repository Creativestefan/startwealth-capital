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
        emailVerified: new Date(),
        wallet: {
          create: {
            balance: 1000000,
            currency: "USD"
          }
        }
      },
      include: {
        wallet: true
      }
    });
    
    console.log(`Admin user created/updated with ID: ${admin.id}`);
    if (admin.wallet) {
      console.log(`Admin wallet ID: ${admin.wallet.id}`);
    }
    
    // Create or update test user
    console.log("Creating/updating test user...");
    const userPassword = await bcrypt.hash("password123", 10);
    
    const user = await prisma.user.upsert({
      where: { email: "user@example.com" },
      update: { 
        password: userPassword,
        emailVerified: new Date()
      },
      create: {
        email: "user@example.com",
        firstName: "Test",
        lastName: "User",
        dateOfBirth: new Date("1995-05-15"),
        password: userPassword,
        role: "USER",
        emailVerified: new Date(),
        wallet: {
          create: {
            balance: 10000,
            currency: "USD"
          }
        }
      },
      include: {
        wallet: true
      }
    });
    
    console.log(`Test user created/updated with ID: ${user.id}`);
    if (user.wallet) {
      console.log(`Test user wallet ID: ${user.wallet.id}`);
    }
    
    console.log("\nUser creation completed successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@startwealth.com / admin123456");
    console.log("User: user@example.com / password123");
  } catch (error) {
    console.error("Error during user creation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
