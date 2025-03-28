'use server'

import webpush from 'web-push';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Define types for Web Push
interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface WebPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: PushSubscriptionKeys;
}

// Configure VAPID details
webpush.setVapidDetails(
  'mailto:admin@stratwealth-capital.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

/**
 * Store push subscription for a user
 */
export async function subscribeUserToPush(userId: string, subscription: WebPushSubscription) {
  try {
    console.log("Saving push subscription for user:", userId);
    
    // Try the standard Prisma approach first
    try {
      await prisma.pushSubscription.upsert({
        where: { userId },
        create: {
          userId,
          subscription: JSON.stringify(subscription),
        },
        update: {
          subscription: JSON.stringify(subscription),
        },
      });
      
      console.log("Successfully saved push subscription using Prisma");
      return { success: true };
    } catch (prismaError) {
      console.error('Error using Prisma for push subscription:', prismaError);
      
      // Fallback to raw SQL if Prisma model access fails
      console.log("Falling back to raw SQL for push subscription...");
      
      // First check if the table exists
      try {
        // Check if PushSubscription table exists
        await prisma.$queryRaw`SELECT 1 FROM "PushSubscription" LIMIT 1;`;
        
        // If we get here, table exists, so check if the user already has a subscription
        const existingSubscription = await prisma.$queryRaw`
          SELECT * FROM "PushSubscription" WHERE "userId" = ${userId}
        `;
        
        // Type assertion for result
        const subs = existingSubscription as any[];
        
        if (subs.length > 0) {
          // Update existing subscription
          await prisma.$executeRaw`
            UPDATE "PushSubscription" 
            SET "subscription" = ${JSON.stringify(subscription)}, "updatedAt" = NOW() 
            WHERE "userId" = ${userId}
          `;
          console.log("Updated existing push subscription with raw SQL");
        } else {
          // Create new subscription
          const uuid = uuidv4(); // Generate UUID for ID
          await prisma.$executeRaw`
            INSERT INTO "PushSubscription" ("id", "userId", "subscription", "createdAt", "updatedAt")
            VALUES (${uuid}, ${userId}, ${JSON.stringify(subscription)}, NOW(), NOW())
          `;
          console.log("Created new push subscription with raw SQL");
        }
        
        return { success: true };
      } catch (tableError) {
        console.error("PushSubscription table may not exist:", tableError);
        
        // Try to create the table if it doesn't exist
        if (tableError instanceof Error && tableError.message.includes('relation "PushSubscription" does not exist')) {
          try {
            await prisma.$executeRaw`
              CREATE TABLE IF NOT EXISTS "PushSubscription" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "userId" TEXT NOT NULL UNIQUE,
                "subscription" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
              );
              
              CREATE INDEX IF NOT EXISTS "PushSubscription_userId_idx" ON "PushSubscription"("userId");
            `;
            
            // Try inserting the subscription now that the table exists
            const uuid = uuidv4(); // Generate UUID for ID
            await prisma.$executeRaw`
              INSERT INTO "PushSubscription" ("id", "userId", "subscription", "createdAt", "updatedAt")
              VALUES (${uuid}, ${userId}, ${JSON.stringify(subscription)}, NOW(), NOW())
            `;
            
            console.log("Created PushSubscription table and saved subscription");
            return { success: true };
          } catch (createTableError) {
            console.error("Failed to create PushSubscription table:", createTableError);
            throw createTableError;
          }
        }
        
        throw tableError;
      }
    }
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return { success: false, error: 'Failed to save subscription' };
  }
}

/**
 * Remove push subscription for a user
 */
export async function unsubscribeUserFromPush(userId: string) {
  try {
    console.log("Removing push subscription for user:", userId);
    
    // Try the standard Prisma approach first
    try {
      await prisma.pushSubscription.delete({
        where: { userId },
      });
      
      console.log("Successfully removed push subscription using Prisma");
      return { success: true };
    } catch (prismaError) {
      console.error('Error using Prisma for push unsubscription:', prismaError);
      
      // Fallback to raw SQL if Prisma model access fails
      console.log("Falling back to raw SQL for push unsubscription...");
      
      try {
        // Check if table exists and the subscription exists
        const result = await prisma.$queryRaw`
          SELECT COUNT(*) FROM "PushSubscription" WHERE "userId" = ${userId}
        `;
        
        // Type assertion for result
        const countResult = result as any[];
        const count = parseInt(countResult[0]?.count || '0', 10);
        
        if (count > 0) {
          // Delete the subscription
          await prisma.$executeRaw`
            DELETE FROM "PushSubscription" WHERE "userId" = ${userId}
          `;
          console.log("Removed push subscription with raw SQL");
          return { success: true };
        } else {
          console.log("No push subscription found for user:", userId);
          return { success: true }; // Return success if nothing to delete
        }
      } catch (error) {
        console.error("Error with raw SQL for push unsubscription:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return { success: false, error: 'Failed to remove subscription' };
  }
}

/**
 * Send push notification to a user
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  icon: string = '/logo.png',
  data: any = {}
) {
  try {
    // Get user subscription using raw SQL to avoid Prisma issues
    let userSubscription: any = null;
    
    try {
      // Try using Prisma first
      userSubscription = await prisma.pushSubscription.findUnique({
        where: { userId },
      });
      
    } catch (prismaError) {
      console.error('Error getting push subscription with Prisma:', prismaError);
      
      // Fallback to raw SQL
      try {
        const result = await prisma.$queryRaw`
          SELECT * FROM "PushSubscription" WHERE "userId" = ${userId}
        `;
        
        // Type assertion for result
        const subscriptions = result as any[];
        if (subscriptions.length > 0) {
          userSubscription = subscriptions[0];
        }
      } catch (error) {
        console.error('Error getting push subscription with raw SQL:', error);
        return { success: false, error: 'Could not retrieve push subscription' };
      }
    }
    
    if (!userSubscription) {
      return { success: false, error: 'No subscription found for user' };
    }
    
    const subscription = JSON.parse(userSubscription.subscription) as WebPushSubscription;
    
    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon,
      badge: '/badge.png',
      data: {
        ...data,
        dateOfArrival: Date.now(),
      },
    });
    
    // Send notification
    await webpush.sendNotification(subscription as any, payload);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

/**
 * Send push notification to all users
 */
export async function sendPushNotificationToAll(
  title: string,
  body: string,
  icon: string = '/logo.png',
  data: Record<string, any> = {}
) {
  try {
    let subscriptions: any[] = [];
    
    // Try to get subscriptions with Prisma first
    try {
      subscriptions = await prisma.pushSubscription.findMany();
    } catch (prismaError) {
      console.error('Error getting push subscriptions with Prisma:', prismaError);
      
      // Fallback to raw SQL
      try {
        const result = await prisma.$queryRaw`
          SELECT * FROM "PushSubscription"
        `;
        
        // Type assertion for result
        subscriptions = result as any[];
      } catch (sqlError) {
        console.error('Error getting push subscriptions with raw SQL:', sqlError);
        return { success: false, error: 'Could not retrieve push subscriptions' };
      }
    }
    
    if (subscriptions.length === 0) {
      return { success: false, error: 'No subscriptions found' };
    }
    
    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon,
      badge: '/badge.png',
      data: {
        ...data,
        dateOfArrival: Date.now(),
      },
    });
    
    // Send notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = JSON.parse(sub.subscription) as WebPushSubscription;
          await webpush.sendNotification(subscription as any, payload);
          return { userId: sub.userId, success: true };
        } catch (error) {
          console.error(`Error sending notification to user ${sub.userId}:`, error);
          return { userId: sub.userId, success: false, error };
        }
      })
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    
    return { 
      success: true, 
      sent: successful, 
      total: subscriptions.length,
      failed: subscriptions.length - successful
    };
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return { success: false, error: 'Failed to send notifications' };
  }
}
