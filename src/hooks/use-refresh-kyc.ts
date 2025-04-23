"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

/**
 * Custom hook to refresh the KYC status from the server
 * Use this hook when you need to check if the KYC status has changed
 * For example, after an admin approves a KYC submission
 */
export function useRefreshKyc() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { update } = useSession()
  const router = useRouter()

  const refreshKycStatus = useCallback(async () => {
    try {
      setIsRefreshing(true)

      // Call the session refresh endpoint
      const response = await fetch("/api/auth/session-refresh")
      
      if (!response.ok) {
        throw new Error("Failed to refresh KYC status")
      }

      const userData = await response.json()
      
      // Update the session with the latest KYC status
      await update({
        ...userData,
      })

      // Refresh the page to reflect the latest KYC status
      router.refresh()
      
      // Show success toast
      toast.success("KYC status updated", {
        description: "Your verification status has been refreshed."
      })
      
      return userData.kycStatus
    } catch (error) {
      console.error("Error refreshing KYC status:", error)
      
      // Show error toast
      toast.error("Failed to refresh KYC status", {
        description: "Please try again later."
      })
      
      return null
    } finally {
      setIsRefreshing(false)
    }
  }, [update, router])

  return { refreshKycStatus, isRefreshing }
} 