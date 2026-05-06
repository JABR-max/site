# Email Service Setup Guide

## Overview

The JABR Publication Consultancy website uses **Nodemailer** for secure email delivery. When a user submits the contact form, two emails are automatically generated:

1. **Admin Notification** → `jabrpublicationconsultancy@gmail.com` (internal notification)
2. **Client Confirmation** → User's email (automatic reply with next steps)

This guide covers setup for all supported email services.

---

## 📋 Table of Contents

1. [Gmail Setup (Recommended)](#gmail-setup-recommended)
2. [Office 365 Setup](#office-365-setup)
3. [SendGrid Setup](#sendgrid-setup)
4. [Resend Setup](#resend-setup)
5. [Custom SMTP Server](#custom-smtp-server)
6. [Testing & Troubleshooting](#testing--troubleshooting)
7. [Netlify Deployment](#netlify-deployment-email-setup)

---

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Complete the verification process

### Step 2: Generate App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Windows Computer** (or your device)
3. Google generates a 16-character password
4. **Copy this password** (you'll use it in .env)

### Step 3: Configure Environment Variables

Create `.env` file in project root:

```env
# Email Service
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jabrpublicationconsultancy@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=noreply@jabrpublication.com
ADMIN_EMAIL=jabrpublicationconsultancy@gmail.com
```

### Step 4: Test Connection

```bash
node -e "
const email = require('./config/email');
const transporter = email.initializeEmailService();
"
```

Expected output:
```
✅ SMTP Email Service Ready
```

---

## Office 365 Setup

### Step 1: Get Your SMTP Credentials

Contact your Office 365 administrator or check your account settings:
- SMTP Host: `smtp.office365.com`
- SMTP Port: `587` (TLS) or `465` (SSL)
- Username: Your Office 365 email
- Password: Your Office 365 password

### Step 2: Configure Environment Variables

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-office365-email@yourdomain.com
SMTP_PASSWORD=your-office365-password
EMAIL_FROM=noreply@jabrpublication.com
ADMIN_EMAIL=jabrpublicationconsultancy@gmail.com
```

### Step 3: Enable Less Secure Apps (if needed)

Some Office 365 accounts may require additional configuration in the Security settings.

---

## SendGrid Setup

### Step 1: Create SendGrid Account

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your email address
3. Verify your domain (optional but recommended)

### Step 2: Generate API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Choose **Full Access**
4. **Copy the API key** (save securely)

### Step 3: Install SendGrid Package

```bash
npm install @sendgrid/mail
```

### Step 4: Configure Environment Variables

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=noreply@jabrpublication.com
ADMIN_EMAIL=jabrpublicationconsultancy@gmail.com
```

### Step 5: Update Email Configuration

Create `config/email-sendgrid.js`:

```javascript
const sgMail = require('@sendgrid/mail');

function initializeSendGridService() {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SendGrid API key missing. Set SENDGRID_API_KEY in .env');
    return null;
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid Email Service Ready');
  return sgMail;
}

async function sendEmailSendGrid(mailOptions) {
  const sgMail = initializeSendGridService();

  if (!sgMail) {
    throw new Error('SendGrid service not configured');
  }

  try {
    const msg = {
      to: mailOptions.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@jabrpublication.com',
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent via SendGrid: ${mailOptions.to}`);
  } catch (error) {
    console.error('❌ SendGrid error:', error.message);
    throw error;
  }
}

module.exports = {
  initializeSendGridService,
  sendEmailSendGrid
};
```

---

## Resend Setup

### Step 1: Create Resend Account

1. Sign up at [Resend](https://resend.com/)
2. Verify your email
3. Add your domain (or use Resend's default domain)

### Step 2: Get API Key

1. Go to **API Keys** in dashboard
2. Create a new API key
3. **Copy the key**

### Step 3: Install Resend Package

```bash
npm install resend
```

### Step 4: Configure Environment Variables

```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your-api-key-here
RESEND_FROM_EMAIL=noreply@jabrpublication.com
ADMIN_EMAIL=jabrpublicationconsultancy@gmail.com
```

### Step 5: Update Email Configuration

Create `config/email-resend.js`:

```javascript
const { Resend } = require('resend');

function initializeResendService() {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Resend API key missing. Set RESEND_API_KEY in .env');
    return null;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend Email Service Ready');
  return resend;
}

async function sendEmailResend(mailOptions) {
  const resend = initializeResendService();

  if (!resend) {
    throw new Error('Resend service not configured');
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@jabrpublication.com',
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html
    });

    console.log(`✅ Email sent via Resend: ${mailOptions.to}`);
    return result;
  } catch (error) {
    console.error('❌ Resend error:', error.message);
    throw error;
  }
}

module.exports = {
  initializeResendService,
  sendEmailResend
};
```

---

## Custom SMTP Server

For private SMTP servers or other providers:

### Configure Environment Variables

```env
EMAIL_SERVICE=smtp
SMTP_HOST=mail.yourserver.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@jabrpublication.com
ADMIN_EMAIL=jabrpublicationconsultancy@gmail.com
```

**Common SMTP Settings:**

| Provider | Host | Port | Secure |
|----------|------|------|--------|
| Gmail | smtp.gmail.com | 587 | false |
| Office 365 | smtp.office365.com | 587 | false |
| Outlook | smtp-mail.outlook.com | 587 | false |
| AWS SES | email-smtp.[region].amazonaws.com | 587 | false |
| Mailgun | smtp.mailgun.org | 587 | false |
| Bluehost | mail.yoursite.com | 465 | true |

---

## Testing & Troubleshooting

### Test Email Sending

Create `test-email.js` in project root:

```javascript
require('dotenv').config();
const { sendEmail } = require('./config/email');

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    
    const result = await sendEmail({
      to: 'your-email@example.com',
      subject: 'JABR Email Configuration Test',
      html: '<h1>Test Email</h1><p>If you received this, your email configuration is working!</p>',
      text: 'If you received this, your email configuration is working!'
    });

    console.log('✅ Test email sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEmail();
```

Run test:
```bash
node test-email.js
```

### Common Issues & Solutions

#### ❌ "SMTP Connection Error: connect ECONNREFUSED"

**Problem:** Can't reach SMTP server

**Solutions:**
1. Verify SMTP_HOST is correct
2. Check SMTP_PORT (usually 587 for TLS, 465 for SSL)
3. Ensure firewall allows outgoing SMTP connections
4. Check if SMTP_SECURE matches port (TLS=false for 587, true for 465)

#### ❌ "Invalid login or incorrect credentials"

**Problem:** Username or password is wrong

**Solutions:**
1. For Gmail: Use App Password, not regular password
2. Check that you copied the password correctly (watch for spaces)
3. Verify email format (should include full email address)
4. Some services require username without domain (@example.com)

#### ❌ "Email not sent but no error"

**Problem:** Email silently fails

**Solutions:**
1. Check email is not marked as spam by recipient
2. Enable email service logging: `NODE_ENV=development`
3. Check ADMIN_EMAIL is correct
4. Verify EMAIL_FROM is a valid address from your domain

#### ❌ "Gmail: "Less secure app access" error"

**Problem:** Gmail blocks third-party apps

**Solution:** Use [App Passwords](https://myaccount.google.com/apppasswords) instead of regular password

---

## Netlify Deployment Email Setup

### Option 1: Netlify Functions with Environment Variables

1. **Add secrets to Netlify dashboard:**
   - Go to **Site settings** → **Build & deploy** → **Environment**
   - Add all email environment variables
   - Must match your `.env` file

2. **Create `.netlify/functions/contact-form.js`:**

```javascript
const { sendEmail, generateAdminEmailTemplate, generateClientEmailTemplate } = require('../../config/email');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { fullName, email, phone, service, message } = JSON.parse(event.body);

    // Validation...
    
    const contact = { fullName, email, phone, service, message };

    // Send emails
    await sendEmail({
      to: email,
      subject: '✓ Consultation Request Received',
      html: generateClientEmailTemplate(contact)
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `🎯 New Request - ${fullName}`,
      html: generateAdminEmailTemplate(contact)
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, contactId: Date.now() })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
```

3. **Deploy:** Push to GitHub, Netlify auto-deploys

### Option 2: Netlify Forms (No Backend Required)

Add to HTML form:

```html
<form name="contact" method="POST" netlify>
  <input type="text" name="fullName" required>
  <input type="email" name="email" required>
  <input type="phone" name="phone">
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```

Netlify auto-sends notifications to `ADMIN_EMAIL`.

---

## Email Template Customization

### Admin Email Template

Located in: `config/email.js` → `generateAdminEmailTemplate()`

Features:
- Contact details (name, email, phone)
- Message content with formatting
- Quick action buttons (Reply, Call, WhatsApp)
- Submission timestamp
- Security badge

### Client Confirmation Email

Located in: `config/email.js` → `generateClientEmailTemplate()`

Features:
- Personalized greeting
- Process timeline
- Direct contact options
- Company branding
- Professional footer

### Customize Templates

Edit HTML/CSS in the respective functions:

```javascript
function generateClientEmailTemplate(contact) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* Your custom CSS */
        </style>
      </head>
      <body>
        <!-- Your custom HTML -->
      </body>
    </html>
  `;
}
```

---

## Security Best Practices

### ✅ Do's

- ✅ Use environment variables for all credentials
- ✅ Add `.env` to `.gitignore`
- ✅ Use App Passwords (Gmail) or API Keys (SendGrid)
- ✅ Enable 2FA on email accounts
- ✅ Rotate credentials regularly
- ✅ Use TLS (port 587) when possible
- ✅ Monitor email delivery logs

### ❌ Don'ts

- ❌ Never commit `.env` file to Git
- ❌ Don't share API keys in code or documentation
- ❌ Don't use personal passwords for SMTP
- ❌ Don't disable TLS for security
- ❌ Don't store email credentials in database
- ❌ Don't log full email credentials

---

## Email Delivery Monitoring

### Check Email Logs

On server startup, check logs:
```bash
NODE_ENV=development npm start
```

Look for:
- ✅ "SMTP Email Service Ready" = Configuration OK
- ❌ "SMTP Connection Error" = Configuration problem

### Test Email Submission

1. Visit website contact form
2. Submit test message
3. Check inbox for two emails:
   - Client confirmation (from SMTP_USER)
   - Admin notification (from SMTP_USER to ADMIN_EMAIL)

### Monitor Delivery Rates

With SendGrid or Resend:
- Check dashboard for bounce rates
- Monitor spam complaints
- Review unsubscribe trends

---

## Production Checklist

Before deploying to production:

- [ ] Email service configured in `.env`
- [ ] SMTP credentials verified
- [ ] Test email sent successfully
- [ ] Admin email updated to production address
- [ ] Email FROM address verified with ISP
- [ ] Backup email service configured (optional)
- [ ] Email templates reviewed and approved
- [ ] Spam filter rules configured
- [ ] Environment variables added to Netlify
- [ ] Email delivery logs monitored

---

## Support

For issues or questions:
- **Email:** jabrpublicationconsultancy@gmail.com
- **Phone:** +91 8309992766
- **Hours:** Mon–Sat, 9:00 AM – 7:00 PM IST

---

**Last Updated:** January 2026
**Version:** 1.0
