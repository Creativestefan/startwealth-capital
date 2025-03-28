import { NotificationType } from "@prisma/client";

interface NotificationTemplateData {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  userName?: string;
}

/**
 * Generate HTML email template for notification
 */
export function getNotificationEmailTemplate(
  type: NotificationType,
  data: NotificationTemplateData
): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eaeaea;
        }
        .logo {
          max-width: 120px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eaeaea;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          margin: 15px 0;
          font-size: 16px;
          color: #ffffff;
          background-color: #0056b3;
          border-radius: 5px;
          text-decoration: none;
          text-align: center;
        }
        .alert {
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .alert-info {
          background-color: #e8f4fd;
          border-left: 4px solid #0056b3;
        }
        .alert-success {
          background-color: #eafaef;
          border-left: 4px solid #28a745;
        }
        .alert-warning {
          background-color: #fff8e6;
          border-left: 4px solid #ffc107;
        }
        h2 {
          color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://stratwealth-capital.com/logo.png" alt="Stratwealth Capital" class="logo">
          <h2>${data.title}</h2>
        </div>
        <div class="content">
          ${getSpecificTemplateContent(type, data)}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Stratwealth Capital. All rights reserved.</p>
          <p>If you didn't request this email, please ignore it or contact our support team.</p>
          <p>
            <a href="https://stratwealth-capital.com/privacy">Privacy Policy</a> | 
            <a href="https://stratwealth-capital.com/terms">Terms of Service</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return baseTemplate;
}

/**
 * Get content specific to notification type
 */
function getSpecificTemplateContent(
  type: NotificationType,
  data: NotificationTemplateData
): string {
  const greeting = data.userName 
    ? `<p>Hello ${data.userName},</p>` 
    : '<p>Hello,</p>';

  const actionButton = data.actionUrl && data.actionText
    ? `<a href="${data.actionUrl}" class="btn">${data.actionText}</a>`
    : '';

  switch (type) {
    case 'INVESTMENT_MATURED':
      return `
        ${greeting}
        <div class="alert alert-success">
          <p>Great news! One of your investments has matured.</p>
        </div>
        <p>${data.message}</p>
        <p>You can now withdraw your funds to your wallet or reinvest to earn more.</p>
        ${actionButton}
        <p>Thank you for investing with Stratwealth Capital.</p>
      `;

    case 'PAYMENT_DUE':
      return `
        ${greeting}
        <div class="alert alert-warning">
          <p>This is a reminder that your payment is due soon.</p>
        </div>
        <p>${data.message}</p>
        <p>Please ensure you have enough funds in your wallet to cover the upcoming payment.</p>
        ${actionButton}
        <p>Thank you for your attention to this matter.</p>
      `;

    case 'KYC_STATUS':
      return `
        ${greeting}
        <div class="alert alert-info">
          <p>There has been an update to your KYC verification status.</p>
        </div>
        <p>${data.message}</p>
        ${actionButton}
        <p>If you have any questions, please contact our support team.</p>
      `;

    case 'REFERRAL_COMPLETED':
      return `
        ${greeting}
        <div class="alert alert-success">
          <p>Congratulations! You've earned a commission from a referral.</p>
        </div>
        <p>${data.message}</p>
        <p>Keep sharing your referral link to earn more commissions!</p>
        ${actionButton}
        <p>Thank you for being a valued member of our community.</p>
      `;

    case 'WALLET_UPDATED':
      return `
        ${greeting}
        <div class="alert alert-info">
          <p>Your wallet has been updated.</p>
        </div>
        <p>${data.message}</p>
        ${actionButton}
        <p>If you didn't make this transaction, please contact our support team immediately.</p>
      `;

    case 'COMMISSION_EARNED':
      return `
        ${greeting}
        <div class="alert alert-success">
          <p>Congratulations! You've earned a commission.</p>
        </div>
        <p>${data.message}</p>
        ${actionButton}
        <p>Thank you for being a valuable partner.</p>
      `;

    case 'COMMISSION_PAID':
      return `
        ${greeting}
        <div class="alert alert-info">
          <p>A commission payment has been processed.</p>
        </div>
        <p>${data.message}</p>
        ${actionButton}
        <p>Thank you for your business with Stratwealth Capital.</p>
      `;

    case 'PASSWORD_CHANGED':
      return `
        ${greeting}
        <div class="alert alert-info">
          <p>Your password was recently changed.</p>
        </div>
        <p>${data.message}</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        ${actionButton}
      `;

    case 'PROFILE_UPDATED':
      return `
        ${greeting}
        <div class="alert alert-info">
          <p>Your profile information has been updated.</p>
        </div>
        <p>${data.message}</p>
        <p>If you didn't make these changes, please contact our support team immediately.</p>
        ${actionButton}
      `;

    // Default case for other notification types
    default:
      return `
        ${greeting}
        <p>${data.message}</p>
        ${actionButton}
        <p>Thank you for using Stratwealth Capital.</p>
      `;
  }
}

// Base email template
export function getBaseEmailTemplate(content: string) {
}
