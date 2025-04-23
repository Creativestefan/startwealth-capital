import type { NotificationType } from "@prisma/client"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

