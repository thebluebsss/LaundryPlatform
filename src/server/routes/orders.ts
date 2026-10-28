import express from "express";
import * as orderController from "../controllers/orderController";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { validate } from "../utils/validators";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "../utils/validators";

const router = express.Router();

router.post(
  "/",
  authenticateToken as any,
  validate(createOrderSchema),
  orderController.createOrder,
);

router.get("/", authenticateToken as any, orderController.getUserOrders);

router.get(
  "/admin",
  authenticateToken as any,
  requireAdmin as any,
  orderController.getAllOrders,
);

router.get("/:id", orderController.getOrderById);

router.patch(
  "/:id/status",
  authenticateToken as any,
  requireAdmin as any,
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);

router.patch(
  "/:id/payment-status",
  authenticateToken as any,
  requireAdmin as any,
  validate(updatePaymentStatusSchema),
  orderController.updateOrderPaymentStatus,
);

router.patch("/:id/cancel", authenticateToken as any, orderController.cancelOrder);

export default router;
