import express from "express";
import * as laundryOrderController from "../controllers/laundryOrderController";
import { realtimeHub } from "../services/realtimeHub";
import {
  authenticateToken,
  authenticateSseToken,
  optionalAuth,
  requireRoles,
} from "../middleware/auth";

const router = express.Router();

// Real-time SSE stream for Live GPS, Order Chat, and Payment Webhook Reconciliation (Authenticated & Scoped)
router.get("/stream", authenticateSseToken as any, realtimeHub.subscribe);

router.post("/", authenticateToken as any, laundryOrderController.createOrder);
router.get("/", authenticateToken as any, laundryOrderController.getOrders);
router.patch(
  "/customer-care-note",
  authenticateToken as any,
  requireRoles("admin", "store_owner", "store_manager") as any,
  laundryOrderController.updateCustomerCareNote
);
router.get("/:id", authenticateToken as any, laundryOrderController.getOrderById);
router.patch("/:id/status", authenticateToken as any, laundryOrderController.updateOrderStatus);
router.patch(
  "/:id/weigh",
  authenticateToken as any,
  requireRoles("admin", "store_owner", "store_manager") as any,
  laundryOrderController.weighAndInspectOrder
);
router.put(
  "/:id/weigh",
  authenticateToken as any,
  requireRoles("admin", "store_owner", "store_manager") as any,
  laundryOrderController.weighAndInspectOrder
);
router.post("/:id/confirm-weight", authenticateToken as any, laundryOrderController.confirmOrderWeight);

// In-App Order Chat routes
router.get("/:id/messages", authenticateToken as any, laundryOrderController.getOrderMessages);
router.post("/:id/messages", authenticateToken as any, laundryOrderController.sendOrderMessage);

// Live Driver GPS Tracking route
router.post(
  "/:id/driver-location",
  authenticateToken as any,
  requireRoles("driver", "shipper", "admin") as any,
  laundryOrderController.updateOrderDriverLocation
);

// Electronic Payment & Auto-Reconciliation Webhook routes (VietQR / PayOS / VNPay)
router.post("/:id/payment-link", authenticateToken as any, laundryOrderController.createOrderPaymentLink);
// Webhook accepts signed gateway callback (x-webhook-signature) OR authenticated staff reconciliation
router.post("/:id/payment-webhook", optionalAuth as any, laundryOrderController.reconcileOrderPaymentWebhook);

router.delete(
  "/:id",
  authenticateToken as any,
  requireRoles("admin", "store_owner", "store_manager") as any,
  laundryOrderController.deleteOrder
);

export default router;
