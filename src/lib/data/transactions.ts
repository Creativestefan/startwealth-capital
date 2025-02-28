import { prisma } from "@/lib/prisma"

export async function getUserPropertyTransactions(userId: string) {
  try {
    return await prisma.propertyTransaction.findMany({
      where: { userId },
      include: {
        property: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch {
    return null
  }
}

export async function getUserEquipmentTransactions(userId: string) {
  try {
    return await prisma.equipmentTransaction.findMany({
      where: { userId },
      include: {
        equipment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch {
    return null
  }
}

