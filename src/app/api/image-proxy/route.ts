export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

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

export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query parameter
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }
    
    // Extract the key from the URL
    // The URL format is like: https://startwealth.3c3049b93386c9d1425392ee596bc359.r2.cloudflarestorage.com/uploads/1741565349208-jualz3ee2k.jpg
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // The key should be everything after the first slash
    const key = pathParts.slice(1).join('/');
    
    console.log('Fetching image with key:', key);
    
    // Use the S3 client to get the object directly
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 404 });
    }
    
    // Convert the readable stream to a buffer
    const chunks = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Return the image with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json({ 
      error: 'Failed to proxy image',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 