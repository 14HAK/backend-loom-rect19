import Stripe from "stripe";

// ─────────────────────────────────────────────
//  STRIPE SDK INIT
//  Initialised once and exported for use in
//  payment.controller.js only.
//  STRIPE_SECRET_KEY must be set in .env
// ─────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default stripe;
