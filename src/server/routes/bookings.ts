import express from "express";
import * as bookingController from "../controllers/bookingController";
import {
  authenticateToken,
  requireAdmin,
  optionalAuth,
} from "../middleware/auth";
import { validate } from "../utils/validators";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  updatePaymentStatusSchema,
} from "../utils/validators";

const router = express.Router();

router.get(
  "/stats",
  authenticateToken as any,
  requireAdmin as any,
  bookingController.getBookingStats,
);

router.get("/my", authenticateToken as any, bookingController.getMyBookings);

router.get("/", authenticateToken as any, requireAdmin as any, bookingController.getBookings);

router.get("/:id", bookingController.getBookingById);

router.get("/phone/:phone", bookingController.getBookingsByPhone);

router.post(
  "/",
  optionalAuth as any,
  validate(createBookingSchema),
  bookingController.createBooking,
);

router.patch(
  "/:id/status",
  authenticateToken as any,
  requireAdmin as any,
  validate(updateBookingStatusSchema),
  bookingController.updateBookingStatus,
);

router.patch(
  "/:id/payment-status",
  authenticateToken as any,
  requireAdmin as any,
  validate(updatePaymentStatusSchema),
  bookingController.updatePaymentStatus,
);

router.delete(
  "/:id",
  authenticateToken as any,
  requireAdmin as any,
  bookingController.deleteBooking,
);

export default router;
