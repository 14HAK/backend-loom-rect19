import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import apiRoutes from "./routes/index.js";
import notFound from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";

const app = express();

// ─────────────────────────────────────────────
//  ES MODULE __dirname equivalent
// ─────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─────────────────────────────────────────────
//  SECURITY HEADERS (helmet)
//  Sets X-Content-Type-Options, X-Frame-Options,
//  Strict-Transport-Security and more.
//  crossOriginResourcePolicy allows images
//  served from /uploads to load in the browser.
// ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ─────────────────────────────────────────────
//  CORS
//  Only allow requests from the frontend origin.
//  credentials: true required for httpOnly cookies.
// ─────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ─────────────────────────────────────────────
//  BODY PARSERS + SIZE LIMITS
//  10kb limit on JSON bodies prevents large
//  payload attacks.
//  Multipart (images) is handled by multer —
//  its 5MB limit applies there instead.
// ─────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ─────────────────────────────────────────────
//  REQUEST LOGGING (dev only)
// ─────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─────────────────────────────────────────────
//  STATIC FILE SERVING — LOCAL IMAGE UPLOADS
//  Only active when IMAGE_STORAGE=local.
//  Vercel uses Cloudinary so this is skipped.
//  http://localhost:8000/uploads/<filename>
// ─────────────────────────────────────────────
if (process.env.IMAGE_STORAGE !== "cloudinary") {
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"))
  );
}

// ─────────────────────────────────────────────
//  GLOBAL API RATE LIMITER
//  300 requests per 15 minutes per IP.
//  Auth + payment routes have stricter limits
//  applied directly in their route files.
// ─────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─────────────────────────────────────────────
//  HEALTH CHECK
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TechStore API is running",
    environment: process.env.NODE_ENV,
    imageStorage: process.env.IMAGE_STORAGE || "local",
  });
});

// ─────────────────────────────────────────────
//  API ROUTES → /api/v1
// ─────────────────────────────────────────────
app.use("/api/v1", apiRoutes);

// ─────────────────────────────────────────────
//  404 + CENTRALIZED ERROR HANDLER (must be last)
// ─────────────────────────────────────────────
app.use(notFound);
app.use(errorMiddleware);

export default app;
