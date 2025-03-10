import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const country = formData.get("country") as string
    const documentType = formData.get("documentType") as string
    const documentNumber = formData.get("documentNumber") as string | undefined
    const documentImage = formData.get("documentImage") as File

    if (!country || !documentType || !documentImage) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already has a KYC record
    const existingKyc = await prisma.kYC.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    // Generate a unique filename for the document
    const fileExtension = documentImage.name.split('.').pop()
    const fileName = `kyc-${session.user.id}-${Date.now()}.${fileExtension}`
    
    // Upload the document to Cloudflare R2
    const { url } = await put(fileName, documentImage, {
      access: 'private',
      multipart: true,
    })

    if (existingKyc) {
      // Update existing KYC record
      await prisma.kYC.update({
        where: {
          userId: session.user.id,
        },
        data: {
          status: "PENDING",
          country,
          documentType,
          documentNumber,
          documentImage: url,
          submittedAt: new Date(),
          reviewedAt: null,
          rejectionReason: null,
        },
      })
    } else {
      // Create new KYC record
      await prisma.kYC.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          country,
          documentType,
          documentNumber,
          documentImage: url,
          submittedAt: new Date(),
        },
      })
    }

    return Response.json({ message: "KYC submitted successfully" })
  } catch (error) {
    console.error("Failed to submit KYC:", error)
    return Response.json({ error: "Failed to submit KYC" }, { status: 500 })
  }
}
