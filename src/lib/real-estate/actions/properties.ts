"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { Prisma } from "@prisma/client"
import type { PropertyCreateInput, PropertyUpdateInput } from "../types"
import { propertyCreateSchema, propertyUpdateSchema } from "../utils/validation"

export async function createProperty(data: PropertyCreateInput) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }

    // Validate input
    const validatedData = propertyCreateSchema.parse(data)

    const property = await prisma.property.create({
      data: {
        ...validatedData,
        price: new Prisma.Decimal(validatedData.price),
        minInvestment: validatedData.minInvestment ? new Prisma.Decimal(validatedData.minInvestment) : null,
        maxInvestment: validatedData.maxInvestment ? new Prisma.Decimal(validatedData.maxInvestment) : null,
        expectedReturn: validatedData.expectedReturn ? new Prisma.Decimal(validatedData.expectedReturn) : null,
      },
    })

    revalidatePath("/dashboard/real-estate")
    return { success: true, data: property }
  } catch (error) {
    console.error("[CREATE_PROPERTY]", error)
    return { success: false, error: error instanceof Error ? error.message : "Something went wrong" }
  }
}

export async function updateProperty(id: string, data: PropertyUpdateInput) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }

    // Validate input
    const validatedData = propertyUpdateSchema.parse(data)

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...validatedData,
        price: validatedData.price ? new Prisma.Decimal(validatedData.price) : undefined,
        minInvestment: validatedData.minInvestment ? new Prisma.Decimal(validatedData.minInvestment) : null,
        maxInvestment: validatedData.maxInvestment ? new Prisma.Decimal(validatedData.maxInvestment) : null,
        expectedReturn: validatedData.expectedReturn ? new Prisma.Decimal(validatedData.expectedReturn) : null,
      },
    })

    revalidatePath("/dashboard/real-estate")
    return { success: true, data: property }
  } catch (error) {
    console.error("[UPDATE_PROPERTY]", error)
    return { success: false, error: error instanceof Error ? error.message : "Something went wrong" }
  }
}

export async function deleteProperty(id: string) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized")
    }

    await prisma.property.delete({
      where: { id },
    })

    revalidatePath("/dashboard/real-estate")
    return { success: true }
  } catch (error) {
    console.error("[DELETE_PROPERTY]", error)
    return { success: false, error: error instanceof Error ? error.message : "Something went wrong" }
  }
}

