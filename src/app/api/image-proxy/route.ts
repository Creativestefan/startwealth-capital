export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

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

export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query parameter
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }
    
    // Extract the key from the URL
    let key;
    try {
      // Log the URL for debugging
      console.log('Image proxy URL received:', url);
      
      // Extract the key using the domain pattern
      const domainPattern = new RegExp(`https://${bucketName}\.${ACCOUNT_ID}\.r2\.cloudflarestorage\.com/(.*)`); 
      const match = url.match(domainPattern);
      
      if (!match || !match[1]) {
        throw new Error('Could not extract key from URL');
      }
      
      key = match[1];
      console.log('Extracted key:', key);
      
    } catch (error) {
      console.error('Error parsing URL:', error);
      return NextResponse.json({ 
        error: 'Invalid URL format',
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 400 });
    }
    
    // Get the object from R2
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    console.log('Fetching from R2:', { bucket: bucketName, key });
    
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // Convert the stream to a buffer
    const chunks = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Return the image with the appropriate content type
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch image',
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}