export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Subscription schema
const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

/**
 * Subscribe a user to push notifications
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authConfig);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    
    // Parse and validate the subscription data
    const body = await req.json();
    const validationResult = subscriptionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid subscription data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Save or update the subscription
    const subscription = await prisma.pushSubscription.upsert({
      where: { userId: session.user.id },
      update: {
        subscription: JSON.stringify(body)
      },
      create: {
        userId: session.user.id,
        subscription: JSON.stringify(body)
      }
    });
    
    return NextResponse.json({
      message: "Subscription saved successfully",
      success: true
    });
  } catch (error) {
    console.error("[PUSH_SUBSCRIPTION_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}

/**
 * Unsubscribe a user from push notifications
 */
export async function DELETE(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authConfig);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    
    // Delete the subscription
    try {
      await prisma.pushSubscription.delete({
        where: { userId: session.user.id }
      });
    } catch (error) {
      // If the record doesn't exist, it's fine
      if ((error as any)?.code !== 'P2025') {
        throw error;
      }
    }
    
    return NextResponse.json({
      message: "Subscription deleted successfully",
      success: true
    });
  } catch (error) {
    console.error("[PUSH_UNSUBSCRIBE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}

// Unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
