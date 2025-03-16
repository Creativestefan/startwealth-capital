import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { Providers } from "./providers"
import "@/styles/globals.css"
import { Metadata } from "next"
import { Sonner } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "StartWealth Capital",
    template: "%s | StartWealth Capital",
  },
  description: "Invest in real estate, green energy, and market opportunities.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <Sonner />
      </body>
    </html>
  )
}

