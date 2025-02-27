"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SessionProvider } from "@/providers/session-provider"

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  // Add client-side only rendering to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <SessionProvider>{children}</SessionProvider>
}

