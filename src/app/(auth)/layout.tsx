import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex min-h-svh flex-col">{children}</div>
}

