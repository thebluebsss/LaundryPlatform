import express from "express";
import * as laundryOrderController from "../controllers/laundryOrderController";

const router = express.Router();

router.post("/", laundryOrderController.createOrder);
router.get("/", laundryOrderController.getOrders);
router.get("/:id", laundryOrderController.getOrderById);
router.patch("/:id/status", laundryOrderController.updateOrderStatus);
router.patch("/:id/weigh", laundryOrderController.weighAndInspectOrder);
router.delete("/:id", laundryOrderController.deleteOrder);

export default router;
