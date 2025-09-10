const rateLimit = require('express-rate-limit');

// Global limiter (per IP)
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_WINDOW_MS || 15 * 60 * 1000), // 15 minutes default
  max: Number(process.env.RATE_MAX || 200), // 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// Stricter limiter for scraping endpoint
const scrapeLimiter = rateLimit({
  windowMs: Number(process.env.SCRAPE_RATE_WINDOW_MS || 10 * 60 * 1000), // 10 minutes
  max: Number(process.env.SCRAPE_RATE_MAX || 2), // 2 calls per 10 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Scrape requests are limited. Try again later.' },
});

module.exports = { globalLimiter, scrapeLimiter };
