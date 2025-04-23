"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { 
  QueryClient, 
  QueryClientProvider
} from "@tanstack/react-query"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [queryClient] = useState(() => new QueryClient())

  // Wait for user data before rendering
  useEffect(() => {
    if (!loading && !session) {
      window.location.href = "/login"
    }
  }, [session, loading])

  if (loading || !session) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
} 