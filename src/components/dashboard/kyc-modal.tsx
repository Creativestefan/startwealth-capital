"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShieldAlert, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface KycModalProps {
  autoOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function KycModal({ autoOpen = false, open: externalOpen, onOpenChange }: KycModalProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [internalOpen, setInternalOpen] = useState(autoOpen)

  // Determine if the component is controlled or uncontrolled
  const isControlled = externalOpen !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? externalOpen : internalOpen

  // Handle autoOpen changes
  useEffect(() => {
    if (!isControlled) {
      setInternalOpen(autoOpen)
    }
  }, [autoOpen, isControlled])

  // Handle open state changes
  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    } else if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      // Call the session refresh API
      const response = await fetch("/api/auth/session-refresh?callbackUrl=" + encodeURIComponent(window.location.href))

      if (response.ok) {
        // If successful, refresh the page
        router.refresh()
        // Close the modal
        handleOpenChange(false)
      } else {
        console.error("Failed to refresh session")
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
    } finally {
      // Wait a bit before allowing another refresh
      setTimeout(() => {
        setIsRefreshing(false)
      }, 1000)
    }
  }

  const handleCompleteKyc = () => {
    // Navigate to the KYC completion page
    router.push("/profile/kyc")
    handleOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <ShieldAlert className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-center pt-4">KYC Verification Required</DialogTitle>
          <DialogDescription className="text-center">
            You need to complete KYC verification before you can make investments or purchase properties.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 text-center">
          <p>KYC (Know Your Customer) verification helps us comply with regulations and protect our users.</p>
          <p className="text-sm text-muted-foreground">
            The verification process is quick and secure. You'll need to provide your country of residence and upload a
            valid government-issued ID.
          </p>
          <div className="text-sm text-blue-600">
            <Button variant="link" onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-1">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Already completed KYC? Refresh status"}
            </Button>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center sm:space-x-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCompleteKyc}>Complete KYC Verification</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

