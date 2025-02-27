import type React from "react"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-16">{children}</main>
      <Footer />
    </div>
  )
}

