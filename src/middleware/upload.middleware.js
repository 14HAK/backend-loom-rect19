// ─────────────────────────────────────────────
//  IMAGE STORAGE SWITCHER
//
//  Controls which storage system is used for
//  all image uploads across the entire project.
//
//  To switch storage:
//  Change ONE line in your .env file:
//
//    IMAGE_STORAGE=local       → saves to /uploads folder (dev)
//    IMAGE_STORAGE=cloudinary  → saves to Cloudinary CDN (prod/vercel)
//
//  All controllers import from this file only.
//  They never import upload.local.js or
//  upload.cloudinary.js directly.
// ─────────────────────────────────────────────

import * as local      from "./upload.local.js";
import * as cloudinary from "./upload.cloudinary.js";

const storage = process.env.IMAGE_STORAGE || "local";

const isCloudinary = storage === "cloudinary";

if (process.env.NODE_ENV === "development") {
  console.log(`📦 Image storage: ${isCloudinary ? "Cloudinary ☁️" : "Local 💾"}`);
}

// ─── Multer upload instance ────────────────
// Used in routes: upload.single("image") / upload.array("images", 5)
export const upload = isCloudinary ? cloudinary.upload : local.upload;

// ─── uploadImage ──────────────────────────
// Cloudinary: streams buffer to CDN → returns { url, public_id }
// Local:      multer already saved file to disk → not needed (null)
export const uploadImage = isCloudinary ? cloudinary.uploadImage : local.uploadImage;

// ─── getImageUrl ──────────────────────────
// Cloudinary: returns the full CDN URL as-is
// Local:      builds "/uploads/filename.jpg" path
export const getImageUrl = isCloudinary ? cloudinary.getImageUrl : local.getImageUrl;

// ─── deleteImage ──────────────────────────
// Cloudinary: calls cloudinary.uploader.destroy(public_id)
// Local:      calls fs.unlinkSync(filepath)
export const deleteImage = isCloudinary ? cloudinary.deleteImage : local.deleteImage;
