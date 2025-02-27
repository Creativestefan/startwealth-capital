import { prisma } from "@/lib/prisma"
import { RegisterSchema } from "@/lib/auth.config"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Registration attempt for:", body.email) // Debug log

    const validatedFields = RegisterSchema.safeParse(body)

    if (!validatedFields.success) {
      console.log("Validation failed:", validatedFields.error.flatten().fieldErrors) // Debug log
      return Response.json(
        { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { email, password } = validatedFields.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log("User already exists:", email) // Debug log
      return Response.json({ error: "Email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    console.log("Creating new user:", email) // Debug log
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        // Initialize wallet for the user
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
      include: {
        wallet: true,
      },
    })

    console.log("User created successfully:", user.id) // Debug log

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error) // Detailed error log
    return Response.json(
      { error: "Something went wrong", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

