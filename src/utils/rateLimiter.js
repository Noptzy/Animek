const erl = require('express-rate-limit');
// Support different module shapes: CJS, ESM default, or named
const rateLimit = erl?.rateLimit || erl?.default || erl;
const ipKeyGenerator = erl?.ipKeyGenerator || ((req) => req.ip);
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
require('dotenv').config();

// Config via env with sane defaults
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX) || 100; // per window per key

function getUserIdFromReq(req) {
  try {
    const auth = req.headers['authorization'];
    if (!auth) return null;
    const [scheme, token] = auth.split(' ');
    if (scheme !== 'Bearer' || !token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded && decoded.id ? String(decoded.id) : null;
  } catch (_) {
    return null;
  }
}

const limiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req, res) => {
    const uid = getUserIdFromReq(req);
    return uid ? `user:${uid}` : ipKeyGenerator(req);
  },
  handler: (req, res, next, options) => {
    const key = options.keyGenerator(req, res);
    logger.warning('Rate limit exceeded', { key, ip: req.ip, path: req.path });
    const retryAfterSec = Math.ceil(options.windowMs / 1000);
    res.status(429).json({
      message: 'Too many requests. Please try again later.',
      retryAfter: `${retryAfterSec}s`,
    });
  },
});

module.exports = limiter;
