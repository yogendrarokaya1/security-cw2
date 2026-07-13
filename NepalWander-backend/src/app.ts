import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import routes from "./routes";
import {
  errorHandler,
  notFound,
} from "./middlewares/error.middleware";
import { ENV } from "./config/env";

const app: Application = express();

// ── Security headers ──────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Global rate limit (all routes) ───────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Try again after 15 minutes.",
    },
  })
);

// ── Body parsing ──────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── NoSQL injection sanitization ──────────────────────
app.use(mongoSanitize());

// ── HTTP request logging ──────────────────────────────
if (ENV.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ── Health check ──────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "NepalWander API running ✅",
  });
});

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

export default app;