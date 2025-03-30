export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Initialize S3 client for Cloudflare R2 following official documentation
const ACCOUNT_ID = '3c3049b93386c9d1425392ee596bc359';
const ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";

/**
 * Generates a unique filename for uploading
 */
function generateUniqueFilename(originalFilename: string): string {
  const extension = originalFilename.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomString}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Log the file details for debugging
    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    const key = `uploads/${uniqueFilename}`;
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // Make the object publicly accessible
      ACL: 'public-read'
    });

    console.log('Uploading to R2 with:', {
      bucket: bucketName,
      key: key,
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`
    });

    await s3Client.send(command);
    
    // Generate the public URL - use the public bucket URL format
    const publicUrl = `https://${bucketName}.${ACCOUNT_ID}.r2.dev/${key}`;
    
    // For debugging
    console.log('Generated public URL:', publicUrl);
    
    // Return the direct URL
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      originalUrl: publicUrl
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
