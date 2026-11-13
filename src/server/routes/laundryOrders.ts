import express from "express";
import * as laundryOrderController from "../controllers/laundryOrderController";
import { realtimeHub } from "../services/realtimeHub";

const router = express.Router();

// Real-time SSE stream for Live GPS, Order Chat, and Payment Webhook Reconciliation
router.get("/stream", realtimeHub.subscribe);

router.post("/", laundryOrderController.createOrder);
router.get("/", laundryOrderController.getOrders);
router.get("/:id", laundryOrderController.getOrderById);
router.patch("/:id/status", laundryOrderController.updateOrderStatus);
router.patch("/:id/weigh", laundryOrderController.weighAndInspectOrder);
router.put("/:id/weigh", laundryOrderController.weighAndInspectOrder);
router.post("/:id/confirm-weight", laundryOrderController.confirmOrderWeight);

// In-App Order Chat routes
router.get("/:id/messages", laundryOrderController.getOrderMessages);
router.post("/:id/messages", laundryOrderController.sendOrderMessage);

// Live Driver GPS Tracking route
router.post("/:id/driver-location", laundryOrderController.updateOrderDriverLocation);

// Electronic Payment & Auto-Reconciliation Webhook routes (VietQR / PayOS / VNPay)
router.post("/:id/payment-link", laundryOrderController.createOrderPaymentLink);
router.post("/:id/payment-webhook", laundryOrderController.reconcileOrderPaymentWebhook);

router.delete("/:id", laundryOrderController.deleteOrder);

export default router;
