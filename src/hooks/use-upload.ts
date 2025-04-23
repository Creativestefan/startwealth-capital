"use client"

import { useState } from "react"
import { toast } from "sonner"

interface UseUploadOptions {
  folder?: string
  onSuccess?: (url: string) => void
  onError?: (error: Error) => void
}

export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true)

      // Log file details for debugging
      console.log("Uploading file:", {
        name: file.name,
        type: file.type,
        size: file.size,
      })

      const formData = new FormData()
      formData.append("file", file)
      if (options.folder) {
        formData.append("folder", options.folder)
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      // Log response status for debugging
      console.log("Upload response status:", response.status)

      const responseText = await response.text()

      // Try to parse as JSON if possible
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        // If not JSON, use text as error message
        if (!response.ok) {
          throw new Error(responseText || "Upload failed")
        }
      }

      if (!response.ok) {
        throw new Error(data?.error || responseText || "Upload failed")
      }

      if (!data?.url) {
        throw new Error("No URL returned from upload")
      }

      options.onSuccess?.(data.url)
      return data.url
    } catch (error) {
      console.error("Upload error:", error)
      const message = error instanceof Error ? error.message : "Failed to upload file"
      toast.error(message)
      options.onError?.(error as Error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const uploadMultiple = async (files: File[]) => {
    const urls = await Promise.all(files.map((file) => uploadFile(file)))
    return urls
  }

  return {
    uploadFile,
    uploadMultiple,
    isUploading,
  }
}

