// Simple SMTP test script
require('dotenv').config();
const nodemailer = require('nodemailer');

// Log the config being used (with password hidden)
const config = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: '********' // Password hidden for security
  },
  connectionTimeout: 30000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
  debug: true // Enable verbose logging
};

console.log('SMTP Config:', config);
console.log('SMTP From:', process.env.SMTP_FROM);

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  connectionTimeout: 30000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
  debug: true // Enable verbose logging
});

// Test the connection
async function testConnection() {
  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    return false;
  }
}

// Send a test email
async function sendTestEmail() {
  try {
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'test@example.com', // Change this to a test email address
      subject: 'SMTP Test',
      text: 'This is a test email to verify SMTP configuration',
      html: '<b>This is a test email to verify SMTP configuration</b>'
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Envelope:', info.envelope);
    console.log('Accepted:', info.accepted);
    console.log('Response:', info.response);
    
    // Check what "from" address was actually used
    if (info.envelope && info.envelope.from) {
      console.log('Actual from address used:', info.envelope.from);
      if (info.envelope.from !== process.env.SMTP_FROM) {
        console.log('WARNING: The from address was changed by the SMTP server!');
      }
    }
    
    return info;
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw error;
  }
}

// Run the tests
(async () => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      await sendTestEmail();
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
})(); 