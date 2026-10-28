import express from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import bookingRoutes from "./bookings";
import orderRoutes from "./orders";
import productRoutes from "./products";
import laundryServiceRoutes from "./laundryServices";
import equipmentRoutes from "./equipment";
import paymentRoutes from "./payments";
import laundryOrderRoutes from "./laundryOrders";
import storeRoutes from "./stores";
import aiRoutes from "./ai";
import deliveryRoutes from "./delivery";
import reviewRoutes from "./reviews";

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/bookings", bookingRoutes);
router.use("/orders", orderRoutes);
router.use("/products", productRoutes);
router.use("/services", laundryServiceRoutes);
router.use("/equipment", equipmentRoutes);
router.use("/payment", paymentRoutes);
router.use("/laundry-orders", laundryOrderRoutes);
router.use("/stores", storeRoutes);
router.use("/ai", aiRoutes);
router.use("/delivery", deliveryRoutes);
router.use("/reviews", reviewRoutes);

// Alias routes for backward compatibility with old frontend
import * as userController from "../controllers/userController";
import * as bookingController from "../controllers/bookingController";
import * as orderController from "../controllers/orderController";
import * as productController from "../controllers/productController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

router.get(
  "/users-stats",
  authenticateToken as any,
  requireAdmin as any,
  userController.getUserStats,
);
router.get(
  "/stats",
  authenticateToken as any,
  requireAdmin as any,
  bookingController.getBookingStats,
);
router.get(
  "/admin/orders",
  authenticateToken as any,
  requireAdmin as any,
  orderController.getAllOrders,
);
router.get("/recommendations/:bookingId", productController.getRecommendations);

export default router;
