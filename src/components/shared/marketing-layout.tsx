"use client"

import React from 'react'
import { ClientHeader } from './client-header'
import { Footer } from './footer'
import { Sonner } from "@/components/ui/sonner"
import { SessionProvider } from 'next-auth/react'

interface MarketingLayoutProps {
  children: React.ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <SessionProvider>
      <div className="flex min-h-svh flex-col">
        <ClientHeader />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Sonner />
      </div>
    </SessionProvider>
  )
}
