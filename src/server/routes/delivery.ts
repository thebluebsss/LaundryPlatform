import express from "express";
import * as deliveryController from "../controllers/deliveryController";

const router = express.Router();

// Shipper / Driver & Store Owner endpoints
router.get("/available-tasks", deliveryController.getAvailableTasks);
router.post("/create-task", deliveryController.createTask);
router.post("/accept-task", deliveryController.acceptTask);
router.patch("/task-status", deliveryController.updateTaskStatus);
router.get("/my-tasks", deliveryController.getMyTasks);
router.post("/update-location", deliveryController.updateDriverLocation);

export default router;
