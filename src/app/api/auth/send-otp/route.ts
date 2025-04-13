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

    // Create a timeout promise to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Email sending timed out after 15 seconds")), 15000)
    );

    // Generate OTP first (this is fast and shouldn't timeout)
    const otp = generateOTP()
    storeOTP(email, otp)
    console.log(`New OTP generated for ${email}: ${otp}`)

    try {
      // Test SMTP connection with timeout
      const smtpTestPromise = testSMTPConnection();
      const smtpTest = await Promise.race([
        smtpTestPromise,
        timeoutPromise
      ]) as { success: boolean; error?: string; message?: string };
      
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

      // Send email with timeout
      try {
        await Promise.race([
          sendVerificationEmail(email, otp),
          timeoutPromise
        ]);
        
        console.log(`Verification email sent to ${email}`)
        return Response.json({
          message: "OTP sent successfully",
          debug: {
            otpStatus: getOTPStatus(email),
          },
        })
      } catch (emailError: any) {
        if (emailError.message && emailError.message.includes("timed out")) {
          console.error("Email sending timed out:", emailError)
          return Response.json(
            {
              success: true, // Return success despite email failure
              message: "Registration successful but email verification could not be sent. Please use the 'Resend verification' option if needed.",
              error: "Email service timed out, but your account was created successfully.",
            },
            { status: 200 },
          )
        }

        console.error("Email sending failed:", emailError)
        return Response.json(
          {
            error: "Failed to send verification email. Please try again later.",
            details: emailError instanceof Error ? emailError.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    } catch (error: any) {
      // Handle timeout or other errors in the SMTP test
      if (error.message && error.message.includes("timed out")) {
        console.error("Operation timed out:", error)
        return Response.json(
          {
            success: true, // Return success despite email failure
            message: "Registration successful but email verification could not be sent. Please use the 'Resend verification' option if needed.",
            error: "Email service timed out, but your account was created successfully.",
          },
          { status: 200 },
        )
      }

      console.error("SMTP test failed:", error)
      return Response.json(
        {
          error: "Email service is currently unavailable. Please try again later.",
          details: error instanceof Error ? error.message : "Unknown error",
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

