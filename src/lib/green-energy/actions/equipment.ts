"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Equipment, EquipmentTransaction, serializeEquipment, serializeEquipmentTransaction } from "../types";
import { EquipmentStatus, EquipmentType, TransactionStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { redirect } from "next/navigation";

// Get all equipment
export async function getAllEquipment() {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        features: true,
        images: true,
        price: true,
        status: true,
        type: true,
        stockQuantity: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return {
      success: true,
      data: equipment.map((item) => serializeEquipment(item)),
    };
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return {
      success: false,
      error: "Failed to fetch equipment",
    };
  }
}

// Get equipment by ID
export async function getEquipmentById(id: string) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        features: true,
        images: true,
        price: true,
        status: true,
        type: true,
        stockQuantity: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!equipment) {
      return {
        success: false,
        error: "Equipment not found",
      };
    }

    return {
      success: true,
      data: serializeEquipment(equipment),
    };
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return {
      success: false,
      error: "Failed to fetch equipment",
    };
  }
}

// Create new equipment
export async function createEquipment(data: {
  name: string;
  description: string;
  features: string[];
  images: string[];
  price: number;
  type: EquipmentType;
  stockQuantity: number;
}) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Set the appropriate status based on stock quantity
    const status = data.stockQuantity > 0 ? EquipmentStatus.AVAILABLE : EquipmentStatus.SOLD;

    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        description: data.description,
        features: data.features,
        images: data.images,
        price: data.price,
        type: data.type,
        stockQuantity: data.stockQuantity,
        status: status,
      },
      select: {
        id: true,
        name: true,
        description: true,
        features: true,
        images: true,
        price: true,
        status: true,
        type: true,
        stockQuantity: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    revalidatePath("/admin/green-energy/equipment");
    
    return {
      success: true,
      data: serializeEquipment(equipment),
    };
  } catch (error) {
    console.error("Error creating equipment:", error);
    return {
      success: false,
      error: "Failed to create equipment",
    };
  }
}

// Update equipment
export async function updateEquipment(id: string, data: {
  name?: string;
  description?: string;
  features?: string[];
  images?: string[];
  price?: number;
  type?: EquipmentType;
  stockQuantity?: number;
  status?: EquipmentStatus;
}) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Always determine status based on stock quantity if it's provided
    let status = data.status;
    if (data.stockQuantity !== undefined) {
      status = data.stockQuantity > 0 ? EquipmentStatus.AVAILABLE : EquipmentStatus.SOLD;
    } else {
      // If stock quantity is not provided, check the current stock quantity
      const currentEquipment = await prisma.equipment.findUnique({
        where: { id },
        select: { stockQuantity: true }
      });
      
      if (currentEquipment) {
        status = currentEquipment.stockQuantity > 0 ? EquipmentStatus.AVAILABLE : EquipmentStatus.SOLD;
      }
    }

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.features && { features: data.features }),
        ...(data.images && { images: data.images }),
        ...(data.price && { price: data.price }),
        ...(data.type && { type: data.type }),
        ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
        status, // Always update status based on stock quantity
      },
      select: {
        id: true,
        name: true,
        description: true,
        features: true,
        images: true,
        price: true,
        status: true,
        type: true,
        stockQuantity: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    revalidatePath("/admin/green-energy/equipment");
    
    return {
      success: true,
      data: serializeEquipment(equipment),
    };
  } catch (error) {
    console.error("Error updating equipment:", error);
    return {
      success: false,
      error: "Failed to update equipment",
    };
  }
}

// Delete equipment
export async function deleteEquipment(id: string) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if there are any transactions for this equipment
    const transactions = await prisma.equipmentTransaction.findMany({
      where: { equipmentId: id },
    });

    if (transactions.length > 0) {
      return {
        success: false,
        error: "Cannot delete equipment with existing transactions",
      };
    }

    await prisma.equipment.delete({
      where: { id },
    });

    revalidatePath("/admin/green-energy/equipment");
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return {
      success: false,
      error: "Failed to delete equipment",
    };
  }
}

// Purchase equipment
export async function purchaseEquipment(equipmentId: string, data: {
  quantity: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      redirect("/login");
    }

    const userId = session.user.id;

    // Get equipment details
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      return {
        success: false,
        error: "Equipment not found",
      };
    }

    // Check if equipment is available
    if (equipment.status !== EquipmentStatus.AVAILABLE) {
      return {
        success: false,
        error: "Equipment is not available for purchase",
      };
    }

    // Check if there's enough stock
    if (equipment.stockQuantity < data.quantity) {
      return {
        success: false,
        error: `Not enough stock available. Only ${equipment.stockQuantity} units left.`,
      };
    }

    // Get user wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return {
        success: false,
        error: "Wallet not found",
      };
    }

    // Calculate total amount
    const totalAmount = Number(equipment.price) * data.quantity;

    // Check if user has enough balance
    if (wallet.balance < totalAmount) {
      return {
        success: false,
        error: "Insufficient wallet balance",
      };
    }

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: totalAmount,
          },
        },
      });

      // Create wallet transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "INVESTMENT",
          amount: totalAmount,
          status: "COMPLETED",
          cryptoType: "USDT", // Default to USDT
          description: `Purchase of ${data.quantity} ${equipment.name}`,
        },
      });

      // Calculate new stock quantity
      const newStockQuantity = equipment.stockQuantity - data.quantity;
      
      // Determine new status based on stock quantity
      const newStatus = newStockQuantity > 0 
        ? EquipmentStatus.AVAILABLE 
        : EquipmentStatus.SOLD;

      // Update equipment stock
      const updatedEquipment = await tx.equipment.update({
        where: { id: equipmentId },
        data: {
          stockQuantity: newStockQuantity,
          status: newStatus,
        },
      });

      // Create equipment transaction
      const transaction = await tx.equipmentTransaction.create({
        data: {
          userId,
          equipmentId,
          quantity: data.quantity,
          totalAmount,
          status: TransactionStatus.PENDING,
          deliveryAddress: data.deliveryAddress as any,
          deliveryPin: generateDeliveryPin(),
        },
      });

      return {
        transaction,
        updatedEquipment,
        updatedWallet,
      };
    });

    revalidatePath("/real-estate/equipment");
    revalidatePath("/dashboard/wallet");
    
    return {
      success: true,
      data: serializeEquipmentTransaction(result.transaction as unknown as EquipmentTransaction),
    };
  } catch (error) {
    console.error("Error purchasing equipment:", error);
    return {
      success: false,
      error: "Failed to purchase equipment",
    };
  }
}

// Get user equipment transactions
export async function getUserEquipmentTransactions() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      redirect("/login");
    }

    const userId = session.user.id;

    const transactions = await prisma.equipmentTransaction.findMany({
      where: { userId },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            description: true,
            features: true,
            images: true,
            price: true,
            status: true,
            type: true,
            stockQuantity: true,
            createdAt: true,
            updatedAt: true,
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: transactions.map((tx) => serializeEquipmentTransaction(tx)),
    };
  } catch (error) {
    console.error("Error fetching equipment transactions:", error);
    return {
      success: false,
      error: "Failed to fetch equipment transactions",
    };
  }
}

// Update equipment transaction status (for admin)
export async function updateEquipmentTransactionStatus(id: string, status: TransactionStatus, trackingNumber?: string) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the current transaction to check if we need to generate a PIN
    const currentTransaction = await prisma.equipmentTransaction.findUnique({
      where: { id },
      select: { deliveryPin: true }
    });

    // Generate a delivery PIN if one doesn't exist and status is being updated to OUT_FOR_DELIVERY
    const deliveryPin = currentTransaction?.deliveryPin || 
      (status === TransactionStatus.OUT_FOR_DELIVERY ? generateDeliveryPin() : undefined);

    const transaction = await prisma.equipmentTransaction.update({
      where: { id },
      data: {
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(status === TransactionStatus.OUT_FOR_DELIVERY && { deliveryDate: new Date() }),
        ...(deliveryPin && { deliveryPin }),
      },
    });

    revalidatePath("/admin/green-energy/orders");
    revalidatePath("/admin/green-energy/transactions");
    
    return {
      success: true,
      data: serializeEquipmentTransaction(transaction),
    };
  } catch (error) {
    console.error("Error updating equipment transaction status:", error);
    return {
      success: false,
      error: "Failed to update transaction status",
    };
  }
}

// Update equipment transaction delivery address (for admin)
export async function updateEquipmentTransactionDeliveryAddress(id: string, deliveryAddress: any) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const transaction = await prisma.equipmentTransaction.update({
      where: { id },
      data: {
        deliveryAddress,
      },
    });

    revalidatePath("/admin/green-energy/orders");
    revalidatePath("/admin/green-energy/transactions");
    revalidatePath(`/admin/green-energy/transactions/${id}`);
    
    return {
      success: true,
      data: serializeEquipmentTransaction(transaction),
    };
  } catch (error) {
    console.error("Error updating equipment transaction delivery address:", error);
    return {
      success: false,
      error: "Failed to update delivery address",
    };
  }
}

// Get all equipment transactions (for admin)
export async function getAllEquipmentTransactions() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const transactions = await prisma.equipmentTransaction.findMany({
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            description: true,
            features: true,
            images: true,
            price: true,
            status: true,
            type: true,
            stockQuantity: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: transactions.map((tx) => serializeEquipmentTransaction(tx)),
    };
  } catch (error) {
    console.error("Error fetching equipment transactions:", error);
    return {
      success: false,
      error: "Failed to fetch equipment transactions",
    };
  }
}

// Get equipment transaction by ID
export async function getEquipmentTransactionById(id: string) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if user is admin
    const isAdmin = session.user.role === "ADMIN";

    const transaction = await prisma.equipmentTransaction.findFirst({
      where: { 
        id,
        // Only filter by user email if not admin
        ...(isAdmin ? {} : {
          user: {
            email: session.user.email as string,
          },
        }),
      },
      include: {
        equipment: true,
        user: true,
      },
    });

    if (!transaction) {
      return {
        success: false,
        error: "Transaction not found",
      };
    }

    return {
      success: true,
      data: serializeEquipmentTransaction(transaction),
    };
  } catch (error) {
    console.error("Error fetching equipment transaction:", error);
    return {
      success: false,
      error: "Failed to fetch equipment transaction",
    };
  }
}

// Helper function to generate a random 6-digit PIN
function generateDeliveryPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Add this new server action to update the delivery PIN
export async function updateEquipmentTransactionDeliveryPin(
  transactionId: string,
  deliveryPin: string
) {
  try {
    const transaction = await prisma.equipmentTransaction.update({
      where: {
        id: transactionId,
      },
      data: {
        deliveryPin,
      },
      include: {
        equipment: true,
      },
    });

    return {
      success: true,
      data: serializeEquipmentTransaction(transaction),
    };
  } catch (error) {
    console.error("Error updating equipment transaction delivery PIN:", error);
    return {
      success: false,
      error: "Failed to update delivery PIN",
    };
  }
} 