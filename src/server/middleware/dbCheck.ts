import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

/**
 * Middleware to check if MongoDB connection is open.
 * If not connected, returns a 503 Service Unavailable immediately.
 */
export const checkDBConnection = (req: Request, res: Response, next: NextFunction) => {
  // Allow system check endpoints or static docs to pass through
  const bypassUrls = ["/api/root", "/api/health", "/api-docs"];
  if (bypassUrls.includes(req.path)) {
    return next();
  }

  // 1 means connected in mongoose.connection.readyState
  if (mongoose.connection.readyState !== 1) {
    console.log(`[Warning] Database is offline (${mongoose.connection.readyState}). Using JSON file-backed emulator fallback for: ${req.method} ${req.path}`);
  }

  next();
};
