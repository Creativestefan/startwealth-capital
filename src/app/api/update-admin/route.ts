import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This makes the route compatible with static exports
export const dynamic = 'force-static';

export async function GET() {
  try {
    // Update admin user to ensure emailVerified is set
    const admin = await prisma.user.update({
      where: { email: "admin@startwealth.com" },
      data: { 
        emailVerified: new Date()
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Admin user updated with ID: ${admin.id}`,
      emailVerified: admin.emailVerified ? 'Verified' : 'Not Verified'
    });
  } catch (error) {
    console.error("Error during admin update:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
