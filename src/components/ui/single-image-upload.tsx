"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Upload, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface SingleImageUploadProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

export function SingleImageUpload({
  value,
  onChange,
  className,
  disabled = false,
}: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    try {
      setIsUploading(true)
      setImageError(false)
      
      // Create a FormData object
      const formData = new FormData()
      formData.append('file', file)
      
      // Upload the file using the API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }
      
      const data = await response.json()
      
      if (!data.url) {
        throw new Error('No URL returned from server')
      }
      
      onChange(data.url)
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    onChange("")
    setImageError(false)
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full border border-border mx-auto">
          {imageError ? (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          ) : (
            <Image
              src={value}
              alt="Profile picture"
              fill
              className="object-cover"
              unoptimized={value.startsWith('/api/image-proxy')}
              onError={handleImageError}
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-0 top-0 rounded-full bg-foreground/10 p-1 text-white hover:bg-foreground/20"
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div 
          onClick={handleButtonClick}
          className="flex h-[72px] w-[72px] cursor-pointer flex-col items-center justify-center rounded-full border border-dashed border-border bg-muted/50 p-1 transition-colors hover:bg-muted mx-auto"
        >
          <Camera className="h-6 w-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mt-1">Upload</p>
        </div>
      )}
      
      {isUploading && (
        <div className="flex items-center justify-center py-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="ml-2 text-sm">Uploading...</span>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading || disabled}
        className="hidden"
      />

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={isUploading || disabled}
        >
          <Upload className="mr-2 h-4 w-4" />
          {value ? "Change Image" : "Upload Image"}
        </Button>
      </div>
    </div>
  )
} 