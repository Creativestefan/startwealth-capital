import { prisma } from "@/lib/prisma"
import { RegisterSchema } from "@/lib/auth.config"
import bcrypt from "bcryptjs"
import { ReferralStatus } from "@prisma/client"

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

    const { email, password, firstName, lastName, dateOfBirth, referralCode } = validatedFields.data

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

    // Look up referrer if referral code was provided
    let referrerId: string | null = null
    
    if (referralCode) {
      console.log("Looking up referrer for code:", referralCode)
      const referrer = await prisma.user.findFirst({
        where: { referralCode },
        select: { id: true }
      })
      
      if (referrer) {
        referrerId = referrer.id
        console.log("Found referrer with ID:", referrerId)
      } else {
        console.log("No referrer found for code:", referralCode)
      }
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

    // Create referral record if referrer was found
    if (referrerId) {
      console.log("Creating referral record for new user")
      await prisma.referral.create({
        data: {
          referrerId,
          referredId: user.id,
          commission: 0, // Will be calculated when user makes investments
          status: ReferralStatus.PENDING,
        }
      })
    }

    console.log("User created successfully:", user.id)

    // Don't include sensitive fields in the response
    return Response.json(
      {
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return Response.json(
      {
        error: "Error creating user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

