import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { Providers } from "./providers"
import "@/styles/globals.css"
import { Metadata } from "next"
import { Sonner } from "@/components/ui/sonner"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "StratWealth Capital",
    template: "%s | StratWealth Capital",
  },
  description: "Secure investment platform for real estate, market investments, green energy.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script 
          src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"
          strategy="beforeInteractive"
        />
      </head>
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

