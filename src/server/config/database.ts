import mongoose from "mongoose";
import logger from "../utils/logger";

// Disable buffering commands globally when disconnected to avoid 10s request hangs
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/prolaundry";
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s during initial connection attempt
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    logger.warn("Server will continue starting up, but database features may be unavailable. Please update MONGODB_URI in settings.");
  }
};

export default connectDB;
