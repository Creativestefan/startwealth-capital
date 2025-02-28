"use client"

import { useState } from "react"
import { useUpload } from "@/hooks/use-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function UploadTest() {
  const [uploadedUrl, setUploadedUrl] = useState<string>("")
  const { uploadFile, isUploading } = useUpload()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadFile(file)
      setUploadedUrl(url)
      toast.success("File uploaded successfully!")
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("Upload failed. Please try again.")
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
            <div className="rounded-lg overflow-hidden border">
              <img 
                src={uploadedUrl || "/placeholder.svg"} 
                alt="Uploaded file preview" 
                className="w-full h-auto"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
