import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { sendNotificationEmail } from "./email";
import { sendPushNotification } from "@/app/actions/push-notifications";

/**
 * Creates a notification for a user and optionally sends an email
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  actionUrl?: string,
  sendEmail: boolean = true,
  sendPush: boolean = true
) {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        actionUrl,
        read: false,
      },
    });

    // Get user details for sending notifications
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    // Process sending email notification in background
    if (sendEmail && user?.email) {
      // Don't await to avoid blocking
      sendNotificationEmail(
        user.email,
        title,
        message,
        type,
        actionUrl
      ).catch(error => {
        console.error("[EMAIL_NOTIFICATION_ERROR]", error);
      });
    }

    // Process sending push notification in background
    if (sendPush) {
      // Don't await to avoid blocking
      sendPushNotification(
        userId,
        title,
        message,
        '/logo.png',
        { url: actionUrl || '/', type }
      ).catch(error => {
        console.error("[PUSH_NOTIFICATION_ERROR]", error);
      });
    }

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}

/**
 * Create and send a notification to multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  title: string,
  message: string,
  type: NotificationType,
  actionUrl?: string,
  sendEmail: boolean = true,
  sendPush: boolean = true
) {
  try {
    // Create notifications for all users
    const notificationPromises = userIds.map(userId =>
      createNotification(
        userId,
        title,
        message,
        type,
        actionUrl,
        sendEmail,
        sendPush
      )
    );
    
    const results = await Promise.allSettled(notificationPromises);
    
    // Count successful notifications
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    return {
      success: true,
      total: userIds.length,
      successful: successCount,
      failed: userIds.length - successCount
    };
  } catch (error) {
    console.error("Failed to create bulk notifications:", error);
    throw error;
  }
}
