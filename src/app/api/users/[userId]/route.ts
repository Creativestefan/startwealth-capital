export const dynamic = 'force-dynamic';
import { getUserById } from "@/lib/data/user"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    // Await the params object if it's a promise
    const paramsData = await params
    const userId = paramsData.userId
    
    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 })
    }
    
    const user = await getUserById(userId)
    
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }
    
    // Return only necessary user information
    return Response.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        kycStatus: user.kyc?.status
      }
    })
  } catch (error) {
    console.error("Failed to fetch user:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 