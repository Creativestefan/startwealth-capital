import { NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/utils/upload"

// Remove authentication requirement for testing
export async function POST(request: Request) {
  try {
    // Temporarily remove session check for testing
    // const session = await getServerSession(authConfig)
    // if (!session) {
    //   return new NextResponse("Unauthorized", { status: 401 })
    // }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    // Log file details for debugging
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return new NextResponse("Invalid file type. Only images are allowed.", { status: 400 })
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return new NextResponse("File too large. Maximum size is 5MB.", { status: 400 })
    }

    const folder = (formData.get("folder") as string) || "properties"

    try {
      const url = await uploadToR2(file, folder)
      return NextResponse.json({ url })
    } catch (uploadError) {
      console.error("R2 Upload error:", uploadError)
      return new NextResponse(uploadError instanceof Error ? uploadError.message : "Failed to upload to R2", {
        status: 500,
      })
    }
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error)
    return new NextResponse(error instanceof Error ? error.message : "Internal Server Error", { status: 500 })
  }
}

