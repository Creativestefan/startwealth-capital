import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { z } from "zod";
import { createNotification } from "@/lib/notifications/index";

// Notification creation schema
const notificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1, { message: "Title is required" }),
  message: z.string().min(1, { message: "Message is required" }),
  type: z.nativeEnum(NotificationType),
  actionUrl: z.string().url().optional(),
  sendEmail: z.boolean().optional().default(true),
  sendPush: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authConfig);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    
    // Parse and validate request data
    const body = await req.json();
    const validationResult = notificationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { userId, title, message, type, actionUrl, sendEmail, sendPush } = validationResult.data;
    
    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    
    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }
    
    try {
      // Create notification with email and push options
      const notification = await createNotification(
        userId,
        title,
        message,
        type,
        actionUrl,
        sendEmail,
        sendPush
      );
      
      return NextResponse.json({
        message: "Notification created successfully",
        notification,
      });
    } catch (error) {
      console.error("[NOTIFICATION_CREATE_ERROR]", error);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[NOTIFICATION_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
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

export async function DELETE() {
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
