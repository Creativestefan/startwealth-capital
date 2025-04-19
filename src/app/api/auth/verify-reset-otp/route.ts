export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return Response.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return Response.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    if (user.resetOtp !== otp) {
      return Response.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (user.resetOtpExpires < new Date()) {
      return Response.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Do NOT clear the OTP here - it's needed for the password reset step
    // The OTP will be cleared after successful password reset

    // For now, just return success. In production, return a short-lived token for password reset.
    return Response.json({ message: "OTP verified. You may now reset your password." });
  } catch (error) {
    console.error("Failed to verify reset OTP:", error);
    return Response.json({ error: "Failed to verify reset OTP" }, { status: 500 });
  }
} 