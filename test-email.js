#!/usr/bin/env node
/**
 * ==============================================
 * Test Email Configuration
 * ==============================================
 * 
 * This script tests your email service setup
 * Run: node test-email.js
 */

require('dotenv').config();
const { sendEmail } = require('./config/email');

async function testEmail() {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  Email Service Configuration Test                      ║
╚════════════════════════════════════════════════════════╝
  `);

  // Check environment variables
  console.log('\n📋 Configuration Check:');
  console.log(`   Email Service: ${process.env.EMAIL_SERVICE || 'smtp'}`);
  console.log(`   SMTP Host: ${process.env.SMTP_HOST || '❌ NOT SET'}`);
  console.log(`   SMTP User: ${process.env.SMTP_USER || '❌ NOT SET'}`);
  console.log(`   Admin Email: ${process.env.ADMIN_EMAIL || '❌ NOT SET'}`);

  // Validate required variables
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('\n❌ ERROR: Missing email configuration!');
    console.log('\n⚠️ Required variables not set in .env:');
    if (!process.env.SMTP_HOST) console.log('   - SMTP_HOST');
    if (!process.env.SMTP_USER) console.log('   - SMTP_USER');
    if (!process.env.SMTP_PASSWORD) console.log('   - SMTP_PASSWORD');
    console.log('\n💡 Run setup: node setup-env.js');
    process.exit(1);
  }

  // Send test email
  console.log('\n📤 Sending test email...');
  console.log(`   To: ${process.env.SMTP_USER}`);

  try {
    const result = await sendEmail({
      to: process.env.SMTP_USER,
      subject: '✓ JABR Email Configuration Test',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0d9488, #3b82f6); color: white; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; }
            .success { color: #10b981; font-weight: bold; }
            .footer { margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Email Configuration Test Successful</h1>
              <p>JABR Publication Consultancy</p>
            </div>
            <div class="content">
              <p>Congratulations! Your email service is configured and working correctly.</p>
              <p class="success">✓ SMTP Connection: Verified</p>
              <p class="success">✓ Email Delivery: Successful</p>
              <p class="success">✓ Configuration: Valid</p>
              <p>You can now start the server and deploy the website with full email functionality.</p>
              <h3>Next Steps:</h3>
              <ol>
                <li>Run: <code>npm start</code></li>
                <li>Test the contact form on your website</li>
                <li>Monitor email delivery</li>
                <li>Deploy to production</li>
              </ol>
            </div>
            <div class="footer">
              <p>JABR Publication Consultancy | email: jabrpublicationconsultancy@gmail.com | phone: +91 8309992766</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: 'Email configuration test successful!'
    });

    console.log('\n✅ TEST PASSED!');
    console.log('\n📊 Email Details:');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Response: ${result.response}`);

    console.log('\n✨ Your email service is ready to use!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Run: npm start');
    console.log('   2. Visit: http://localhost:3000');
    console.log('   3. Test the contact form');
    console.log('   4. Check your email for submissions');

  } catch (error) {
    console.log('\n❌ TEST FAILED!');
    console.log('\n⚠️ Error Details:');
    console.log(`   ${error.message}`);

    console.log('\n🔍 Troubleshooting:');

    if (error.message.includes('ECONNREFUSED')) {
      console.log('   Problem: Cannot connect to SMTP server');
      console.log('   Solution: Check SMTP_HOST and SMTP_PORT are correct');
      console.log('   Solution: Ensure firewall allows SMTP connections');
    }

    if (error.message.includes('Invalid login')) {
      console.log('   Problem: Invalid email or password');
      console.log('   Solution: For Gmail, use App Password (not regular password)');
      console.log('   Solution: Get App Password: https://myaccount.google.com/apppasswords');
      console.log('   Solution: Verify SMTP_USER and SMTP_PASSWORD are correct');
    }

    if (error.message.includes('SMTP')) {
      console.log('   Problem: SMTP connection issue');
      console.log('   Solution: Verify SMTP configuration in .env');
      console.log('   Solution: Try different port (587 for TLS, 465 for SSL)');
      console.log('   Solution: Check SMTP_SECURE matches port (false for 587, true for 465)');
    }

    console.log('\n📖 For detailed setup instructions:');
    console.log('   See: docs/EMAIL_SETUP.md');
    console.log('\n💡 Common Issues:');
    console.log('   Gmail: Use App Password from https://myaccount.google.com/apppasswords');
    console.log('   Office365: Enable "Allow Less Secure Apps"');
    console.log('   Custom SMTP: Verify host, port, and credentials');

    process.exit(1);
  }
}

testEmail();
