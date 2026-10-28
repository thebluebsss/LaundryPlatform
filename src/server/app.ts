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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    headers: {
      "content-type": req.headers["content-type"],
      authorization: req.headers["authorization"] ? "Bearer ***" : undefined,
    },
  });
  next();
});

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
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

// Error Handler
app.use(errorHandler);

export default app;
