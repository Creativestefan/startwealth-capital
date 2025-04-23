import type { Session } from "next-auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "./auth.config"
import crypto from "crypto"
import { prisma } from "./prisma"

export async function requireAuth() {
  const session = (await getServerSession(authConfig)) as Session | null

  if (!session) {
    redirect("/login")
  }

  return session
}

export async function requireAdmin() {
  const session = (await getServerSession(authConfig)) as Session | null

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return session
}

export async function requireKyc() {
  const session = (await getServerSession(authConfig)) as Session | null

  if (!session) {
    redirect("/login")
  }

  // If user is admin, they don't need KYC
  if (session.user.role === "ADMIN") {
    return session
  }

  // Check if KYC is approved based on the session data
  // Check for kycStatus property directly
  if (session.user.kycStatus !== "APPROVED") {
    redirect("/dashboard/profile?tab=kyc")
  }

  return session
}

// New function to check if user needs KYC
export async function checkNeedsKyc(session: Session): Promise<boolean> {
  if (!session?.user) return true

  // Admins don't need KYC
  if (session.user.role === "ADMIN") return false

  // Check for kycStatus property directly
  return session.user.kycStatus !== "APPROVED"
}

export async function auth() {
  const session = await getServerSession(authConfig)
  return session
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function storeResetToken(email: string): Promise<string> {
  const token = generateResetToken()
  const expires = new Date(Date.now() + 3600000) // 1 hour from now
  
  // Find the user first
  const user = await prisma.user.findUnique({ 
    where: { email } 
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Use a valid notification type from your enum
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SYSTEM_UPDATE", // Use a valid type from your NotificationType enum
      title: 'Password Reset',
      message: `Reset token: ${token}`, // Include token in the message
      read: false,
      actionUrl: `/reset-password?token=${token}`
    }
  });
  
  return token;
}

export async function verifyResetToken(token: string): Promise<string | null> {
  // Find the notification with the token in the message
  const notification = await prisma.notification.findFirst({
    where: {
      type: "SYSTEM_UPDATE", // Use the same type as in storeResetToken
      message: { contains: token },
      createdAt: {
        gt: new Date(Date.now() - 3600000) // Within the last hour
      }
    },
    include: {
      user: true // Include the user relation
    }
  });
  
  if (!notification) {
    return null;
  }
  
  return notification.user.email;
}

export { LoginSchema, RegisterSchema, ResetPasswordSchema } from "./auth.config"

