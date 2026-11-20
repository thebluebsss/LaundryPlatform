import express from "express";
import * as paymentController from "../controllers/paymentController";
import { paymentLimiter } from "../middleware/rateLimiter";
import { authenticateToken, optionalAuth } from "../middleware/auth";

const router = express.Router();

router.post(
  "/vnpay/create",
  paymentLimiter as any,
  paymentController.createVNPayBooking,
);

router.post("/vnpay/ipn", paymentController.vnpayIPN);
router.get("/vnpay/ipn", paymentController.vnpayIPNGet);

router.post(
  "/momo/create",
  paymentLimiter as any,
  paymentController.createMoMoBooking,
);

router.post("/momo/ipn", paymentController.momoIPN);
router.get("/momo/ipn", paymentController.momoIPNGet);

router.post(
  "/payos/create",
  paymentLimiter as any,
  paymentController.createPayOSBooking,
);

router.post("/payos/webhook", paymentController.payosWebhook);

router.post(
  "/stripe/create-intent",
  paymentLimiter as any,
  paymentController.createStripeIntentBooking,
);

router.post("/calculate-price", paymentController.calculatePrice);

// VietQR Napas 24/7 routes
router.post("/vietqr/create", authenticateToken as any, paymentController.createVietQRPayment);
router.post("/vietqr/confirm", optionalAuth as any, paymentController.confirmVietQRPayment);

router.get("/status/:bookingId", authenticateToken as any, paymentController.getBookingPaymentStatus);

// Product payment routes
router.post(
  "/products/vnpay/create",
  authenticateToken as any,
  paymentLimiter as any,
  paymentController.createVNPayOrder,
);

router.post("/products/vnpay/ipn", paymentController.vnpayIPN);

router.post(
  "/products/momo/create",
  authenticateToken as any,
  paymentLimiter as any,
  paymentController.createMoMoOrder,
);

router.post("/products/momo/ipn", paymentController.momoIPN);

router.post(
  "/products/payos/create",
  authenticateToken as any,
  paymentLimiter as any,
  paymentController.createPayOSOrder,
);

router.post("/products/payos/webhook", paymentController.payosWebhook);

router.post(
  "/products/stripe/create-intent",
  authenticateToken as any,
  paymentLimiter as any,
  paymentController.createStripeIntentOrder,
);

router.get(
  "/products/status/:orderId",
  authenticateToken as any,
  paymentController.getOrderPaymentStatus,
);

export default router;
