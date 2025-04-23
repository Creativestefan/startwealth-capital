import { prisma } from "@/lib/prisma";

/**
 * Gets all notifications for a user with pagination
 */
export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 10,
  includeRead: boolean = true
) {
  try {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId,
          ...(includeRead ? {} : { read: false }),
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: {
          userId,
          ...(includeRead ? {} : { read: false }),
        },
      }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
    };
  } catch (error) {
    console.error("[GET_USER_NOTIFICATIONS_ERROR]", error);
    throw error;
  }
}

/**
 * Gets unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string) {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  } catch (error) {
    console.error("[GET_UNREAD_COUNT_ERROR]", error);
    throw error;
  }
}

/**
 * Deletes old notifications for a user (older than specified days)
 */
export async function deleteOldNotifications(userId: string, olderThanDays: number = 30) {
  try {
    const date = new Date();
    date.setDate(date.getDate() - olderThanDays);

    return await prisma.notification.deleteMany({
      where: {
        userId,
        createdAt: {
          lt: date,
        },
        read: true,
      },
    });
  } catch (error) {
    console.error("[DELETE_OLD_NOTIFICATIONS_ERROR]", error);
    throw error;
  }
}
