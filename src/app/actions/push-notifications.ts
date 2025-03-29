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

// Check if VAPID keys are configured
const isWebPushConfigured = !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

// Configure VAPID details only if the keys are available
if (isWebPushConfigured) {
  try {
    webpush.setVapidDetails(
      'mailto:admin@stratwealth-capital.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    console.log('Web Push configured successfully');
  } catch (error) {
    console.error('Failed to configure Web Push:', error);
  }
}

/**
 * Store push subscription for a user
 */
export async function subscribeUserToPush(userId: string, subscription: WebPushSubscription) {
  // If web push is not configured, return early
  if (!isWebPushConfigured) {
    console.log('Web Push not configured, skipping subscription');
    return { success: false, error: 'Web Push not configured' };
  }

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
  // If web push is not configured, return early
  if (!isWebPushConfigured) {
    console.log('Web Push not configured, skipping unsubscription');
    return { success: false, error: 'Web Push not configured' };
  }

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
  data: unknown = {}
) {
  // If web push is not configured, return early
  if (!isWebPushConfigured) {
    console.log('Web Push not configured, skipping notification');
    return { success: false, error: 'Web Push not configured' };
  }

  try {
    // Get user subscription using raw SQL to avoid Prisma issues
    let userSubscription: unknown = null;
    
    try {
      // Try using Prisma first
      userSubscription = await prisma.pushSubscription.findUnique({
        where: { userId },
      });
      
      if (!userSubscription) {
        console.log(`No push subscription found for user: ${userId}`);
        return { success: false, error: 'No subscription found' };
      }
    } catch (prismaError) {
      console.error('Error using Prisma to find push subscription:', prismaError);
      
      // Fallback to raw SQL
      try {
        const result = await prisma.$queryRaw`
          SELECT * FROM "PushSubscription" WHERE "userId" = ${userId} LIMIT 1
        `;
        
        // Type assertion for result
        const subscriptions = result as any[];
        
        if (subscriptions.length === 0) {
          console.log(`No push subscription found for user: ${userId}`);
          return { success: false, error: 'No subscription found' };
        }
        
        userSubscription = subscriptions[0];
      } catch (sqlError) {
        console.error('Error with raw SQL to find push subscription:', sqlError);
        return { success: false, error: 'Failed to find subscription' };
      }
    }
    
    // Extract the subscription JSON
    const subscription = typeof userSubscription === 'object' && userSubscription !== null
      ? (userSubscription as any).subscription
      : null;
      
    if (!subscription) {
      console.error('Invalid subscription format for user:', userId);
      return { success: false, error: 'Invalid subscription format' };
    }
    
    // Parse the subscription JSON if it's a string
    const parsedSubscription = typeof subscription === 'string'
      ? JSON.parse(subscription)
      : subscription;
    
    // Prepare the notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon,
      data,
      badge: '/logo-small.png',
      timestamp: Date.now(),
    });
    
    // Send the notification
    const result = await webpush.sendNotification(parsedSubscription, payload);
    
    console.log(`Push notification sent to user ${userId}:`, result.statusCode);
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
  // If web push is not configured, return early
  if (!isWebPushConfigured) {
    console.log('Web Push not configured, skipping notification to all users');
    return { success: false, error: 'Web Push not configured' };
  }

  try {
    // Get all push subscriptions
    let subscriptions: any[] = [];
    
    try {
      // Try using Prisma first
      subscriptions = await prisma.pushSubscription.findMany();
    } catch (prismaError) {
      console.error('Error using Prisma to find all push subscriptions:', prismaError);
      
      // Fallback to raw SQL
      try {
        const result = await prisma.$queryRaw`
          SELECT * FROM "PushSubscription"
        `;
        
        // Type assertion for result
        subscriptions = result as any[];
      } catch (sqlError) {
        console.error('Error with raw SQL to find all push subscriptions:', sqlError);
        return { success: false, error: 'Failed to find subscriptions' };
      }
    }
    
    if (subscriptions.length === 0) {
      console.log('No push subscriptions found');
      return { success: false, error: 'No subscriptions found' };
    }
    
    // Prepare the notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon,
      data,
      badge: '/logo-small.png',
      timestamp: Date.now(),
    });
    
    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          // Extract the subscription JSON
          const subscription = typeof sub === 'object' && sub !== null
            ? sub.subscription
            : null;
            
          if (!subscription) {
            throw new Error('Invalid subscription format');
          }
          
          // Parse the subscription JSON if it's a string
          const parsedSubscription = typeof subscription === 'string'
            ? JSON.parse(subscription)
            : subscription;
          
          // Send the notification
          return await webpush.sendNotification(parsedSubscription, payload);
        } catch (error) {
          console.error('Error sending individual push notification:', error);
          throw error;
        }
      })
    );
    
    // Count successful notifications
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`Push notifications sent to ${successful}/${subscriptions.length} users`);
    return { 
      success: true,
      total: subscriptions.length,
      successful,
      failed: subscriptions.length - successful
    };
  } catch (error) {
    console.error('Error sending push notifications to all users:', error);
    return { success: false, error: 'Failed to send notifications' };
  }
}
