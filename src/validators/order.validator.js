import { body } from "express-validator";

// ─────────────────────────────────────────────
//  CREATE ORDER
//  POST /api/v1/orders
//  Body: { shippingAddress }
// ─────────────────────────────────────────────
export const createOrderValidator = [
  body("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required"),

  body("shippingAddress.fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  body("shippingAddress.line1")
    .trim()
    .notEmpty()
    .withMessage("Address line 1 is required"),

  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("shippingAddress.state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),

  body("shippingAddress.postalCode")
    .trim()
    .notEmpty()
    .withMessage("Postal code is required"),

  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required"),
];

// ─────────────────────────────────────────────
//  CREATE PAYMENT INTENT
//  POST /api/v1/payments/create-payment-intent
//  Body: { orderId }
// ─────────────────────────────────────────────
export const createPaymentIntentValidator = [
  body("orderId")
    .notEmpty()
    .withMessage("orderId is required")
    .isMongoId()
    .withMessage("Invalid order ID format"),
];
