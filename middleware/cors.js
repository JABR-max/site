/**
 * ========================================
 * JABR Publication Consultancy
 * CORS Middleware
 * ========================================
 * Controls cross-origin requests securely
 */

module.exports = (req, res, next) => {
  const origin = req.headers.origin;
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Get allowed origins from environment
  const allowedOriginsList = (process.env.ALLOWED_ORIGINS || 'https://jabrpublication.com,http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map(o => o.trim());

  // Allow any origin in development, whitelist in production
  if (!origin || isDevelopment || allowedOriginsList.includes(origin) || allowedOriginsList.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  // Allow methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');

  // Allow headers
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Cache preflight requests for 24 hours
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};
