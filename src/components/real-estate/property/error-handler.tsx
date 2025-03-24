"use client"

import { useEffect } from "react"
import { toast } from "sonner"

interface ErrorHandlerProps {
  error?: string
}

/**
 * Client component to handle error messages via toast notifications
 */
export function ErrorHandler({ error }: ErrorHandlerProps) {
  useEffect(() => {
    if (error === "property-not-found") {
      toast.error("Property not found", {
        description: "The property you were looking for could not be found or may have been removed."
      })
    }
  }, [error])

  // This component doesn't render anything visible
  return null
} 