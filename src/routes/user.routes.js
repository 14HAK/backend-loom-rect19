import express from "express";
import {
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// All user routes require authentication
router.use(protect);

// ─────────────────────────────────────────────
//  PROFILE
//  PATCH /api/v1/users/profile
//  multipart/form-data: { name?, image? }
// ─────────────────────────────────────────────
router.patch(
  "/profile",
  upload.single("image"), // optional avatar upload
  updateProfile
);

// ─────────────────────────────────────────────
//  ADDRESSES
//  GET    /api/v1/users/addresses
//  POST   /api/v1/users/addresses
//  PATCH  /api/v1/users/addresses/:addressId
//  DELETE /api/v1/users/addresses/:addressId
// ─────────────────────────────────────────────
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.patch("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

export default router;
