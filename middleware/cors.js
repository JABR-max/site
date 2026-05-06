/**
 * ========================================
 * JABR Publication Consultancy
 * CORS Middleware
 * ========================================
 * Controls cross-origin requests securely
 */

module.exports = (req, res, next) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://jabrpublication.com')
    .split(',')
    .map(origin => origin.trim());

  const origin = req.headers.origin;

  // Check if origin is allowed
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  // Only allow specific HTTP methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // Only allow specific headers
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Don't allow credentials from different origins
  res.setHeader('Access-Control-Allow-Credentials', 'false');

  // Cache preflight requests
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};
