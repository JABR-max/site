# JABR Publication Consultancy
## Deployment & Setup Guide

**Version**: 2.0 (Production-Ready)  
**Last Updated**: May 6, 2026  

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Local Development Setup](#local-development-setup)
3. [Netlify Deployment](#netlify-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Email Integration](#email-integration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- Netlify account (for deployment)

### Installation (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/jabr-consultancy.git
cd jabr-consultancy

# 2. Install dependencies
npm install

# 3. Create .env file from template
cp .env.example .env

# 4. Edit .env with your configuration
nano .env  # or use your favorite editor

# 5. Start local development server
npm start

# 6. Open in browser
# Visit http://localhost:3000
```

---

## Local Development Setup

### Full Development Workflow

```bash
# 1. Environment setup
cp .env.example .env
nano .env

# Required variables for local development:
NODE_ENV=development
PORT=3000
API_SECRET_KEY=your-test-key-here-min-32-chars
JWT_SECRET=your-jwt-test-key-here-min-32-chars
FORCE_HTTPS=false  # OK for local development

# 2. Install dependencies
npm install

# 3. Start development server with auto-reload
npm start

# 4. In another terminal, watch for file changes
npm run watch  # (optional, if configured)

# 5. View logs
tail -f logs/app.log

# 6. Stop server
# Press Ctrl+C in the terminal
```

### Available Scripts

```bash
npm start          # Start server (development)
npm run production # Start server (production mode)
npm run dev        # Start with file watching
npm test           # Run tests (when available)
npm audit          # Check dependencies for vulnerabilities
npm outdated       # Check for outdated packages
```

---

## Netlify Deployment

### 1. Connect Repository to Netlify

```bash
# Option A: Netlify CLI
npm install -g netlify-cli
netlify login
netlify init

# Option B: Web Dashboard
# 1. Visit https://app.netlify.com
# 2. Click "New site from Git"
# 3. Select your repository
# 4. Authorize Netlify access
# 5. Select branch (main)
```

### 2. Configure Build Settings

```
Build command:    npm install
Publish directory: .
Node version:     18.0.0
Functions:        netlify/functions (if using serverless)
```

### 3. Set Environment Variables

```bash
# Via Netlify Dashboard:
# 1. Go to Site settings → Build & deploy → Environment
# 2. Add each variable:

NODE_ENV=production
PORT=3000
API_SECRET_KEY=your-production-key-here
JWT_SECRET=your-production-jwt-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@jabrpublication.com
ADMIN_EMAIL=admin@jabrpublication.com
COMPANY_EMAIL=info@jabrpublication.com
CORS_ORIGIN=https://jabrpublication.com
ALLOWED_ORIGINS=https://jabrpublication.com,https://www.jabrpublication.com
```

### 4. Deploy

```bash
# Automatic deployment on push
git add .
git commit -m "Production deployment"
git push origin main

# Or manual deployment
netlify deploy --prod
```

### 5. Verify Deployment

```bash
# Check build logs
netlify logs

# Test API endpoints
curl https://jabrpublication.com/api/health

# Verify security headers
curl -I https://jabrpublication.com
```

### Netlify-Specific Features

```toml
# From netlify.toml:
- Automatic HTTPS
- Custom domain configuration
- Automatic redirects
- Form submission handling
- Function endpoints
- Continuous deployment
```

---

## Environment Configuration

### .env File Template

```bash
# ===== SECURITY =====
NODE_ENV=production
API_SECRET_KEY=generate-with-crypto.randomBytes(32)
JWT_SECRET=your-jwt-secret-key
CSRF_SECRET=your-csrf-secret-key
SESSION_SECRET=your-session-secret

# ===== SERVER =====
PORT=3000
HOST=0.0.0.0
FORCE_HTTPS=true

# ===== EMAIL =====
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@jabrpublication.com
ADMIN_EMAIL=admin@jabrpublication.com

# ===== COMPANY =====
COMPANY_NAME=JABR Publication Consultancy
COMPANY_EMAIL=info@jabrpublication.com
COMPANY_PHONE=+91-XXXX-XXXXXX
COMPANY_WEBSITE=https://jabrpublication.com

# ===== DATABASE =====
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db

# ===== SECURITY SETTINGS =====
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=pdf,doc,docx

# ===== CORS =====
CORS_ORIGIN=https://jabrpublication.com
ALLOWED_ORIGINS=https://jabrpublication.com,https://www.jabrpublication.com
```

### Generate Secure Keys

```bash
# Generate 32-character secure keys for secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# 3f4e2b8a5c9d1f7e6a4b2c8d5f9e1a3b7c6d4e5f8a9b2c1d3e5f7a9b0c2d4e
```

---

## Database Setup

### MongoDB (Recommended for Scalability)

```bash
# 1. Create MongoDB Atlas cluster
# Visit https://www.mongodb.com/cloud/atlas
# Create account → Create cluster → Get connection string

# 2. Set environment variable
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/jabr_db?retryWrites=true&w=majority

# 3. Install MongoDB driver
npm install mongodb dotenv

# 4. Test connection
node -e "
  require('dotenv').config();
  const { MongoClient } = require('mongodb');
  MongoClient.connect(process.env.DATABASE_URL)
    .then(() => console.log('✓ Connected to MongoDB'))
    .catch(e => console.error('✗ Connection failed:', e.message))
"
```

### PostgreSQL Alternative

```bash
# 1. Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
# Windows: Download from https://www.postgresql.org/

# 2. Create database
createdb jabr_consultancy

# 3. Set environment variable
DATABASE_URL=postgresql://user:password@localhost:5432/jabr_consultancy

# 4. Install driver
npm install pg
```

### Future: Database Schema (Placeholder)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(254) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE contacts (
  id VARCHAR(12) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  country VARCHAR(2) NOT NULL,
  service VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email) REFERENCES users(email)
);

-- Newsletter subscriptions table
CREATE TABLE newsletter_subscriptions (
  id VARCHAR(12) PRIMARY KEY,
  email VARCHAR(254) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed BOOLEAN DEFAULT false
);
```

---

## Email Integration

### Gmail Setup (Recommended for Testing)

```bash
# 1. Enable 2-Factor Authentication
# Visit https://accounts.google.com/security/

# 2. Generate App Password
# Visit https://myaccount.google.com/apppasswords
# Select "Mail" and "Windows Computer" (or your OS)
# Copy the generated password

# 3. Set environment variables
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# 4. Test connection
npm install nodemailer
node -e "
  require('dotenv').config();
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
  transporter.verify((err, valid) => {
    if (err) console.error('✗ Error:', err);
    else console.log('✓ SMTP connection successful');
  });
"
```

### SendGrid Integration (Production Recommended)

```bash
# 1. Create SendGrid account
# Visit https://sendgrid.com/

# 2. Generate API key
# Settings → API Keys → Create API Key

# 3. Set environment variable
SENDGRID_API_KEY=your-sendgrid-api-key

# 4. Install SDK
npm install @sendgrid/mail

# 5. Example usage
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: customer@example.com,
  from: process.env.EMAIL_FROM,
  subject: 'Welcome to JABR!',
  html: '<strong>Thank you for contacting us!</strong>'
});
```

---

## Monitoring & Logging

### Application Logging

```bash
# View real-time logs
tail -f logs/app.log

# Filter by log level
grep ERROR logs/app.log

# Filter by date
grep "2026-05-06" logs/app.log | grep ERROR

# Count occurrences
grep ERROR logs/app.log | wc -l
```

### Monitoring Tools Setup

#### Sentry (Error Tracking)

```bash
# 1. Create Sentry account
# Visit https://sentry.io/

# 2. Create new project (Node.js)

# 3. Get DSN from project settings

# 4. Set environment variable
SENTRY_DSN=your-sentry-dsn-here

# 5. Install SDK
npm install @sentry/node

# 6. Initialize in server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

#### CloudWatch (AWS Monitoring)

```bash
# 1. Install AWS SDK
npm install aws-sdk

# 2. Set AWS credentials (via environment or IAM role)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# 3. Send logs to CloudWatch
# Implementation in logs middleware
```

### Uptime Monitoring

```bash
# Use services like:
# - UptimeRobot (https://uptimerobot.com/)
# - Pingdom (https://www.pingdom.com/)
# - StatusPage.io (https://www.statuspage.io/)

# Monitor endpoint:
GET https://jabrpublication.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-05-06T10:00:00Z",
  "environment": "production"
}
```

---

## Troubleshooting

### Issue: "Port 3000 already in use"

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 npm start
```

### Issue: "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for syntax errors
npm run lint  # (if configured)
```

### Issue: "Email not sending"

```bash
# Verify environment variables
echo $SMTP_PASSWORD

# Test SMTP connection
telnet smtp.gmail.com 587

# Check email logs
grep -i "email" logs/app.log

# Verify app password (not regular password)
# Gmail requires app-specific password
```

### Issue: "Rate limiting blocking legitimate requests"

```bash
# Adjust rate limiting in .env
RATE_LIMIT_WINDOW_MS=1800000  # 30 minutes
RATE_LIMIT_MAX_REQUESTS=200   # 200 requests

# Or for testing
RATE_LIMIT_MAX_REQUESTS=10000  # Very high limit
```

### Issue: "CORS errors on frontend"

```bash
# Verify CORS configuration
CORS_ORIGIN=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Test CORS headers
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://jabrpublication.com/api/contact -v
```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* npm start

# Or specific debug
DEBUG=app:* npm start

# Check logs
tail -f logs/debug.log
```

---

## Production Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] HTTPS/SSL certificate installed
- [ ] Database backups configured
- [ ] Email service tested
- [ ] Security headers verified
- [ ] Rate limiting configured appropriately
- [ ] Logging system operational
- [ ] Monitoring alerts set up
- [ ] Backup & recovery plan documented
- [ ] Incident response plan in place
- [ ] Security audit completed
- [ ] Performance optimized

---

## Support & Resources

- **Documentation**: See `/docs/` directory
- **Security**: See `docs/SECURITY.md`
- **Issues**: Report to security@jabrpublication.com
- **Deployment**: See `netlify.toml` for Netlify settings

---

**Next Steps**:
1. Configure `.env` with your settings
2. Test locally with `npm start`
3. Deploy to Netlify
4. Monitor with logging service
5. Set up email integration
6. Plan database migration
