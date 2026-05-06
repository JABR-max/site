#!/usr/bin/env node
/**
 * ==============================================
 * JABR Publication Consultancy
 * Environment Setup Helper Script
 * ==============================================
 * 
 * This script helps you set up your .env file
 * Run: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => {
  rl.question(prompt, (answer) => {
    resolve(answer);
  });
});

const envPath = path.join(__dirname, '.env');

async function setup() {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  JABR Publication Consultancy - Environment Setup     ║
║                                                        ║
║  This script will create your .env file               ║
║  with your email configuration.                        ║
║                                                        ║
║  ⚠️ IMPORTANT: .env is NOT committed to Git           ║
║              Keep it secure and private!              ║
╚════════════════════════════════════════════════════════╝
  `);

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('\n.env file already exists. Overwrite? (yes/no): ');
    if (overwrite.toLowerCase() !== 'yes') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  // Environment
  console.log('\n--- SERVER CONFIGURATION ---');
  const nodeEnv = await question('Environment (production/development) [production]: ') || 'production';
  const port = await question('Port [3000]: ') || '3000';

  // Email Service Selection
  console.log('\n--- EMAIL SERVICE SELECTION ---');
  console.log('Options:');
  console.log('1. Gmail (recommended)');
  console.log('2. Office 365');
  console.log('3. Custom SMTP');
  const serviceChoice = await question('Choose email service (1-3) [1]: ') || '1';

  let emailConfig = '';

  if (serviceChoice === '1' || serviceChoice === '') {
    console.log('\n--- GMAIL SETUP ---');
    console.log('Steps:');
    console.log('1. Go to: https://myaccount.google.com/security');
    console.log('2. Enable 2-Step Verification');
    console.log('3. Go to: https://myaccount.google.com/apppasswords');
    console.log('4. Select "Mail" and "Windows Computer"');
    console.log('5. Copy the 16-character password below\n');

    const gmailEmail = await question('Gmail email address: ');
    const gmailPassword = await question('Gmail App Password (16 characters): ');

    emailConfig = `# Email Service Configuration
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=${gmailEmail}
SMTP_PASSWORD=${gmailPassword}
EMAIL_FROM=noreply@jabrpublication.com
ADMIN_EMAIL=${gmailEmail}`;
  } else if (serviceChoice === '2') {
    console.log('\n--- OFFICE 365 SETUP ---');
    const officeEmail = await question('Office 365 email address: ');
    const officePassword = await question('Office 365 password: ');

    emailConfig = `# Email Service Configuration
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=${officeEmail}
SMTP_PASSWORD=${officePassword}
EMAIL_FROM=noreply@jabrpublication.com
ADMIN_EMAIL=${officeEmail}`;
  } else if (serviceChoice === '3') {
    console.log('\n--- CUSTOM SMTP SETUP ---');
    const smtpHost = await question('SMTP Host (e.g., mail.example.com): ');
    const smtpPort = await question('SMTP Port (usually 587 or 465) [587]: ') || '587';
    const smtpUser = await question('SMTP Username/Email: ');
    const smtpPassword = await question('SMTP Password: ');
    const adminEmail = await question('Admin Email for notifications: ');

    const secure = smtpPort === '465' ? 'true' : 'false';

    emailConfig = `# Email Service Configuration
EMAIL_SERVICE=smtp
SMTP_HOST=${smtpHost}
SMTP_PORT=${smtpPort}
SMTP_SECURE=${secure}
SMTP_USER=${smtpUser}
SMTP_PASSWORD=${smtpPassword}
EMAIL_FROM=noreply@jabrpublication.com
ADMIN_EMAIL=${adminEmail}`;
  }

  // Generate complete .env content
  const envContent = `# ==============================================
# JABR Publication Consultancy
# Environment Configuration
# ==============================================
# IMPORTANT: This file is NOT committed to Git
# Keep this file private and secure!

# Server Configuration
NODE_ENV=${nodeEnv}
PORT=${port}
HOST=0.0.0.0

${emailConfig}

# Email Submission Settings
FORM_SUBMIT_TIMEOUT_MS=10000
FORM_SUBMISSION_SPAM_COOLDOWN_MS=5000
MAX_UPLOAD_SIZE_MB=10

# Company Information
COMPANY_NAME=JABR Publication Consultancy
COMPANY_EMAIL=jabrpublicationconsultancy@gmail.com
COMPANY_PHONE=+91 8309992766
COMPANY_WEBSITE=https://jabrpublication.com
COMPANY_TIMEZONE=Asia/Kolkata

# Security Keys (optional - for future authentication)
# API_SECRET_KEY=your-secret-key-here
# JWT_SECRET=your-jwt-secret-here
`;

  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent, { mode: 0o600 }); // Readable only by owner
    console.log('\n✅ .env file created successfully!');
    console.log(`   Location: ${envPath}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Verify email configuration');
    console.log('   2. Run: node test-email.js');
    console.log('   3. Then: npm start');
  } catch (err) {
    console.error('\n❌ Error creating .env file:', err.message);
  }

  rl.close();
}

setup().catch(console.error);
