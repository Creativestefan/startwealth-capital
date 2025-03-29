export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { createBulkNotifications } from "@/lib/notifications/index";

// Bulk notification schema
const bulkNotificationSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  message: z.string().min(1, { message: "Message is required" }),
  type: z.nativeEnum(NotificationType),
  actionUrl: z.string().url().optional(),
  sendEmail: z.boolean().optional().default(true),
  sendPush: z.boolean().optional().default(true),
  
  // User selection options (must provide one)
  userIds: z.array(z.string()).optional(),
  userRole: z.enum(["USER", "ADMIN"]).optional(),
  allUsers: z.boolean().optional(),
  // Add more filtering options as needed (e.g., country, investmentType, etc.)
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
    const validationResult = bulkNotificationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const {
      title,
      message,
      type,
      actionUrl,
      sendEmail,
      sendPush,
      userIds,
      userRole,
      allUsers
    } = validationResult.data;
    
    // Determine target users
    let targetUserIds: string[] = [];
    
    if (userIds && userIds.length > 0) {
      // Specific users
      targetUserIds = userIds;
    } else if (userRole) {
      // Users with specific role
      const users = await prisma.user.findMany({
        where: { role: userRole },
        select: { id: true }
      });
      targetUserIds = users.map(user => user.id);
    } else if (allUsers) {
      // All users
      const users = await prisma.user.findMany({
        select: { id: true }
      });
      targetUserIds = users.map(user => user.id);
    } else {
      return NextResponse.json(
        { error: "You must specify target users (userIds, userRole, or allUsers)" },
        { status: 400 }
      );
    }
    
    // Verify we have users to notify
    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { error: "No target users found" },
        { status: 404 }
      );
    }
    
    try {
      // Create notifications for all target users
      const result = await createBulkNotifications(
        targetUserIds,
        title,
        message,
        type,
        actionUrl,
        sendEmail,
        sendPush
      );
      
      return NextResponse.json({
        message: `Notifications sent to ${result.successful} out of ${result.total} users`,
        result,
      });
    } catch (error) {
      console.error("[BULK_NOTIFICATION_CREATE_ERROR]", error);
      return NextResponse.json(
        { error: "Failed to create bulk notifications" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[BULK_NOTIFICATION_API_ERROR]", error);
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
