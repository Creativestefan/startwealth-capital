import nodemailer from "nodemailer"

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface SendMailOptions {
  from: string
  to: string
  subject: string
  html: string
}

// Validate environment variables
const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASSWORD!,
  },
}

const transporter = nodemailer.createTransport(emailConfig)

export async function sendVerificationEmail(email: string, otp: string) {
  const mailOptions: SendMailOptions = {
    from: process.env.SMTP_FROM!,
    to: email,
    subject: "Verify your StratWealth Capital account",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale: 1.0">
          <title>Verify your StratWealth Capital account</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a1a; margin-bottom: 10px;">Verify your email</h1>
              <p style="color: #4b5563; margin-bottom: 20px;">
                Thank you for registering with StratWealth Capital. Use this verification code to complete your registration.
              </p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${otp}</span>
            </div>
            
            <div style="color: #4b5563; font-size: 14px; text-align: center;">
              <p style="margin-bottom: 10px;">
                This code will expire in 10 minutes.
              </p>
              <p style="margin-bottom: 20px;">
                If you didn't request this verification, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    // Only log SMTP connection attempt in development
    if (process.env.NODE_ENV === 'development') {
      console.log("Attempting SMTP connection to:", emailConfig.host)
    }

    // Verify SMTP connection before sending
    try {
      await transporter.verify()
      console.log("SMTP connection verified successfully")
    } catch (verifyError) {
      console.error("SMTP connection verification failed:", verifyError)
      throw new Error(`SMTP connection failed: ${verifyError instanceof Error ? verifyError.message : "Unknown error"}`)
    }

    // Send email with retry logic
    let retries = 3
    let lastError = null

    while (retries > 0) {
      try {
        const info = await transporter.sendMail(mailOptions)
        console.log("Verification email sent:", info.messageId)
        return info
      } catch (sendError) {
        lastError = sendError
        console.error(`Failed to send email (retries left: ${retries - 1}):`, sendError)
        retries--

        if (retries > 0) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error("Failed to send verification email after multiple attempts")
  } catch (error) {
    console.error("Failed to send verification email:", error)
    throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Add this function to test SMTP connection
export async function testSMTPConnection() {
  try {
    await transporter.verify()
    return { success: true, message: "SMTP connection successful" }
  } catch (error) {
    console.error("SMTP connection test failed:", error)
    return {
      success: false,
      message: "SMTP connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Verify SMTP connection on startup
transporter
  .verify()
  .then(() => console.log("SMTP connection established successfully"))
  .catch((error) => console.error("SMTP connection failed:", error))

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  const mailOptions: SendMailOptions = {
    from: process.env.SMTP_FROM!,
    to: email,
    subject: "Reset your StratWealth Capital password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale: 1.0">
          <title>Reset your StratWealth Capital password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a1a; margin-bottom: 10px;">Reset your password</h1>
              <p style="color: #4b5563; margin-bottom: 20px;">
                You requested to reset your password. Click the button below to create a new password.
              </p>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Reset Password
              </a>
            </div>
            
            <div style="color: #4b5563; font-size: 14px; text-align: center;">
              <p style="margin-bottom: 10px;">
                This link will expire in 1 hour.
              </p>
              <p style="margin-bottom: 20px;">
                If you didn't request this password reset, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    if (process.env.NODE_ENV === 'development') {
      console.log("Password reset email sent to user")
    } else {
      // In production, only log that an email was sent without details
      console.log("Password reset email sent successfully")
    }
    return info
  } catch (error) {
    console.error("Failed to send password reset email")
    throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function sendNotificationEmail(email: string, title: string, message: string, actionUrl?: string) {
  const mailOptions: SendMailOptions = {
    from: process.env.SMTP_FROM!,
    to: email,
    subject: title,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale: 1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a1a; margin-bottom: 10px;">${title}</h1>
              <p style="color: #4b5563; margin-bottom: 20px;">
                ${message}
              </p>
            </div>
            
            ${actionUrl ? `
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${actionUrl}" style="display: inline-block; background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View Details
              </a>
            </div>
            ` : ''}
            
            <div style="color: #4b5563; font-size: 14px; text-align: center;">
              <p style="margin-bottom: 20px;">
                You can view all your notifications on your dashboard.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    // Only log SMTP connection attempt in development
    if (process.env.NODE_ENV === 'development') {
      console.log("Attempting SMTP connection to:", emailConfig.host)
    }

    // Verify SMTP connection before sending
    try {
      await transporter.verify()
    } catch (verifyError) {
      console.error("SMTP connection verification failed:", verifyError)
      throw new Error(`SMTP connection failed: ${verifyError instanceof Error ? verifyError.message : "Unknown error"}`)
    }

    // Send email with retry logic
    let retries = 3
    let lastError = null

    while (retries > 0) {
      try {
        const info = await transporter.sendMail(mailOptions)
        console.log("Notification email sent:", info.messageId)
        return info
      } catch (sendError) {
        lastError = sendError
        console.error(`Failed to send notification email (retries left: ${retries - 1}):`, sendError)
        retries--

        if (retries > 0) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error("Failed to send notification email after multiple attempts")
  } catch (error) {
    console.error("Failed to send notification email:", error)
    throw new Error(`Failed to send notification email: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Function to send contact form emails
export async function sendContactFormEmail(
  firstName: string,
  lastName: string,
  email: string,
  phone: string | undefined,
  subject: string,
  message: string
) {
  const mailOptions = {
    from: process.env.SMTP_FROM!,
    to: 'support@stratwealth-capital.com',
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    // In development, just log the email content instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log('Email would be sent with:', mailOptions);
      return { success: true };
    }

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send contact form email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
