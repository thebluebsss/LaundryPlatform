import express from "express";
import dotenv from "dotenv";
import dns from "dns";

// Configure DNS to resolve MongoDB SRV records reliably inside the container
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e: any) {
  console.warn("DNS setServers warning:", e.message);
}

// Load environment variables and override system/container defaults
dotenv.config({ override: true });

import app from "./src/server/app";
import connectDB from "./src/server/config/database";
import logger from "./src/server/utils/logger";
import { config } from "./src/server/config/env";
import path from "path";
import { createServer as createViteServer } from "vite";
import { seedAdmin, seedProducts, seedServices, seedStores } from "./src/server/utils/seed";

import mongoose from "mongoose";

async function initDatabaseAndSeed() {
  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      await seedAdmin();
      await seedProducts();
      await seedServices();
      await seedStores();
    }
  } catch (err: any) {
    logger.error("Failed during database initialization or seeding:", err);
  }
}

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    logger.info("Starting in DEVELOPMENT mode with Vite Middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    logger.info("Starting in PRODUCTION mode with Static Assets");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler (must be mounted last)
  app.use((req, res, next) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  });

  // Global Error handler middleware
  const { errorHandler } = await import("./src/server/utils/errorHandler");
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`🌍 Environment: ${config.nodeEnv}`);
    initDatabaseAndSeed();
  });
}

// Handle unhandled promise rejections without crashing the dev server
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
});

startServer();
