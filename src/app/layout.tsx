import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { Providers } from "./providers"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

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
      </body>
    </html>
  )
}

