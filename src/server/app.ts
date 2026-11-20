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

const app = express();

// Trust reverse proxy for correct rate limiting client IP detection
app.set("trust proxy", 1);

// Middleware
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

const SENSITIVE_KEYS = new Set([
  "password",
  "newPassword",
  "oldPassword",
  "confirmPassword",
  "token",
  "resetToken",
  "secret",
  "apiKey",
]);

const redactBody = (body: unknown): unknown => {
  if (!body || typeof body !== "object") return body;
  if (Array.isArray(body)) return body.map(redactBody);
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    safe[k] = SENSITIVE_KEYS.has(k) ? "[REDACTED]" : v;
  }
  return safe;
};

// Request logging (redacts sensitive fields like passwords & tokens)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    logger.info(`${req.method} ${req.path}`, {
      query: Object.keys(req.query || {}).length > 0 ? req.query : undefined,
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

// Debug status endpoint (bypassing DB check)
app.get("/api/debug-status", (req, res) => {
  const uri = process.env.MONGODB_URI || "";
  let maskedUri = "Not Set";
  if (uri) {
    try {
      const url = new URL(uri.startsWith("mongodb") ? uri.replace("mongodb+srv://", "http://").replace("mongodb://", "http://") : uri);
      maskedUri = `${uri.split("@")[1] || url.host}`;
    } catch (e) {
      maskedUri = "Invalid URI format or hidden";
    }
  }
  res.json({
    success: true,
    readyState: mongoose.connection.readyState,
    readyStateDesc: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
    env: {
      NODE_ENV: process.env.NODE_ENV || "not set",
      PORT: process.env.PORT || "not set",
      MONGODB_URI_HOST: maskedUri,
    }
  });
});

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
