'use server'

import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { UnauthorizedError } from "@/lib/errors"

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
})

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || ""

// Log configuration for debugging
console.log("R2 Configuration:", {
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
})

/**
 * Generates a unique filename for uploading to R2
 */
function generateUniqueFilename(originalFilename: string): string {
  const extension = originalFilename.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomString}.${extension}`
}

/**
 * Gets a presigned URL for uploading a file to R2
 * This is a server action that can be called from the client
 */
export async function getPresignedUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadURL: string; key: string; publicUrl: string }> {
  try {
    console.log("getPresignedUploadUrl called with:", { filename, contentType })
    
    // Check if user is authenticated
    const session = await getServerSession(authConfig)
    console.log("Session:", session ? "Authenticated" : "Not authenticated")
    
    if (!session) {
      throw new UnauthorizedError("You must be logged in to upload files")
    }

    // Validate inputs
    if (!filename) throw new Error("Filename is required")
    if (!contentType) throw new Error("Content type is required")
    if (!bucketName) throw new Error("Bucket name is not configured")
    
    const uniqueFilename = generateUniqueFilename(filename)
    const key = `uploads/${uniqueFilename}`
    console.log("Generated key:", key)

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    })

    console.log("Getting signed URL...")
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    console.log("Got signed URL:", uploadURL)
    
    // For public URL, we need to ensure we have the correct format
    // The public URL should be in the format that's accessible from the browser
    // This will depend on your R2 configuration
    const publicUrl = `https://${bucketName}.${process.env.CLOUDFLARE_R2_ENDPOINT}/uploads/${uniqueFilename}`
    console.log("Public URL:", publicUrl)

    return {
      uploadURL,
      key,
      publicUrl,
    }
  } catch (error) {
    console.error("Error in getPresignedUploadUrl:", error)
    throw error
  }
}

/**
 * Deletes a file from R2
 * This is a server action that can be called from the client
 */
export async function deleteFileFromR2(fileUrl: string): Promise<boolean> {
  try {
    console.log("deleteFileFromR2 called with:", fileUrl)
    
    // Check if user is authenticated
    const session = await getServerSession(authConfig)
    console.log("Session:", session ? "Authenticated" : "Not authenticated")
    
    if (!session) {
      throw new UnauthorizedError("You must be logged in to delete files")
    }

    // Validate inputs
    if (!fileUrl) throw new Error("File URL is required")
    if (!bucketName) throw new Error("Bucket name is not configured")
    
    // Extract the key from the URL
    const urlObj = new URL(fileUrl)
    const key = urlObj.pathname.substring(1) // Remove leading slash
    console.log("Extracted key:", key)

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    console.log("Deleting file...")
    await s3Client.send(command)
    console.log("File deleted successfully")
    
    return true
  } catch (error) {
    console.error("Error in deleteFileFromR2:", error)
    return false
  }
} 