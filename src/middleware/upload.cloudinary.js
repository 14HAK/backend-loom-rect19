import multer from "multer";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import ApiError from "../utils/ApiError.js";

// ─── Cloudinary SDK config ─────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer memory storage ─────────────────
// Files are kept in memory as buffers and
// streamed directly to Cloudinary — no disk writes
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const validExt  = allowed.test(file.originalname.toLowerCase());
  const validMime = allowed.test(file.mimetype);
  if (validExt && validMime) return cb(null, true);
  cb(new ApiError(400, "Only .jpg, .jpeg, .png and .webp images are allowed"));
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Streams buffer to Cloudinary, returns { url, public_id }
export const uploadImage = (buffer, folder = "techstore") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(new ApiError(500, "Cloudinary upload failed"));
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });

// Returns the Cloudinary URL as-is (already a full URL)
export const getImageUrl = (url) => url;

// Deletes image from Cloudinary by public_id
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    // Extract public_id from Cloudinary URL
    // e.g. https://res.cloudinary.com/demo/image/upload/techstore/products/abc123
    //      → public_id: techstore/products/abc123
    const parts = imageUrl.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex !== -1) {
      const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
      const public_id = publicIdWithExt.replace(/\.[^/.]+$/, ""); // remove extension
      await cloudinary.uploader.destroy(public_id);
    }
  } catch (_) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️  Could not delete Cloudinary image: ${imageUrl}`);
    }
  }
};
