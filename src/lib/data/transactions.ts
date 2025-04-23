import { prisma } from "@/lib/prisma"
import { serializeData } from "@/lib/real-estate/utils/formatting"

export async function getUserPropertyTransactions(userId: string) {
  try {
    const transactions = await prisma.propertyTransaction.findMany({
      where: { userId },
      include: {
        property: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    
    // Serialize the data to convert Decimal objects to numbers
    return serializeData(transactions)
  } catch {
    return null
  }
}

export async function getUserEquipmentTransactions(userId: string) {
  try {
    const transactions = await prisma.equipmentTransaction.findMany({
      where: { userId },
      include: {
        equipment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    
    // Serialize the data to convert Decimal objects to numbers
    return serializeData(transactions)
  } catch {
    return null
  }
}

