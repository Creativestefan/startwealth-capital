import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"

export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authConfig)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }
    
    // Check if the request is multipart/form-data
    const formData = await req.formData()
    const file = formData.get("image") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }
    
    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed." },
        { status: 400 }
      )
    }
    
    // Check file size - limit to 5MB
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      )
    }
    
    try {
      // Convert file to buffer for upload
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Upload to Cloudflare using existing integration
      const uploadResponse = await fetch(process.env.CLOUDFLARE_UPLOAD_URL!, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
        body: formData // Use the original formData which contains the file
      })
      
      if (!uploadResponse.ok) {
        throw new Error(`Cloudflare upload failed: ${uploadResponse.statusText}`)
      }
      
      const uploadResult = await uploadResponse.json()
      
      // Return the Cloudflare URL to the file
      return NextResponse.json({ 
        imageUrl: uploadResult.result.variants[0], // Adjust based on your Cloudflare response structure
        success: true
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

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
} 