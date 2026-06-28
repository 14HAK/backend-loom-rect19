import express from "express";
import {
  createPaymentIntent,
  stripeWebhook,
} from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createPaymentIntentValidator } from "../validators/order.validator.js";
import { paymentLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// ─────────────────────────────────────────────
//  STRIPE WEBHOOK
//  ⚠️  express.raw() — NOT express.json()
//  Public — verified by Stripe signature
// ─────────────────────────────────────────────
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ─────────────────────────────────────────────
//  CREATE PAYMENT INTENT
//  Private + rate limited (20 req/hour)
// ─────────────────────────────────────────────
router.post(
  "/create-payment-intent",
  protect,
  paymentLimiter,
  createPaymentIntentValidator,
  validate,
  createPaymentIntent
);

export default router;
