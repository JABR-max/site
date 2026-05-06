# Email Backend Implementation Guide

## 🎯 Overview

This document explains the complete backend email system for JABR Publication Consultancy contact form submissions. The system is production-ready, secure, and supports multiple email service providers.

---

## 📊 System Architecture

```
User Fills Contact Form (HTML)
         ↓
Form Submitted (JavaScript sends POST to /api/contact)
         ↓
Server Validates & Sanitizes Input
         ↓
Contact Record Created & Stored (JSON for now, Database in production)
         ↓
Two Emails Sent in Parallel:
  ├─ Admin Notification Email → jabrpublicationconsultancy@gmail.com
  └─ Client Confirmation Email → User's Email Address
         ↓
Response Returned to Frontend (with status & contact ID)
         ↓
Success Overlay Shown to User
```

---

## 📁 Project Structure

```
project/
├── config/
│   └── email.js                 ← Email service configuration
├── middleware/
│   ├── input-sanitizer.js       ← Input validation
│   ├── security-headers.js      ← Security headers
│   ├── rate-limit.js            ← Rate limiting
│   └── cors.js                  ← CORS protection
├── api/
│   ├── contact.js               ← Contact form handler (UPDATED)
│   └── newsletter.js            ← Newsletter handler
├── data/
│   ├── contacts.json            ← Contact submissions (backup storage)
│   └── newsletter.json          ← Newsletter subscribers
├── docs/
│   ├── EMAIL_SETUP.md           ← Email service setup guide
│   ├── SECURITY.md              ← Security documentation
│   ├── DEPLOYMENT.md            ← Deployment guide
│   └── ARCHITECTURE.md          ← Technical architecture
├── uploads/                     ← User-uploaded manuscripts
├── .env.example                 ← Configuration template
├── .env                         ← (LOCAL ONLY - NOT in Git)
├── .gitignore                   ← Excludes .env, node_modules, etc.
├── package.json                 ← Dependencies (includes nodemailer)
├── server.js                    ← Express server (UPDATED)
├── index.html                   ← Frontend (unchanged)
├── script.js                    ← Frontend JS (unchanged)
└── style.css                    ← Frontend CSS (unchanged)
```

---

## 🔧 Installation & Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- **express** ^5.2.1 - Web framework
- **multer** ^2.0.2 - File upload handling
- **nodemailer** ^6.9.13 - Email sending

### Step 2: Configure Email Service

#### Option A: Gmail (Recommended)

1. **Get App Password:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select Mail + Windows Computer
   - Copy the generated 16-character password

2. **Create `.env` file:**

```env
NODE_ENV=production
PORT=3000

EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jabrpublicationconsultancy@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=noreply@jabrpublication.com
ADMIN_EMAIL=jabrpublicationconsultancy@gmail.com
```

#### Option B: Office 365

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-office365-email@domain.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@jabrpublication.com
ADMIN_EMAIL=jabrpublicationconsultancy@gmail.com
```

#### Option C: SendGrid

```bash
npm install @sendgrid/mail
```

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG_your_api_key_here
SENDGRID_FROM_EMAIL=noreply@jabrpublication.com
ADMIN_EMAIL=jabrpublicationconsultancy@gmail.com
```

See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed configuration guides.

### Step 3: Test Email Configuration

Create `test-email.js`:

```javascript
require('dotenv').config();
const { sendEmail } = require('./config/email');

async function test() {
  try {
    console.log('Testing email...');
    const result = await sendEmail({
      to: 'your-email@example.com',
      subject: 'Test Email from JABR',
      html: '<h1>Test</h1><p>If received, email is working!</p>'
    });
    console.log('✅ Email sent!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
```

Run:
```bash
node test-email.js
```

### Step 4: Start Server

```bash
npm start
```

Expected output:
```
╔════════════════════════════════════════════════════════╗
║   🚀 JABR Publication Consultancy Server              ║
║                                                        ║
║   Status: Running ✓                                    ║
║   Environment: production                             ║
║   Host: 0.0.0.0                                        ║
║   Port: 3000                                           ║
║                                                        ║
║   Email Service: ✓ Configured                          ║
║   Admin Email: jabrpublicationconsultancy@gmail.com  ║
║                                                        ║
║   Security Features Enabled:                           ║
║   ✓ Security headers (CSP, HSTS, etc.)                 ║
║   ✓ Rate limiting                                      ║
║   ✓ Input validation & sanitization                    ║
║   ✓ CORS protection                                    ║
║   ✓ File upload restrictions                           ║
║   ✓ Email notifications (if configured)                ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## 🎯 How It Works

### Contact Form Submission Flow

#### 1. Frontend (index.html)

```html
<form id="contactForm" class="form-contact" enctype="multipart/form-data">
  <input type="text" name="fullName" placeholder="Full Name" required>
  <input type="email" name="email" placeholder="Your Email" required>
  <input type="tel" name="whatsapp" placeholder="WhatsApp Number">
  <select name="country" required>
    <option>Select Country</option>
    <!-- Countries -->
  </select>
  <select name="service" required>
    <option>Select Service</option>
    <option>Research Publication</option>
    <!-- Services -->
  </select>
  <textarea name="message" placeholder="Your Message" required></textarea>
  <input type="file" name="manuscript" accept=".pdf,.doc,.docx">
  <button type="submit">Send Message</button>
</form>
```

#### 2. JavaScript Handler (script.js)

```javascript
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // Show success overlay
      document.getElementById('successOverlay').style.display = 'flex';
      contactForm.reset();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    alert('Error submitting form: ' + error.message);
  }
});
```

#### 3. API Handler (api/contact.js)

1. **Validate** - Check required fields (fullName, email, service, country)
2. **Sanitize** - Remove XSS, SQL injection attempts
3. **Store** - Save contact record to JSON (backup)
4. **Email Client** - Send confirmation email to user
5. **Email Admin** - Notify admin of new submission
6. **Respond** - Return success/error to frontend

#### 4. Email Service (config/email.js)

Uses **Nodemailer** to send emails via SMTP:

```javascript
const nodemailer = require('nodemailer');

// Create transport
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD
  }
});

// Send email
transporter.sendMail({
  from: EMAIL_FROM,
  to: recipient,
  subject: 'Your Subject',
  html: '<html>content</html>'
});
```

#### 5. Email Templates

**Admin Notification Email** includes:
- Contact details (name, email, phone, country, service)
- Full message text
- Quick action buttons (Reply, Call, WhatsApp)
- Submission timestamp
- Security badge

**Client Confirmation Email** includes:
- Personalized greeting
- Process timeline (24-hour response, 48-hour contact, etc.)
- Company contact information
- WhatsApp/Phone links
- Professional footer

---

## 📧 Security Features

### Input Validation

```javascript
// Required fields
if (!fullName || !country || !email || !service) {
  return error("Missing required fields");
}

// Email format
if (!validateEmail(email)) {
  return error("Invalid email");
}

// Country validation
if (!validateCountry(country)) {
  return error("Invalid country");
}

// Service type validation
if (!validateService(service)) {
  return error("Invalid service");
}

// Text length limits
if (fullName.length > 100) {
  return error("Name too long");
}

if (message.length > 5000) {
  return error("Message too long");
}
```

### Input Sanitization

```javascript
// Remove HTML/script tags
message = message.replace(/<[^>]*>/g, '');

// Trim whitespace
name = name.trim();

// Prevent XSS
sanitized = sanitizedData.replace(/[<>"']/g, '');

// Filter profanity (optional)
message = filterProfanity(message);
```

### Rate Limiting

```javascript
// 100 requests per 15 minutes per IP
// Built into middleware/rate-limit.js

app.use(rateLimiter);
```

### Email Protection

- ✅ SMTP with TLS encryption (port 587)
- ✅ Environment variables for credentials (no hardcoding)
- ✅ Error handling (doesn't expose sensitive data)
- ✅ Admin email verification
- ✅ User email validation

---

## 📋 API Reference

### POST /api/contact

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "whatsapp": "+1-555-0000",
  "country": "United States",
  "service": "Research Publication",
  "message": "I need help publishing my research...",
  "manuscript": <File>
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Thank you for contacting JABR! We'll get back to you within 24 hours.",
  "contactId": "a1b2c3d4e5",
  "confirmationEmail": "john@example.com",
  "emailStatus": {
    "clientConfirmation": true,
    "adminNotification": true
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Missing required fields",
  "required": ["fullName", "country", "email", "service"]
}
```

---

## 🚀 Deployment

### Local Testing

```bash
# Install dependencies
npm install

# Create .env with email config
cp .env.example .env
# Edit .env with your email credentials

# Test email
node test-email.js

# Start server
npm start

# Test at http://localhost:3000
```

### Netlify Deployment

1. **Push to GitHub:**
```bash
git add .
git commit -m "Add email backend integration"
git push origin main
```

2. **Add Secrets to Netlify:**
   - Go to Site Settings → Build & Deploy → Environment
   - Add environment variables:
     - `NODE_ENV=production`
     - `EMAIL_SERVICE=smtp`
     - `SMTP_HOST=smtp.gmail.com`
     - `SMTP_PORT=587`
     - `SMTP_USER=your-email@gmail.com`
     - `SMTP_PASSWORD=your-app-password`
     - `ADMIN_EMAIL=your-email@gmail.com`

3. **Update Build Settings:**
   - Build command: `npm install`
   - Publish directory: `.`

4. **Test Form:**
   - Visit your Netlify URL
   - Submit contact form
   - Check email for confirmation

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t jabr-consultancy .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=your-email@gmail.com \
  -e SMTP_PASSWORD=your-password \
  -e ADMIN_EMAIL=your-email@gmail.com \
  jabr-consultancy
```

---

## 🧪 Testing

### Manual Testing

1. Fill contact form with valid data
2. Submit form
3. Check browser console for response
4. Check admin email for notification
5. Check user email for confirmation

### Automated Testing

Create `test-contact-api.js`:

```javascript
const http = require('http');

async function testContactAPI() {
  const data = JSON.stringify({
    fullName: 'Test User',
    email: 'test@example.com',
    whatsapp: '+1-555-0000',
    country: 'United States',
    service: 'Research Publication',
    message: 'Test message'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/contact',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const response = JSON.parse(body);
      console.log('Response:', response);
      console.log(response.success ? '✅ Test passed' : '❌ Test failed');
    });
  });

  req.on('error', console.error);
  req.write(data);
  req.end();
}

testContactAPI();
```

Run: `node test-contact-api.js`

---

## 📊 Email Template Variables

### Admin Email Template

Available variables in `generateAdminEmailTemplate()`:

- `contact.fullName` - Submitter's name
- `contact.email` - Submitter's email
- `contact.phone` - Submitter's phone
- `contact.country` - Country
- `contact.service` - Service type
- `contact.message` - Message text
- `contact.manuscript` - Uploaded file
- `contact.submittedAt` - ISO timestamp
- `contact.id` - Unique contact ID

### Client Email Template

Available variables in `generateClientEmailTemplate()`:

- `contact.fullName` - Submitter's name
- `contact.email` - Submitter's email
- `contact.phone` - Submitter's phone

---

## 🔍 Troubleshooting

### Email Not Sent

**Check:**
1. Is NODE_ENV set correctly? (production or development)
2. Are all SMTP_ variables in .env?
3. Is the SMTP password correct? (for Gmail: use App Password)
4. Is SMTP_PORT correct for your provider?
5. Does firewall allow outgoing SMTP?

**Debug:**
```bash
NODE_ENV=development npm start
# Look for "SMTP Email Service Ready" or error message
```

### "SMTP Connection Error"

**Solution:**
- Verify SMTP_HOST is accessible
- Check SMTP_PORT (usually 587 for TLS)
- Ensure firewall allows SMTP
- Try SMTP_SECURE=true with port 465

### "Invalid login or incorrect credentials"

**Solution:**
- For Gmail: Use [App Password](https://myaccount.google.com/apppasswords)
- Copy password exactly (watch for spaces)
- Ensure SMTP_USER is full email address

### Form Submission Fails but No Email Error

**Check:**
1. Contact record saved to data/contacts.json?
2. Error in response message?
3. Check server logs for errors
4. Verify email service is initialized at startup

---

## 📈 Monitoring

### Email Delivery Status

Monitor in server logs:

```
✅ Confirmation email sent to john@example.com
✅ Admin notification sent to jabrpublicationconsultancy@gmail.com
```

Or via email service dashboard:

**Gmail:** [Gmail Forwarding Account](https://myaccount.google.com/device-activity)
**SendGrid:** [SendGrid Dashboard](https://app.sendgrid.com/statistics)

### Storage & Backups

Contact data stored locally in:
```
data/contacts.json
```

Each contact includes:
- Unique ID
- Timestamp
- All form fields
- Email delivery status
- IP address

---

## 🔐 Security Checklist

Before production deployment:

- [ ] .env file created with real credentials
- [ ] .env added to .gitignore
- [ ] SMTP password is App Password (not personal password)
- [ ] ADMIN_EMAIL is correct
- [ ] EMAIL_FROM uses valid domain
- [ ] Test email sent successfully
- [ ] Rate limiting enabled (100 req/15min)
- [ ] Input validation working
- [ ] File upload restrictions in place
- [ ] Security headers enabled
- [ ] CORS configured properly
- [ ] Error messages don't expose sensitive data

---

## 🚀 Future Enhancements

Planned features:

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Admin dashboard with authentication
- [ ] Email scheduling/templates in database
- [ ] Automated follow-up emails
- [ ] SMS notifications
- [ ] Webhook integrations
- [ ] Email analytics/tracking
- [ ] Multi-language templates
- [ ] Attachment scanning
- [ ] Spam filtering

---

## 📞 Support

For questions or issues:

- **Email:** jabrpublicationconsultancy@gmail.com
- **Phone:** +91 8309992766
- **Hours:** Mon–Sat, 9:00 AM – 7:00 PM IST

---

## 📄 References

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [SendGrid Setup](https://sendgrid.com/docs/)
- [Express.js Guide](https://expressjs.com/)

---

**Last Updated:** January 2026
**Version:** 1.0
**Status:** ✅ Production Ready
