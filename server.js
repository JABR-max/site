/**
 * ========================================
 * JABR Publication Consultancy
 * Enterprise-Grade Node.js Backend Server
 * ========================================
 * 
 * SECURITY FEATURES:
 * ✅ Security headers (CSP, HSTS, X-Frame-Options, etc.)
 * ✅ Input validation & sanitization
 * ✅ Rate limiting
 * ✅ CORS protection
 * ✅ File upload restrictions
 * ✅ Environment variable management
 * ✅ Error handling & logging
 * ✅ Production-ready architecture
 * 
 * DEPLOYMENT NOTES:
 * - For Netlify: Use serverless functions in /netlify/functions/
 * - For traditional hosting: Run with Node.js
 * - Set environment variables in .env (never commit)
 * - Use database instead of JSON files in production
 */

require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// ========== SECURITY MIDDLEWARE ==========
const securityHeaders = require('./middleware/security-headers');
const rateLimiter = require('./middleware/rate-limit');
const corsMiddleware = require('./middleware/cors');

// ========== EMAIL SERVICE ==========
const { initializeEmailService } = require('./config/email');

// ========== API ROUTES ==========
const contactApiRoute = require('./api/contact');

// ========== CONFIGURATION ==========
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

// ========== DIRECTORY INITIALIZATION ==========
(async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create directories:', err);
  }
})();

// ========== GLOBAL MIDDLEWARE ==========

// Security headers (applies to all routes)
app.use(securityHeaders);

// Parse JSON payloads (with size limit)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS protection
app.use(corsMiddleware);

// Rate limiting
app.use(rateLimiter);

// ========== FILE UPLOAD CONFIGURATION ==========
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    // Generate secure filename
    const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx').split(',');
    const ext = path.extname(file.originalname).toLowerCase().slice(1);

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// ========== STATIC FILES ==========
// Serve frontend files (HTML, CSS, JS, assets, images)
// Files are in root directory: index.html, style.css, script.js, assets/, logo.jpeg
app.use(express.static(__dirname, {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    // Cache control for different file types
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for HTML
    } else if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day for CSS/JS
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week for images
    }
  }
}));

// ========== API ROUTES ==========

/**
 * POST /api/contact
 * Contact form submission with file upload
 */
app.post('/api/contact', upload.single('manuscript'), contactApiRoute);

/**
 * DEPRECATED: Admin endpoints removed for security
 * These endpoints exposed sensitive customer data
 * Use proper admin dashboard with authentication instead
 * 
 * To access contact/subscriber data:
 * 1. Implement JWT authentication
 * 2. Create secure admin dashboard
 * 3. Use database instead of JSON files
 * 4. Add audit logging
 */

// ========== HEALTH CHECK ENDPOINT ==========
/**
 * GET /api/health
 * Health check for monitoring
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// ========== ERROR HANDLING ==========

// Handle 404 - Not Found
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found'
    });
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({
        success: false,
        error: 'File size exceeds limit'
      });
    }
    return res.status(400).json({
      success: false,
      error: 'File upload error'
    });
  }

  // Generic error response
  return res.status(500).json({
    success: false,
    error: NODE_ENV === 'production'
      ? 'Server error. Please try again later.'
      : err.message
  });
});

// ========== SPA FALLBACK ==========
// Serve index.html for all non-API routes (SPA support)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      res.status(500).json({ error: 'Could not load application' });
    }
  });
});

// ========== SERVER STARTUP ==========
const server = app.listen(PORT, HOST, () => {
  // Set request timeout for large file uploads
  const requestTimeout = parseInt(process.env.FORM_SUBMIT_TIMEOUT_MS || 60000) * 1.5;
  server.setTimeout(requestTimeout);
  server.keepAliveTimeout = Math.max(requestTimeout + 5000, 65000);
  const timestamp = new Date().toISOString();
  
  // Initialize email service
  const emailService = initializeEmailService();
  const emailStatus = emailService ? '✓ Configured' : '⚠ Not configured';
  
  console.log(`
╔════════════════════════════════════════════════════════╗
║   🚀 JABR Publication Consultancy Server              ║
║                                                        ║
║   Status: Running ✓                                    ║
║   Environment: ${NODE_ENV.padEnd(38)}║
║   Host: ${HOST.padEnd(45)}║
║   Port: ${PORT}${' '.repeat(45 - PORT.toString().length)}║
║   Time: ${timestamp.padEnd(46)}║
║                                                        ║
║   Secure API Endpoints:                                ║
║   • POST /api/contact (contact form)                   ║
║   • GET  /api/health (health check)                    ║
║                                                        ║
║   Email Service: ${emailStatus.padEnd(41)}║
║   Admin Email: ${(process.env.ADMIN_EMAIL || 'not set').padEnd(37)}║
║                                                        ║
║   Security Features Enabled:                           ║
║   ✓ Security headers (CSP, HSTS, etc.)                 ║
║   ✓ Rate limiting                                      ║
║   ✓ Input validation & sanitization                    ║
║   ✓ CORS protection                                    ║
║   ✓ File upload restrictions                           ║
║   ✓ Email notifications (if configured)                ║
║                                                        ║
║   Documentation: See docs/SECURITY.md                  ║
║                  See docs/EMAIL_SETUP.md               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
