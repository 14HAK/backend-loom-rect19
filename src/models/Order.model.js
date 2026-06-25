import mongoose from "mongoose";

// ─────────────────────────────────────────────
//  ORDER ITEM SUB-SCHEMA
//  Snapshot of product at time of purchase.
//  Even if product is deleted later, order
//  history remains intact.
// ─────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name:  { type: String,  required: true },
    image: { type: String,  default: "" },
    price: { type: Number,  required: true },
    qty:   { type: Number,  required: true, min: 1 },
  },
  { _id: false } // no need for individual item IDs on orders
);

// ─────────────────────────────────────────────
//  ORDER SCHEMA
// ─────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must contain at least one item",
      },
    },

    // ── Shipping ──────────────────────────────
    shippingAddress: {
      fullName:   { type: String, required: true },
      line1:      { type: String, required: true },
      city:       { type: String, required: true },
      state:      { type: String, required: true },
      postalCode: { type: String, required: true },
      country:    { type: String, required: true },
      phone:      { type: String, default: "" },
    },

    // ── Payment ───────────────────────────────
    paymentInfo: {
      provider: {
        type: String,
        enum: ["stripe"],
        default: "stripe",
      },
      // Stripe PaymentIntent ID — set when intent is created
      stripePaymentIntentId: {
        type: String,
        default: "",
      },
      // Updated to "paid" by the Stripe webhook
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      paidAt: {
        type: Date,
        default: null,
      },
    },

    // ── Coupon ────────────────────────────────
    couponCode: { type: String, default: "" },

    // ── Pricing breakdown ─────────────────────
    // All stored in DB so order history is accurate
    // even if tax rate or shipping rules change later
    itemsPrice:    { type: Number, required: true, min: 0 },
    shippingPrice: { type: Number, required: true, min: 0 },
    taxPrice:      { type: Number, required: true, min: 0 },
    discount:      { type: Number, default: 0,     min: 0 },
    totalPrice:    { type: Number, required: true, min: 0 },

    // ── Order status ──────────────────────────
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
