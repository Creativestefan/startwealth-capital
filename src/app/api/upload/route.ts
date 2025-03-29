export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";

/**
 * Generates a unique filename for uploading to R2
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
    });

    await s3Client.send(command);
    
    // Generate the public URL
    const publicUrl = `https://${bucketName}.${process.env.CLOUDFLARE_R2_ENDPOINT}/uploads/${uniqueFilename}`;
    
    // Generate a proxied URL that goes through our API
    const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(publicUrl)}`;
    
    return NextResponse.json({ 
      success: true, 
      url: proxiedUrl,
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

