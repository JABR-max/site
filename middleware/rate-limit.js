/**
 * ========================================
 * JABR Publication Consultancy
 * Rate Limiting Middleware
 * ========================================
 * Simple rate limiting to prevent abuse
 * For production, use Redis with express-rate-limit
 */

const rateLimit = new Map();

module.exports = (req, res, next) => {
  const key = `${req.ip}-${req.path}`;
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000); // 15 minutes
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100);

  if (!rateLimit.has(key)) {
    rateLimit.set(key, []);
  }

  const requests = rateLimit.get(key);

  // Remove old requests outside the window
  const recentRequests = requests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
    });
  }

  recentRequests.push(now);
  rateLimit.set(key, recentRequests);

  // Clean up old entries to prevent memory issues
  if (rateLimit.size > 10000) {
    for (const [k, v] of rateLimit.entries()) {
      const validRequests = v.filter(time => now - time < windowMs);
      if (validRequests.length === 0) {
        rateLimit.delete(k);
      } else {
        rateLimit.set(k, validRequests);
      }
    }
  }

  next();
};
