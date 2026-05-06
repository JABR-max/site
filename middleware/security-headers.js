/**
 * ========================================
 * JABR Publication Consultancy
 * Security Headers Middleware
 * ========================================
 * Implements enterprise-grade security headers
 * NIST, OWASP, and industry best practices
 */

module.exports = (req, res, next) => {
  // ========== CONTENT SECURITY POLICY ==========
  // Prevents XSS, clickjacking, and code injection attacks
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' https:",
      "connect-src 'self' https: ws: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      'block-all-mixed-content'
    ].join('; ')
  );

  // ========== X-FRAME-OPTIONS ==========
  // Prevents clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // ========== X-CONTENT-TYPE-OPTIONS ==========
  // Prevents MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // ========== X-XSS-PROTECTION ==========
  // Legacy XSS protection header (still useful)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // ========== REFERRER-POLICY ==========
  // Controls referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // ========== PERMISSIONS-POLICY ==========
  // Controls browser features and APIs
  res.setHeader(
    'Permissions-Policy',
    [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'usb=()',
      'payment=()',
      'vr=()',
      'xr=()'
    ].join(', ')
  );

  // ========== STRICT-TRANSPORT-SECURITY (HSTS) ==========
  // Forces HTTPS for all future requests
  const hstsMaxAge = process.env.HSTS_MAX_AGE || 31536000; // 1 year default
  res.setHeader(
    'Strict-Transport-Security',
    `max-age=${hstsMaxAge}; includeSubDomains; preload`
  );

  // ========== EXPECT-CT ==========
  // Certificate transparency requirement
  res.setHeader('Expect-CT', 'max-age=86400, enforce');

  // ========== PUBLIC-KEY-PINS (optional for advanced security) ==========
  // Uncomment if you have certificate pinning requirements
  // res.setHeader('Public-Key-Pins', 'pin-sha256="..."; pin-sha256="..."; max-age=2592000; includeSubDomains');

  // ========== X-PERMITTED-CROSS-DOMAIN-POLICIES ==========
  // Restricts cross-domain policies
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // ========== CACHE-CONTROL (Security-focused) ==========
  // Prevent caching of sensitive pages
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  // ========== CROSS-ORIGIN POLICIES ==========
  // Control cross-origin behavior
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  next();
};
