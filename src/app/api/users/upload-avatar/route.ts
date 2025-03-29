export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

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
function generateUniqueFilename(originalFilename: string, userId: string): string {
  const extension = originalFilename.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  return `avatars/${userId}/${timestamp}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File is too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' }, { status: 400 });
    }

    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename(file.name, session.user.id);
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFilename,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);
    
    // Generate the public URL
    const publicUrl = `https://${bucketName}.${process.env.CLOUDFLARE_R2_ENDPOINT}/${uniqueFilename}`;
    
    // Generate a proxied URL that goes through our API
    const imageUrl = `/api/image-proxy?url=${encodeURIComponent(publicUrl)}`;
    
    // Update user's profile with the new avatar URL
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        image: imageUrl,
      },
    });
    
    // Return success response without invalidating the session
    return NextResponse.json({ 
      success: true, 
      message: 'Avatar uploaded successfully',
      imageUrl: imageUrl,
      timestamp: Date.now() // Add timestamp to ensure browser doesn't cache the old image
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ 
      error: 'Failed to upload avatar',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 