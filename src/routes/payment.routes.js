import express from "express";
import {
  createPaymentIntent,
  stripeWebhook,
} from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createPaymentIntentValidator } from "../validators/order.validator.js";

const router = express.Router();

// ─────────────────────────────────────────────
//  STRIPE WEBHOOK
//  ⚠️  MUST be defined BEFORE express.json()
//      middleware runs on this router.
//  Uses express.raw() to preserve the raw request
//  body — Stripe signature verification FAILS if
//  the body has been parsed as JSON first.
//
//  This route is PUBLIC — Stripe calls it directly.
//  Security is handled by signature verification
//  inside stripeWebhook controller.
// ─────────────────────────────────────────────
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // raw buffer — NOT express.json()
  stripeWebhook
);

// ─────────────────────────────────────────────
//  CREATE PAYMENT INTENT
//  Private — user must be logged in.
//  Body: { orderId }
//  Returns: { clientSecret } → used by Stripe.js
//  on the frontend to confirm card payment.
// ─────────────────────────────────────────────
router.post(
  "/create-payment-intent",
  protect,
  createPaymentIntentValidator,
  validate,
  createPaymentIntent
);

export default router;
