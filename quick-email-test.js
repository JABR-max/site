#!/usr/bin/env node
/**
 * Quick Email Delivery Test
 * Run: node quick-email-test.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Testing Email Delivery...\n');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: '✅ Quick Email Test - Check Inbox NOW',
      html: `
        <h2>Test Email Received!</h2>
        <p>If you see this, email delivery is working.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>From:</strong> ${process.env.EMAIL_FROM}</p>
        <p><strong>To:</strong> ${process.env.ADMIN_EMAIL}</p>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', result.messageId);
    console.log('\n📧 Check your inbox: ' + process.env.ADMIN_EMAIL);
    console.log('⏰ Might take 1-2 minutes to arrive');
    console.log('🔍 Also check: Spam, Promotions, Updates tabs\n');

  } catch (error) {
    console.error('❌ Email failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check Gmail 2-Factor Auth is enabled');
    console.log('2. Generate new App Password from: https://myaccount.google.com/apppasswords');
    console.log('3. Update SMTP_PASSWORD in .env file');
    console.log('4. Restart server and try again');
  }
}

testEmail();
