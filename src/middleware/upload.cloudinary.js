import multer from "multer";
import ApiError from "../utils/ApiError.js";

// ─────────────────────────────────────────────
//  CLOUDINARY UPLOAD HANDLER
//
//  ⚠️  Cloudinary is imported LAZILY (inside each
//  function body using dynamic import) so this
//  file loads cleanly even when the cloudinary
//  package is NOT installed.
//
//  When IMAGE_STORAGE=local, these functions are
//  never called — only the multer instance is
//  exported and used by upload.middleware.js.
// ─────────────────────────────────────────────

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
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadImage = async (buffer, folder = "techstore") => {
  const { v2: cloudinary } = await import("cloudinary");
  const { Readable } = await import("stream");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(new ApiError(500, "Cloudinary upload failed"));
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

export const getImageUrl = (url) => url;

export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const parts = imageUrl.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex !== -1) {
      const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
      const public_id = publicIdWithExt.replace(/\.[^/.]+$/, "");
      await cloudinary.uploader.destroy(public_id);
    }
  } catch (_) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️  Could not delete Cloudinary image: ${imageUrl}`);
    }
  }
};
