import React from "react"
import { requireAuth } from "@/lib/auth-utils"

export default async function PasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure user is authenticated
  await requireAuth()

  return <>{children}</>
} 