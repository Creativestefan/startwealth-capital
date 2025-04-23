const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function resetAndSeed() {
  console.log("Starting database reset and seed process...");
  
  try {
    // Step 1: Delete all data from tables in reverse order of dependencies
    console.log("Clearing database tables...");
    
    // Clear tables with foreign key dependencies first
    await prisma.$executeRaw`TRUNCATE TABLE "UserActivity" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Notification" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Transaction" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "PropertyInvestment" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "GreenEnergyInvestment" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "MarketInvestment" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "KYC" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Wallet" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Session" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`;
    
    console.log("Database tables cleared successfully.");
    
    // Step 2: Create admin user
    console.log("Creating admin user...");
    const adminPassword = await bcrypt.hash("admin123456", 10);
    
    const admin = await prisma.user.create({
      data: {
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
    
    console.log(`Admin user created with ID: ${admin.id}`);
    console.log(`Admin wallet created with ID: ${admin.wallet.id}`);
    
    // Step 3: Create a test user
    console.log("Creating test user...");
    const userPassword = await bcrypt.hash("password123", 10);
    
    const user = await prisma.user.create({
      data: {
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
    
    console.log(`Test user created with ID: ${user.id}`);
    console.log(`Test user wallet created with ID: ${user.wallet.id}`);
    
    console.log("Database reset and seed completed successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@startwealth.com / admin123456");
    console.log("User: user@example.com / password123");
  } catch (error) {
    console.error("Error during database reset and seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSeed();
