import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"

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

    await prisma.kYC.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        country,
        documentType,
        documentNumber,
        documentImage: "placeholder-url", // Replace with actual upload URL
        submittedAt: new Date(),
      },
    })

    return Response.json({ message: "KYC submitted successfully" })
  } catch (error) {
    console.error("Failed to submit KYC:", error)
    return Response.json({ error: "Failed to submit KYC" }, { status: 500 })
  }
}

