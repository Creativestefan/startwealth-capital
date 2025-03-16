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
    });

    return {
      success: true,
      data: equipment.map((item) => serializeEquipment(item as unknown as Equipment)),
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
    });

    if (!equipment) {
      return {
        success: false,
        error: "Equipment not found",
      };
    }

    return {
      success: true,
      data: serializeEquipment(equipment as unknown as Equipment),
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

    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        description: data.description,
        features: data.features as any,
        images: data.images as any,
        price: data.price,
        type: data.type,
        stockQuantity: data.stockQuantity,
        status: EquipmentStatus.AVAILABLE,
      },
    });

    revalidatePath("/admin/green-energy/equipment");
    
    return {
      success: true,
      data: serializeEquipment(equipment as unknown as Equipment),
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

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.features && { features: data.features as any }),
        ...(data.images && { images: data.images as any }),
        ...(data.price && { price: data.price }),
        ...(data.type && { type: data.type }),
        ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
        ...(data.status && { status: data.status }),
      },
    });

    revalidatePath("/admin/green-energy/equipment");
    
    return {
      success: true,
      data: serializeEquipment(equipment as unknown as Equipment),
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
        error: "Not enough stock available",
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

      // Update equipment stock
      const updatedEquipment = await tx.equipment.update({
        where: { id: equipmentId },
        data: {
          stockQuantity: {
            decrement: data.quantity,
          },
          // If stock becomes 0, update status to OUT_OF_STOCK
          ...(equipment.stockQuantity - data.quantity <= 0 && {
            status: EquipmentStatus.SOLD,
          }),
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
        equipment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: transactions.map((tx) => serializeEquipmentTransaction(tx as unknown as EquipmentTransaction)),
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

    const transaction = await prisma.equipmentTransaction.update({
      where: { id },
      data: {
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(status === TransactionStatus.COMPLETED && { deliveryDate: new Date() }),
      },
    });

    revalidatePath("/admin/green-energy/orders");
    
    return {
      success: true,
      data: serializeEquipmentTransaction(transaction as unknown as EquipmentTransaction),
    };
  } catch (error) {
    console.error("Error updating equipment transaction status:", error);
    return {
      success: false,
      error: "Failed to update transaction status",
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
        equipment: true,
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
      data: transactions.map((tx) => serializeEquipmentTransaction(tx as unknown as EquipmentTransaction)),
    };
  } catch (error) {
    console.error("Error fetching equipment transactions:", error);
    return {
      success: false,
      error: "Failed to fetch equipment transactions",
    };
  }
} 