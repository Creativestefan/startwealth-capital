// Use an IIFE (Immediately Invoked Function Expression) to create a private scope
(async () => {
  // Import dependencies
  const { PrismaClient } = require("@prisma/client");
  const bcrypt = require("bcryptjs");
  
  // Create a local instance of PrismaClient
  const prisma = new PrismaClient();
  
  try {
    console.log("Starting database seeding...");

    // Create admin user with password from environment variable or fallback to a default for development
    const adminPasswordRaw = process.env.SEED_ADMIN_PASSWORD || "admin123456";
    const adminPassword = await bcrypt.hash(adminPasswordRaw, 10);
    
    // Note: In production, always use environment variables for credentials
    const admin = await prisma.user.upsert({
      where: { email: "admin@stratwealth.com" },
      update: {},
      create: {
        email: "admin@stratwealth.com",
        firstName: "Admin",
        lastName: "User",
        dateOfBirth: new Date("1990-01-01"),
        password: adminPassword,
        role: "ADMIN",
        emailVerified: new Date(),
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
    });
  
    console.log("Admin user created:", { id: admin.id, email: admin.email });

    // Create demo users
    const demoUsers = [];
    for (let i = 1; i <= 5; i++) {
      const userPassword = await bcrypt.hash(`user${i}password`, 10);
      const user = await prisma.user.upsert({
        where: { email: `user${i}@example.com` },
        update: {},
        create: {
          email: `user${i}@example.com`,
          firstName: `Demo${i}`,
          lastName: `User${i}`,
          dateOfBirth: new Date(`199${i}-01-01`),
          password: userPassword,
          role: "USER",
          emailVerified: new Date(),
          referralCode: `REF${i}${Math.floor(Math.random() * 1000)}`,
          wallet: {
            create: {
              balance: 10000 * i, // Different starting balances
            },
          },
        },
      });
      demoUsers.push(user);
    }

    console.log(`Created ${demoUsers.length} demo users`);
    
    // Create real estate properties
    const properties = [];
    const propertyData = [
      {
        name: "Luxury Beachfront Villa",
        description: "Stunning beachfront villa with panoramic ocean views",
        location: "Miami, Florida",
        price: 1200000,
        features: ["Ocean View", "Swimming Pool", "Private Beach Access", "Smart Home"],
        images: ["/images/properties/beach-villa-1.jpg", "/images/properties/beach-villa-2.jpg"],
        status: "AVAILABLE",
        mainImage: "/images/properties/beach-villa-1.jpg",
      },
      {
        name: "Downtown Office Complex",
        description: "Modern office complex in the heart of the business district",
        location: "New York, NY",
        price: 3500000,
        features: ["24/7 Security", "Parking Garage", "Conference Rooms", "Rooftop Terrace"],
        images: ["/images/properties/office-complex-1.jpg", "/images/properties/office-complex-2.jpg"],
        status: "AVAILABLE",
        mainImage: "/images/properties/office-complex-1.jpg",
      },
      {
        name: "Suburban Family Home",
        description: "Spacious family home in a quiet suburban neighborhood",
        location: "Austin, Texas",
        price: 450000,
        features: ["Backyard", "Garage", "Modern Kitchen", "School District"],
        images: ["/images/properties/suburban-home-1.jpg", "/images/properties/suburban-home-2.jpg"],
        status: "AVAILABLE",
        mainImage: "/images/properties/suburban-home-1.jpg",
      },
    ];

    for (const property of propertyData) {
      const createdProperty = await prisma.property.create({
        data: {
          name: property.name,
          description: property.description,
          location: property.location,
          price: property.price,
          features: property.features,
          images: property.images,
          status: property.status,
          mainImage: property.mainImage,
        },
      });
      properties.push(createdProperty);
    }

    console.log(`Created ${properties.length} properties`);

    // Create equipment items
    const equipmentData = [
      {
        name: "Solar Panel System - Residential",
        description: "High-efficiency solar panel system for residential properties",
        features: ["20-year warranty", "Easy installation", "Weather resistant", "Smart monitoring"],
        images: ["/images/equipment/solar-panel-1.jpg", "/images/equipment/solar-panel-2.jpg"],
        price: 12000,
        status: "AVAILABLE",
        type: "SOLAR_PANEL",
        stockQuantity: 50,
      },
      {
        name: "Wind Turbine - Small Scale",
        description: "Compact wind turbine for residential and small business use",
        features: ["Low noise operation", "Starts at low wind speeds", "Durable construction", "5-year warranty"],
        images: ["/images/equipment/wind-turbine-1.jpg", "/images/equipment/wind-turbine-2.jpg"],
        price: 8500,
        status: "AVAILABLE",
        type: "WIND_TURBINE",
        stockQuantity: 25,
      },
      {
        name: "Home Battery System",
        description: "Energy storage solution for solar and wind power systems",
        features: ["10 kWh capacity", "Wall-mounted design", "Smartphone app control", "Backup power"],
        images: ["/images/equipment/battery-1.jpg", "/images/equipment/battery-2.jpg"],
        price: 7500,
        status: "AVAILABLE",
        type: "BATTERY_STORAGE",
        stockQuantity: 40,
      },
    ];

    const equipment = [];
    for (const item of equipmentData) {
      const createdEquipment = await prisma.equipment.create({
        data: {
          name: item.name,
          description: item.description,
          features: item.features,
          images: item.images,
          price: item.price,
          status: item.status,
          type: item.type,
          stockQuantity: item.stockQuantity,
        },
      });
      equipment.push(createdEquipment);
    }

    console.log(`Created ${equipment.length} equipment items`);

    // Find existing users to add activities for
    const users = await prisma.user.findMany({ take: 5 });
    
    if (users.length > 0) {
      // Clear previous activities (for testing)
      await prisma.userActivity.deleteMany({});
      
      // Create activities for each user
      for (const user of users) {
        // Login activities
        await prisma.userActivity.createMany({
          data: [
            {
              userId: user.id,
              type: "login",
              description: "User logged in successfully",
              status: "success",
              timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
              metadata: { 
                ipAddress: "192.168.1.100", 
                browser: "Chrome 121.0.0", 
                deviceInfo: "Windows Desktop",
                location: "New York, USA"
              }
            },
            {
              userId: user.id,
              type: "login",
              description: "User logged in from new device",
              status: "success",
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
              metadata: { 
                ipAddress: "107.22.44.21", 
                browser: "Safari 17.0", 
                deviceInfo: "iPhone 13",
                location: "Los Angeles, USA"
              }
            },
            {
              userId: user.id,
              type: "login",
              description: "Failed login attempt",
              status: "failed",
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
              metadata: { 
                ipAddress: "84.177.12.55", 
                browser: "Firefox 115.0", 
                deviceInfo: "Android Tablet",
                location: "Unknown Location"
              }
            }
          ]
        });
        
        // Investment activities
        await prisma.userActivity.createMany({
          data: [
            {
              userId: user.id,
              type: "investment",
              description: "Real Estate investment of $5,000",
              status: "success",
              amount: 5000,
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
              metadata: { investmentType: "real_estate", propertyId: "prop123" }
            },
            {
              userId: user.id,
              type: "investment",
              description: "Green Energy investment of $3,000",
              status: "success",
              amount: 3000,
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
              metadata: { investmentType: "green_energy", projectId: "green456" }
            },
            {
              userId: user.id,
              type: "investment",
              description: "Market investment of $2,500",
              status: "pending",
              amount: 2500,
              timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
              metadata: { investmentType: "market", planId: "market789" }
            }
          ]
        });
        
        // Withdrawal activities
        await prisma.userActivity.createMany({
          data: [
            {
              userId: user.id,
              type: "withdrawal",
              description: "Withdrawal to bank account",
              status: "success",
              amount: 1200,
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
              metadata: { accountEnding: "1234", bankName: "Chase" }
            },
            {
              userId: user.id,
              type: "withdrawal",
              description: "Withdrawal request submitted",
              status: "pending",
              amount: 3500,
              timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
              metadata: { accountEnding: "5678", bankName: "Bank of America" }
            }
          ]
        });
        
        // Transaction activities
        await prisma.userActivity.createMany({
          data: [
            {
              userId: user.id,
              type: "transaction",
              description: "Dividend payment received",
              status: "success",
              amount: 350,
              timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
              metadata: { source: "real_estate_investment", reference: "div123" }
            },
            {
              userId: user.id,
              type: "transaction",
              description: "Referral bonus credited",
              status: "success",
              amount: 100,
              timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
              metadata: { referralCode: "FRIEND50" }
            }
          ]
        });
      }
      
      console.log("Created user activities for testing");
    }

    console.log("Database seeding completed successfully!");
  } catch (e) {
    console.error("Error during seeding:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
