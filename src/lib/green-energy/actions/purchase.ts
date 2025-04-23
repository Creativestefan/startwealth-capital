'use server'

import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { EquipmentStatus, TransactionStatus, TransactionType } from "@prisma/client"

interface PurchaseEquipmentResult {
  success: boolean
  error?: string
}

export async function purchaseEquipment(
  equipmentId: string,
  deliveryAddress: string
): Promise<PurchaseEquipmentResult> {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be logged in to purchase equipment"
      }
    }
    
    // Get user with wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { id: true, wallet: true }
    })
    
    if (!user || !user.wallet) {
      return {
        success: false,
        error: "User wallet not found"
      }
    }
    
    // Get equipment
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    })
    
    if (!equipment) {
      return {
        success: false,
        error: "Equipment not found"
      }
    }
    
    if (equipment.status !== EquipmentStatus.AVAILABLE) {
      return {
        success: false,
        error: "This equipment is no longer available"
      }
    }
    
    const walletId = user.wallet.id
    const walletBalance = user.wallet.balance
    // Safely convert Decimal to number
    const equipmentPrice = typeof equipment.price === 'object' && 'toNumber' in equipment.price 
      ? equipment.price.toNumber() 
      : Number(equipment.price)
    
    // Check if user has enough balance
    if (walletBalance < equipmentPrice) {
      return {
        success: false,
        error: "Insufficient funds in your wallet"
      }
    }
    
    // Start a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Calculate new stock quantity
      const newStockQuantity = equipment.stockQuantity > 0 ? equipment.stockQuantity - 1 : 0
      
      // Update equipment - only mark as SOLD if stock is completely depleted
      await tx.equipment.update({
        where: { id: equipmentId },
        data: { 
          status: newStockQuantity === 0 ? EquipmentStatus.SOLD : EquipmentStatus.AVAILABLE,
          stockQuantity: newStockQuantity
        }
      })
      
      // Deduct from user's wallet
      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: walletBalance - equipmentPrice }
      })
      
      // Create equipment purchase record
      await tx.equipmentTransaction.create({
        data: {
          userId: user.id,
          equipmentId: equipment.id,
          quantity: 1,
          totalAmount: equipment.price,
          status: TransactionStatus.COMPLETED,
          deliveryAddress: parseDeliveryAddress(deliveryAddress),
          createdAt: new Date()
        }
      })
      
      // Create wallet transaction record
      await tx.walletTransaction.create({
        data: {
          walletId: walletId,
          type: TransactionType.WITHDRAWAL,
          amount: -equipmentPrice, // Negative amount for purchase
          status: TransactionStatus.COMPLETED,
          cryptoType: "USDT", // Default to USDT
          description: `Purchase of ${equipment.name}`,
          createdAt: new Date()
        }
      })
    })
    
    // Revalidate relevant paths
    revalidatePath('/green-energy/equipment')
    revalidatePath(`/green-energy/equipment/${equipmentId}`)
    revalidatePath('/green-energy/portfolio/equipment')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error("Error purchasing equipment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process purchase"
    }
  }
}

// Helper function to parse delivery address string into structured object
function parseDeliveryAddress(address: string) {
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