import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return new NextResponse("Missing image URL", { status: 400 })
    }

    const response = await fetch(imageUrl)
    const buffer = await response.arrayBuffer()

    // Set caching headers
    const headers = new Headers({
      "Content-Type": response.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    })

    return new NextResponse(buffer, { headers })
  } catch (error) {
    console.error("Image proxy error:", error)
    return new NextResponse("Failed to load image", { status: 500 })
  }
}

