import React from "react"
import { requireAuth } from "@/lib/auth-utils"

export default async function KycLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure user is authenticated
  await requireAuth()

  return <>{children}</>
} 