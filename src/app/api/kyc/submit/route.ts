export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { prisma } from "@/lib/prisma"

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";

/**
 * Generates a unique filename for uploading to R2
 */
function generateUniqueFilename(originalFilename: string, userId: string): string {
  const extension = originalFilename.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `kyc/${userId}/${timestamp}-${randomString}.${extension}`;
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const documentImage = formData.get("documentImage") as File
    const documentType = formData.get("documentType") as string
    const documentNumber = formData.get("documentNumber") as string || null
    const country = formData.get("country") as string

    if (!documentImage) {
      return NextResponse.json({ error: "Document image is required" }, { status: 400 })
    }

    if (!documentType) {
      return NextResponse.json({ error: "Document type is required" }, { status: 400 })
    }

    if (!country) {
      return NextResponse.json({ error: "Country is required" }, { status: 400 })
    }

    // Generate a unique filename
    const key = generateUniqueFilename(documentImage.name, session.user.id)
    
    // Convert file to buffer
    const arrayBuffer = await documentImage.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: documentImage.type,
    })

    await s3Client.send(command)
    
    // Generate the public URL
    const publicUrl = `https://${bucketName}.${process.env.CLOUDFLARE_R2_ENDPOINT}/${key}`
    
    // Generate a proxied URL that goes through our API
    const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(publicUrl)}`
    
    // Update user's KYC status and document URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        kyc: {
          upsert: {
            create: {
              status: "PENDING",
              documentImage: proxiedUrl,
              documentType,
              documentNumber,
              country,
              submittedAt: new Date(),
            },
            update: {
              status: "PENDING",
              documentImage: proxiedUrl,
              documentType,
              documentNumber,
              country,
              submittedAt: new Date(),
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("KYC submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit KYC" },
      { status: 500 }
    )
  }
}
