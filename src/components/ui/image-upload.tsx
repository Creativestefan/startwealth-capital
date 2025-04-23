"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Upload, Plus, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  maxFiles?: number
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const files = Array.from(e.target.files)
    const remainingSlots = maxFiles - value.length
    const filesToUpload = files.slice(0, remainingSlots)

    if (filesToUpload.length === 0) return

    try {
      setIsUploading(true)
      
      // Upload each file using the server action
      const uploadPromises = filesToUpload.map(async (file) => {
        try {
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
          
          return data.url
        } catch (error) {
          console.error("Error uploading file:", error)
          return null
        }
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const validUrls = uploadedUrls.filter(url => url !== null) as string[]
      
      onChange([...value, ...validUrls])
      
      if (validUrls.length > 0) {
        toast.success(`${validUrls.length} image${validUrls.length > 1 ? 's' : ''} uploaded successfully`)
      }
      
      if (validUrls.length !== filesToUpload.length) {
        toast.error(`Failed to upload ${filesToUpload.length - validUrls.length} image${filesToUpload.length - validUrls.length > 1 ? 's' : ''}`)
      }
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error("Failed to upload images: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = (index: number) => {
    const newValue = [...value]
    newValue.splice(index, 1)
    onChange(newValue)
    
    // Also remove from imageErrors
    const newImageErrors = { ...imageErrors }
    delete newImageErrors[index]
    setImageErrors(newImageErrors)
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative aspect-square rounded-md border border-border overflow-hidden"
          >
            {imageErrors[index] ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-muted p-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="mt-1 text-center text-xs text-muted-foreground">Image failed to load</p>
              </div>
            ) : (
              <Image
                src={url}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover"
                unoptimized={url.includes('.r2.dev/')}
                onError={() => handleImageError(index)}
              />
            )}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
              disabled={disabled}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {value.length < maxFiles && (
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isUploading || disabled}
            className="flex aspect-square items-center justify-center rounded-md border border-dashed border-border bg-muted/50 transition-colors hover:bg-muted"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                <Plus className="h-6 w-6" />
                <span>Add Image</span>
              </div>
            )}
          </button>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={isUploading || disabled || value.length >= maxFiles}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {value.length} of {maxFiles} images
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={isUploading || disabled || value.length >= maxFiles}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Images
        </Button>
      </div>
    </div>
  )
} 