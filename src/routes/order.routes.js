import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createOrderValidator } from "../validators/order.validator.js";

const router = express.Router();

// All order routes require authentication
router.use(protect);

// ─────────────────────────────────────────────
//  ORDERS
// ─────────────────────────────────────────────

// POST  /api/v1/orders       → create order from cart
// GET   /api/v1/orders/my    → get current user's order history
// GET   /api/v1/orders/:id   → get single order detail
//
// ⚠️  /my MUST be defined BEFORE /:id
//     otherwise Express matches "my" as an :id param
router.post("/", createOrderValidator, validate, createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);

export default router;
