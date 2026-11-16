const rateLimit = require('express-rate-limit');

/**
 * Standard API Rate Limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // Generous limit for dashboard polling and multiple widgets
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
    errors: []
  }
});

/**
 * Stricter Rate Limiter for Authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts per 15 mins to mitigate brute-force
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    errors: []
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};

