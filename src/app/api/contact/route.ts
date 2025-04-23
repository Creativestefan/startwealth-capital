export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, subject, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email using the function from mail.ts
    const result = await sendContactFormEmail(
      firstName,
      lastName,
      email,
      phone,
      subject,
      message
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to send message');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}
