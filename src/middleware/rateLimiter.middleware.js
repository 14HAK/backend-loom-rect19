import rateLimit from "express-rate-limit";

// ─────────────────────────────────────────────
//  AUTH RATE LIMITER
//  Applied to: POST /auth/login, POST /auth/register
//
//  Prevents brute force attacks:
//  Max 10 attempts per 15 minutes per IP.
//  After 10 failed login attempts the IP is
//  blocked for 15 minutes automatically.
// ─────────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts from this IP. Please try again after 15 minutes.",
  },
  // Skip successful requests — only count failed ones
  skipSuccessfulRequests: true,
});

// ─────────────────────────────────────────────
//  GENERAL API RATE LIMITER
//  Applied globally to all /api routes in app.js
//
//  300 requests per 15 minutes per IP.
//  Generous enough for normal use, blocks
//  automated scrapers and DoS attempts.
// ─────────────────────────────────────────────
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

// ─────────────────────────────────────────────
//  PAYMENT RATE LIMITER
//  Applied to: POST /payments/create-payment-intent
//
//  Prevents payment endpoint abuse:
//  Max 20 payment attempts per hour per IP.
// ─────────────────────────────────────────────
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment attempts. Please try again after 1 hour.",
  },
});
