import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { propertyCreateSchema } from "@/lib/real-estate/utils/validation"
import { Prisma } from "@prisma/client"
import { z } from "zod"

// Define PropertyStatus type
type PropertyStatus = "ACTIVE" | "PENDING" | "SOLD" | "DRAFT"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()

    // Validate the request body
    const validatedData = propertyCreateSchema.parse(json)

    const property = await prisma.property.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: new Prisma.Decimal(validatedData.price),
        location: validatedData.location,
        mapUrl: validatedData.mapUrl,
        features: validatedData.features,
        mainImage: validatedData.mainImage, // Add the required mainImage field
        images: validatedData.images,
        status: validatedData.status,
        minInvestment: validatedData.minInvestment ? new Prisma.Decimal(validatedData.minInvestment) : null,
        maxInvestment: validatedData.maxInvestment ? new Prisma.Decimal(validatedData.maxInvestment) : null,
        expectedReturn: validatedData.expectedReturn ? new Prisma.Decimal(validatedData.expectedReturn) : null,
      },
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error("[PROPERTIES_POST]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as PropertyStatus | null
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice && { gte: new Prisma.Decimal(minPrice) }),
        ...(maxPrice && { lte: new Prisma.Decimal(maxPrice) }),
      }
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error("[PROPERTIES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

