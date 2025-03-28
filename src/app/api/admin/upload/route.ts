import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { v4 as uuidv4 } from "uuid"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { r2Client, R2_BUCKET_NAME } from "@/lib/cloudflare"

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed file types
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]

export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authConfig)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }
    
    // Get the form data
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed." },
        { status: 400 }
      )
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      )
    }
    
    // Generate a unique filename with UUID
    const fileExtension = file.name.split(".").pop() || "jpg"
    const uniqueFilename = `admin/profile/${uuidv4()}.${fileExtension}`
    
    try {
      // Convert file to buffer for upload
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Upload to Cloudflare R2
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: uniqueFilename,
        Body: buffer,
        ContentType: file.type,
      })
      
      await r2Client.send(command)
      
      // Generate the public URL using Cloudflare domain
      const publicUrl = `https://${process.env.CLOUDFLARE_PUBLIC_DOMAIN}/${uniqueFilename}`
      
      // Return success response
      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: uniqueFilename
      })
    } catch (error) {
      console.error("[CLOUDFLARE_UPLOAD_ERROR]", error)
      return NextResponse.json(
        { error: "Failed to upload image to Cloudflare" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[ADMIN_UPLOAD_API_ERROR]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

// Block other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
} 