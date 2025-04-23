export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update user's profile to remove the avatar URL
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        image: null,
      },
    });
    
    // Return success response without invalidating the session
    return NextResponse.json({ 
      success: true, 
      message: 'Avatar removed successfully',
      timestamp: Date.now() // Add timestamp to ensure browser doesn't cache avatar state
    });
  } catch (error) {
    console.error('Error removing avatar:', error);
    return NextResponse.json({ 
      error: 'Failed to remove avatar',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 