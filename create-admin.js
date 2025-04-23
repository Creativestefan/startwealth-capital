const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// This script creates an admin user directly using Prisma's $executeRaw
// to bypass the prepared statement issues

async function createAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Creating admin user...');
    
    // Generate hashed password
    const adminPasswordRaw = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminPassword = await bcrypt.hash(adminPasswordRaw, 10);
    
    // Generate a unique ID for the user
    const userId = `admin_${Date.now()}`;
    
    // Current date for timestamps
    const now = new Date().toISOString();
    
    // Check if admin already exists
    const existingAdmin = await prisma.$queryRaw`
      SELECT id FROM "User" WHERE email = 'admin@stratwealth.com' LIMIT 1
    `;
    
    if (existingAdmin && existingAdmin.length > 0) {
      console.log('Admin user already exists with ID:', existingAdmin[0].id);
      return;
    }
    
    // Insert admin user directly with SQL
    await prisma.$executeRaw`
      INSERT INTO "User" (
        id, 
        email, 
        "firstName", 
        "lastName", 
        "dateOfBirth", 
        password, 
        role, 
        "emailVerified", 
        "createdAt", 
        "updatedAt"
      ) VALUES (
        ${userId}, 
        'admin@stratwealth.com', 
        'Admin', 
        'User', 
        '1990-01-01', 
        ${adminPassword}, 
        'ADMIN', 
        ${now}, 
        ${now}, 
        ${now}
      )
    `;
    
    // Create wallet for admin
    await prisma.$executeRaw`
      INSERT INTO "Wallet" (
        id,
        "userId",
        balance,
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${`wallet_${userId}`},
        ${userId},
        0,
        ${now},
        ${now}
      )
    `;
    
    console.log('Admin user created successfully with ID:', userId);
    console.log('Login with email: admin@stratwealth.com and password:', adminPasswordRaw);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdmin();
