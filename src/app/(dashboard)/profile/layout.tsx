import React from "react"
import { requireAuth } from "@/lib/auth-utils"

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure user is authenticated
  await requireAuth()

  return <>{children}</>
} 