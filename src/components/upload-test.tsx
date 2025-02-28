"use client"

import { useState } from "react"
import { useUpload } from "@/hooks/use-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function UploadTest() {
  const [uploadedUrl, setUploadedUrl] = useState<string>("")
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (url) => {
      setUploadedUrl(url)
      toast.success("File uploaded successfully!")
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await uploadFile(file)
    } catch (error) {
      console.error("Upload failed:", error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>R2 Upload Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="file-upload"
          />
          <Button
            asChild
            variant="outline"
            disabled={isUploading}
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              {isUploading ? "Uploading..." : "Select File"}
            </label>
          </Button>
        </div>

        {uploadedUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Uploaded File URL:</p>
            <p className="text-sm break-all">{uploadedUrl}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(uploadedUrl, '_blank')}
            >
              Open in New Tab
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
