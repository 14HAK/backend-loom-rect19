import express from "express";
import { createPaymentIntent, stripeWebhook } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createPaymentIntentValidator } from "../validators/order.validator.js";
import { paymentLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);
router.post("/create-payment-intent", protect, paymentLimiter, createPaymentIntentValidator, validate, createPaymentIntent);
export default router;
