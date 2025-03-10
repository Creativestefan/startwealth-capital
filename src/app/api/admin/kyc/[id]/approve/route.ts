import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user || session.user.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Check if KYC submission exists
    const kyc = await prisma.kYC.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!kyc) {
      return Response.json({ error: "KYC submission not found" }, { status: 404 })
    }

    // Update KYC status to APPROVED
    await prisma.kYC.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    })

    // No need to update user's KYC status as it's in a separate model
    // The KYC status will be checked via the KYC model when needed

    return Response.json({ message: "KYC submission approved successfully" })
  } catch (error) {
    console.error("Failed to approve KYC submission:", error)
    return Response.json({ error: "Failed to approve KYC submission" }, { status: 500 })
  }
}
