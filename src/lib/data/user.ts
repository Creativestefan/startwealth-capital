import { prisma } from "@/lib/prisma"
import type { AuthUser } from "@/types/auth"
import type { Prisma } from "@prisma/client"

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        kyc: true,
        wallet: {
          include: {
            transactions: true,
          },
        },
        marketInvestments: true,
        referralsGiven: true,
        notifications: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    return user
  } catch {
    return null
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        kyc: true,
        wallet: {
          include: {
            transactions: true,
          },
        },
        marketInvestments: true,
        referralsGiven: true,
        notifications: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    return user
  } catch {
    return null
  }
}

export async function updateUser(id: string, data: Partial<AuthUser>) {
  try {
    const updateData: Prisma.UserUpdateInput = {
      email: data.email,
      image: data.image,
      emailVerified: data.emailVerified,
      role: data.role,
      kyc: data.kyc
        ? {
            upsert: {
              create: {
                status: data.kyc.status,
                country: data.kyc.country,
                documentType: data.kyc.documentType,
                documentNumber: data.kyc.documentNumber,
                documentImage: data.kyc.documentImage,
              },
              update: {
                status: data.kyc.status,
                country: data.kyc.country,
                documentType: data.kyc.documentType,
                documentNumber: data.kyc.documentNumber,
                documentImage: data.kyc.documentImage,
              },
            },
          }
        : undefined,
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        kyc: true,
        wallet: {
          include: {
            transactions: true,
          },
        },
        marketInvestments: true,
        referralsGiven: true,
        notifications: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    return user
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

