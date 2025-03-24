"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SessionProvider } from "@/providers/session-provider"
import { ReceiptProvider } from "@/providers/receipt-provider"
import { UserProvider } from "@/providers/user-provider"

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

  return (
    <SessionProvider>
      <UserProvider>
        <ReceiptProvider>
          {children}
        </ReceiptProvider>
      </UserProvider>
    </SessionProvider>
  )
}

