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

    const { email, password, firstName, lastName, dateOfBirth } = validatedFields.data

    // Check if user already exists with detailed logging
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, createdAt: true },
    })

    if (existingUser) {
      console.log("Existing user found:", {
        id: existingUser.id,
        email: existingUser.email,
        createdAt: existingUser.createdAt,
      })
      return Response.json(
        {
          error: "Email already exists",
          details: {
            message: "An account with this email already exists",
            createdAt: existingUser.createdAt,
          },
        },
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with detailed logging
    console.log("Creating new user:", email)
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        password: hashedPassword,
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

    console.log("User created successfully:", {
      id: user.id,
      email: user.email,
      hasWallet: !!user.wallet,
    })

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error) // Detailed error log
    return Response.json(
      {
        error: "Something went wrong",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

