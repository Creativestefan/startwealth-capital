const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to parse delivery address string into structured object
function parseDeliveryAddress(address) {
  // If it's already an object with the expected structure, return it
  if (typeof address === 'object' && address !== null) {
    if (address.street && address.city) {
      return address;
    }
    
    // If it has an address property (old format)
    if (address.address && typeof address.address === 'string') {
      address = address.address;
    } else {
      // Can't parse this format
      console.log('Unparseable address format:', address);
      return { street: JSON.stringify(address) };
    }
  }
  
  if (typeof address !== 'string') {
    console.log('Non-string address:', address);
    return { street: JSON.stringify(address) };
  }
  
  // Expected format: "street, city, state zipCode, country"
  const parts = address.split(',').map(part => part.trim());
  
  if (parts.length < 3) {
    // If address format is not as expected, store as-is
    return { street: address };
  }
  
  const street = parts[0];
  const city = parts[1];
  
  // Handle "state zipCode" part
  const stateZipParts = parts[2].split(' ').filter(Boolean);
  const state = stateZipParts[0];
  const postalCode = stateZipParts.slice(1).join(' ');
  
  // Country is the last part
  const country = parts[3] || '';
  
  return {
    street,
    city,
    state,
    postalCode,
    country
  };
}

async function migrateDeliveryAddresses() {
  console.log('Starting delivery address migration...');
  
  try {
    // Get all equipment transactions
    const transactions = await prisma.equipmentTransaction.findMany();
    console.log(`Found ${transactions.length} transactions to process`);
    
    let migratedCount = 0;
    
    // Process each transaction
    for (const transaction of transactions) {
      if (!transaction.deliveryAddress) {
        console.log(`Transaction ${transaction.id} has no delivery address, skipping`);
        continue;
      }
      
      const oldAddress = transaction.deliveryAddress;
      const newAddress = parseDeliveryAddress(oldAddress);
      
      // Only update if the format changed
      if (JSON.stringify(oldAddress) !== JSON.stringify(newAddress)) {
        await prisma.equipmentTransaction.update({
          where: { id: transaction.id },
          data: { deliveryAddress: newAddress }
        });
        
        migratedCount++;
        console.log(`Migrated address for transaction ${transaction.id}`);
        console.log(`  From: ${JSON.stringify(oldAddress)}`);
        console.log(`  To:   ${JSON.stringify(newAddress)}`);
      }
    }
    
    console.log(`Migration complete. Migrated ${migratedCount} addresses.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateDeliveryAddresses(); 