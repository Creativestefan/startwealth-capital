export const dynamic = 'force-dynamic';
import { generateOTP, storeOTP, getOTPStatus } from "@/lib/otp"
import { sendVerificationEmail, testSMTPConnection } from "@/lib/mail"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log("OTP request received for:", email)

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 })
    }

    // Check current OTP status
    const currentStatus = getOTPStatus(email)
    console.log("Current OTP status:", currentStatus)

    // Test SMTP connection first
    const smtpTest = await testSMTPConnection()
    if (!smtpTest.success) {
      console.error("SMTP connection test failed:", smtpTest.error)
      return Response.json(
        {
          error: "Email service is currently unavailable. Please try again later.",
          details: smtpTest.error,
        },
        { status: 500 },
      )
    }

    const otp = generateOTP()
    storeOTP(email, otp)
    console.log(`New OTP generated for ${email}: ${otp}`)

    try {
      await sendVerificationEmail(email, otp)
      console.log(`Verification email sent to ${email}`)
      return Response.json({
        message: "OTP sent successfully",
        debug: {
          otpStatus: getOTPStatus(email),
        },
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      return Response.json(
        {
          error: "Failed to send verification email. Please try again later.",
          details: emailError instanceof Error ? emailError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Failed to process OTP request:", error)
    return Response.json(
      {
        error: "Failed to send OTP",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

