import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import routes from "./routes";
import { errorHandler } from "./utils/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import { checkDBConnection } from "./middleware/dbCheck";
import logger from "./utils/logger";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import { config } from "./config/env";
import { authenticateToken, requireAdmin } from "./middleware/auth";

const app = express();

// Trust reverse proxy for correct rate limiting client IP detection
app.set("trust proxy", 1);

// Middleware (CORS allowlist in production; flexible in dev/Capacitor localhost)
const defaultLocalOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://localhost",
  "capacitor://localhost",
  "ionic://localhost",
];
const allowedOrigins = new Set([
  ...defaultLocalOrigins,
  ...config.corsOrigins,
  ...(process.env.APP_URL ? [process.env.APP_URL.trim().replace(/\/$/, "")] : []),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (
        config.nodeEnv !== "production" ||
        config.corsOrigins.length === 0 ||
        allowedOrigins.has(cleanOrigin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Origin không được phép bởi chính sách CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

const SENSITIVE_KEYS = new Set([
  "password",
  "newpassword",
  "oldpassword",
  "confirmpassword",
  "token",
  "resettoken",
  "secret",
  "apikey",
  "otp",
  "resetpasswordotp",
  "idcardnumber",
  "driverlicensenumber",
]);

const redactBody = (body: unknown, depth = 0): unknown => {
  if (depth > 6) return "[MAX_DEPTH]";
  if (typeof body === "string") {
    if (body.length > 512 && (body.startsWith("data:image/") || body.length > 2048)) {
      return `[TRUNCATED_STRING:${body.length}chars]`;
    }
    return body;
  }
  if (!body || typeof body !== "object") return body;
  if (Array.isArray(body)) return body.map((item) => redactBody(item, depth + 1));
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      safe[k] = "[REDACTED]";
    } else {
      safe[k] = redactBody(v, depth + 1);
    }
  }
  return safe;
};

// Request logging (recursively redacts sensitive fields & truncates base64 blobs)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    const safeQuery =
      req.query && Object.keys(req.query).length > 0
        ? redactBody(req.query)
        : undefined;
    logger.info(`${req.method} ${req.path}`, {
      query: safeQuery,
      body:
        req.method !== "GET" && req.body && Object.keys(req.body).length > 0
          ? redactBody(req.body)
          : undefined,
    });
  }
  next();
});

// Rate limiting
app.use("/api", apiLimiter as any);

// Debug status endpoint (Admin-only to avoid leaking infrastructure details)
app.get(
  "/api/debug-status",
  authenticateToken as any,
  requireAdmin as any,
  (req, res) => {
    const uri = process.env.MONGODB_URI || "";
    let maskedUri = "Not Set";
    if (uri) {
      try {
        const url = new URL(
          uri.startsWith("mongodb")
            ? uri.replace("mongodb+srv://", "http://").replace("mongodb://", "http://")
            : uri
        );
        maskedUri = `${uri.split("@")[1] || url.host}`;
      } catch {
        maskedUri = "Invalid URI format or hidden";
      }
    }
    res.json({
      success: true,
      readyState: mongoose.connection.readyState,
      readyStateDesc:
        ["disconnected", "connected", "connecting", "disconnecting"][
          mongoose.connection.readyState
        ] || "unknown",
      env: {
        NODE_ENV: process.env.NODE_ENV || "not set",
        PORT: config.port,
        MONGODB_URI_HOST: maskedUri,
      },
    });
  }
);

// Check database connection before executing any API endpoint
app.use("/api", checkDBConnection);

// Swagger Documentation
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "ProLaundry API Documentation",
    swaggerOptions: {
      docExpansion: "list",
      filter: true,
      tryItOutEnabled: true,
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }),
);

// API Routes
app.use("/api", routes);

// Root endpoint
app.get("/api/root", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to ProLaundry API",
    documentation: "/api-docs",
    version: "1.0.0",
  });
});

// API Error Handler (mounted only for /api routes; global 404 + errorHandler mounted in server.ts after Vite)
app.use("/api", errorHandler);

export default app;
