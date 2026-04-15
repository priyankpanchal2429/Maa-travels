import rateLimit from 'express-rate-limit';

/** Strict limiter for auth endpoints — 10 attempts per 15 minutes */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in 15 minutes.',
  },
});

/** General API limiter — 200 requests per 15 minutes */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});
