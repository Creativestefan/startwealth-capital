export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"

// GET /api/real-estate/properties/[id] - Get a single property
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const property = await prisma.property.findUnique({
      where: {
        id: params.id,
      },
      include: {
        transactions: {
          select: {
            id: true,
            amount: true,
            type: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })

    if (!property) {
      return new NextResponse("Property not found", { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error("[PROPERTY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// PATCH /api/real-estate/properties/[id] - Update a property
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()

    const property = await prisma.property.update({
      where: {
        id: params.id,
      },
      data: json,
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error("[PROPERTY_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// DELETE /api/real-estate/properties/[id] - Delete a property
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.property.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PROPERTY_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

