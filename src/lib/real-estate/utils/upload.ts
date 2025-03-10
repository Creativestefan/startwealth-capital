'use server'

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";

/**
 * Generates a unique filename for uploading to R2
 */
export function generateUniqueFilename(originalFilename: string): string {
  const extension = originalFilename.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Gets a presigned URL for uploading a file to R2
 */
export async function getPresignedUploadUrl(filename: string, contentType: string): Promise<{ uploadURL: string, key: string }> {
  const key = `uploads/${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return {
    uploadURL,
    key
  };
}

/**
 * Uploads a file to R2 using a presigned URL
 * This function is meant to be called from the client
 */
export async function uploadFileToR2(file: File): Promise<string | null> {
  try {
    const uniqueFilename = generateUniqueFilename(file.name);
    const { uploadURL, key } = await getPresignedUploadUrl(uniqueFilename, file.type);
    
    // Upload the file directly to R2 using the presigned URL
    const uploadResponse = await fetch(uploadURL, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      }
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
    }

    // Return the public URL to the uploaded file
    const publicUrl = `${process.env.CLOUDFLARE_R2_ENDPOINT}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

/**
 * Uploads multiple files to R2
 * This function is meant to be called from the client
 */
export async function uploadMultipleFiles(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFileToR2(file));
  const results = await Promise.all(uploadPromises);
  
  // Filter out any null results (failed uploads)
  return results.filter(url => url !== null) as string[];
}

/**
 * Deletes a file from R2
 * This function is meant to be called from the server
 */
export async function deleteFileFromR2(fileUrl: string): Promise<boolean> {
  try {
    // Extract the key from the URL
    const urlObj = new URL(fileUrl);
    const key = urlObj.pathname.substring(1); // Remove leading slash
    
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
} 