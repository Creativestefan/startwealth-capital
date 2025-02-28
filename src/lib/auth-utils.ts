import type { Session } from "next-auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "./auth.config"

export async function requireAuth() {
  const session = (await getServerSession(authConfig)) as Session | null

  if (!session) {
    redirect("/auth/login")
  }

  return session
}

export async function requireAdmin() {
  const session = (await getServerSession(authConfig)) as Session | null

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/login")
  }

  return session
}

export async function requireKyc() {
  const session = (await getServerSession(authConfig)) as Session | null

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.kycStatus !== "APPROVED") {
    redirect("/dashboard/kyc")
  }

  return session
}

