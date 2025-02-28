import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { r2Client, R2_BUCKET_NAME } from "@/lib/cloudflare"
import crypto from "crypto"

export async function uploadToR2(file: File, folder = "properties"): Promise<string> {
  try {
    const buffer = await file.arrayBuffer()

    // Always use .jpg extension for better compatibility
    const randomFileName = `${crypto.randomBytes(16).toString("hex")}.jpg`
    const key = `${folder}/${randomFileName}`

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: "image/jpeg", // Force content type to be JPEG
        CacheControl: "public, max-age=31536000", // Cache for 1 year
      }),
    )

    // Use the endpoint directly
    return `${process.env.CLOUDFLARE_R2_ENDPOINT}/${key}`
  } catch (error) {
    console.error("Error uploading to R2:", error)
    throw new Error("Failed to upload file")
  }
}

export async function deleteFromR2(url: string): Promise<void> {
  try {
    const key = url.split(`${process.env.CLOUDFLARE_R2_ENDPOINT}/`)[1]

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      }),
    )
  } catch (error) {
    console.error("Error deleting from R2:", error)
    throw new Error("Failed to delete file")
  }
}

export async function uploadMultipleToR2(files: File[], folder = "properties"): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadToR2(file, folder))
  return Promise.all(uploadPromises)
}

