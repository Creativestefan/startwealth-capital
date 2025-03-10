import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const rejectSchema = z.object({
  reason: z.string().min(1, { message: "Rejection reason is required" }),
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user || session.user.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Validate request body
    const result = rejectSchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: result.error.format() }, { status: 400 })
    }

    const { reason } = result.data

    // Check if KYC submission exists
    const kyc = await prisma.kYC.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!kyc) {
      return Response.json({ error: "KYC submission not found" }, { status: 404 })
    }

    // Update KYC status to REJECTED
    await prisma.kYC.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    })

    // No need to update user's KYC status as it's in a separate model
    // The KYC status will be checked via the KYC model when needed

    return Response.json({ message: "KYC submission rejected successfully" })
  } catch (error) {
    console.error("Failed to reject KYC submission:", error)
    return Response.json({ error: "Failed to reject KYC submission" }, { status: 500 })
  }
}
