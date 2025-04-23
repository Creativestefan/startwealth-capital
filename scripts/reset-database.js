const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log("Starting database reset process...");
  
  try {
    // Delete all data in reverse order of dependencies
    console.log("Deleting existing data...");
    
    // Use Prisma's deleteMany to clear tables
    // This avoids SQL-specific issues with Supabase
    
    // First, delete tables with foreign key dependencies
    console.log("Deleting user activities...");
    await prisma.userActivity.deleteMany();
    
    console.log("Deleting notifications...");
    await prisma.notification.deleteMany();
    
    console.log("Deleting push subscriptions...");
    await prisma.pushSubscription.deleteMany();
    
    console.log("Deleting notification preferences...");
    await prisma.notificationPreference.deleteMany();
    
    console.log("Deleting wallet transactions...");
    await prisma.walletTransaction.deleteMany();
    
    console.log("Deleting referral commissions...");
    await prisma.referralCommission.deleteMany();
    
    console.log("Deleting property transactions...");
    await prisma.propertyTransaction.deleteMany();
    
    console.log("Deleting equipment transactions...");
    await prisma.equipmentTransaction.deleteMany();
    
    console.log("Deleting real estate investments...");
    await prisma.realEstateInvestment.deleteMany();
    
    console.log("Deleting green energy investments...");
    await prisma.greenEnergyInvestment.deleteMany();
    
    console.log("Deleting market investments...");
    await prisma.marketInvestment.deleteMany();
    
    console.log("Deleting referrals...");
    await prisma.referral.deleteMany();
    
    console.log("Deleting KYC records...");
    await prisma.kYC.deleteMany();
    
    console.log("Deleting wallets...");
    await prisma.wallet.deleteMany();
    
    console.log("Deleting sessions...");
    await prisma.session.deleteMany();
    
    console.log("Deleting accounts...");
    await prisma.account.deleteMany();
    
    // Finally, delete users
    console.log("Deleting users...");
    await prisma.user.deleteMany();
    
    console.log("Database reset completed successfully!");
    
    // Now create the admin user
    console.log("\nCreating admin user...");
    const adminPassword = await bcrypt.hash("admin123456", 10);
    
    const admin = await prisma.user.create({
      data: {
        email: "admin@startwealth.com",
        firstName: "Admin",
        lastName: "User",
        dateOfBirth: new Date("1990-01-01"),
        password: adminPassword,
        role: "ADMIN",
        emailVerified: new Date()
      }
    });
    
    console.log(`Admin user created with ID: ${admin.id}`);
    
    // Create wallet for admin
    const wallet = await prisma.wallet.create({
      data: {
        userId: admin.id,
        balance: 1000000
      }
    });
    
    console.log(`Admin wallet created with ID: ${wallet.id}`);
    
    console.log("\nDatabase reset and admin user creation completed successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@startwealth.com / admin123456");
  } catch (error) {
    console.error("Error during database reset:", error);
    console.error("Full error:", JSON.stringify(error, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
