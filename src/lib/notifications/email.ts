import { NotificationType } from "@prisma/client";
import { getNotificationEmailTemplate } from "./email/templates";
import { prisma } from "@/lib/prisma";

/**
 * Send notification email to a user
 */
export async function sendNotificationEmail(
  email: string,
  title: string,
  message: string,
  type: NotificationType,
  actionUrl?: string,
  actionText: string = "View Details"
) {
  try {
    // Get user details for personalized email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        firstName: true, 
        lastName: true,
        id: true,
        notificationPreferences: true
      }
    });

    if (!user) {
      console.warn(`Cannot send email to unknown user: ${email}`);
      return false;
    }
    
    // Check if user has email notifications enabled
    if (user.notificationPreferences) {
      // First check if emails are globally enabled
      if (!user.notificationPreferences.emailEnabled) {
        console.log(`User ${email} has disabled email notifications`);
        return false;
      }
      
      // Then check specific notification type
      switch (type) {
        case 'INVESTMENT_MATURED':
          if (!user.notificationPreferences.investmentNotifications) return false;
          break;
        case 'PAYMENT_DUE':
          if (!user.notificationPreferences.paymentNotifications) return false;
          break;
        case 'KYC_STATUS':
          if (!user.notificationPreferences.kycNotifications) return false;
          break;
        case 'REFERRAL_COMPLETED':
          if (!user.notificationPreferences.referralNotifications) return false;
          break;
        case 'WALLET_UPDATED':
          if (!user.notificationPreferences.walletNotifications) return false;
          break;
        case 'COMMISSION_EARNED':
        case 'COMMISSION_PAID':
          if (!user.notificationPreferences.commissionNotifications) return false;
          break;
        case 'SYSTEM_UPDATE':
          if (!user.notificationPreferences.systemNotifications) return false;
          break;
        case 'PASSWORD_CHANGED':
        case 'PROFILE_UPDATED':
          if (!user.notificationPreferences.securityNotifications) return false;
          break;
      }
    }

    const userName = user ? `${user.firstName} ${user.lastName}` : undefined;

    // Generate email content
    const emailContent = getNotificationEmailTemplate(type, {
      title,
      message,
      actionUrl,
      actionText,
      userName
    });

    // Send email using your email service
    await sendEmail({
      to: email,
      subject: title,
      html: emailContent
    });

    return true;
  } catch (error) {
    console.error("Error sending notification email:", error);
    return false;
  }
}

/**
 * Send notification email to multiple users
 */
export async function sendBulkNotificationEmails(
  emails: string[],
  title: string,
  message: string,
  type: NotificationType,
  actionUrl?: string,
  actionText: string = "View Details"
) {
  try {
    // Get users details for personalized emails
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, firstName: true, lastName: true }
    });

    // Create email sending tasks
    const emailTasks = users.map(async (user) => {
      const userName = `${user.firstName} ${user.lastName}`;
      
      // Generate email content
      const emailContent = getNotificationEmailTemplate(type, {
        title,
        message,
        actionUrl,
        actionText,
        userName
      });

      // Send email
      return sendEmail({
        to: user.email,
        subject: title,
        html: emailContent
      });
    });

    // Execute all email sending tasks
    await Promise.allSettled(emailTasks);

    return true;
  } catch (error) {
    console.error("Error sending bulk notification emails:", error);
    return false;
  }
}

/**
 * Email sending interface
 */
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using your email service provider
 */
async function sendEmail(options: EmailOptions) {
  const defaultFrom = process.env.NOTIFICATION_EMAIL_FROM || 'noreply@stratwealthcapital.online';
  
  try {
    // Import nodemailer dynamically to avoid server-side issues
    const nodemailer = require('nodemailer');
    
    // Determine which SMTP configuration to use based on the from address
    let transportConfig;
    
    if (options.from === defaultFrom || !options.from) {
      // Use notification-specific SMTP settings if available
      transportConfig = {
        host: process.env.NOTIFICATION_SMTP_HOST || process.env.SMTP_HOST,
        port: Number(process.env.NOTIFICATION_SMTP_PORT || process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.NOTIFICATION_SMTP_USER || defaultFrom,
          pass: process.env.NOTIFICATION_SMTP_PASSWORD || '',
        }
      };
    } else {
      // Use default SMTP settings for other emails
      transportConfig = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      };
    }
    
    // Create transporter with the selected configuration
    const transporter = nodemailer.createTransport(transportConfig);
    
    // Send email
    await transporter.sendMail({
      from: options.from || defaultFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    
    if (process.env.NODE_ENV === 'development') {
      // In development, log with redacted email address
      const redactedEmail = options.to.replace(/(.{2})(.*)(@.*)/, '$1***$3');
      console.log(`Email sent to ${redactedEmail}`);
    } else {
      // In production, only log that an email was sent without recipient details
      console.log(`Notification email sent successfully`);
    }
    return true;
  } catch (error) {
    console.error('Error sending email');
    
    if (process.env.NODE_ENV === 'development') {
      // Only log minimal debugging info in development
      console.log(`Failed to send notification email`);
    }
    
    return false;
  }
} 