import express from "express";
import * as deliveryController from "../controllers/deliveryController";
import { authenticateToken, requireRoles } from "../middleware/auth";

const router = express.Router();

// Shipper / Driver & Store Owner endpoints (Authenticated & RBAC-protected)
router.get(
  "/available-tasks",
  authenticateToken as any,
  requireRoles("driver", "store_owner", "admin") as any,
  deliveryController.getAvailableTasks
);
router.post(
  "/create-task",
  authenticateToken as any,
  requireRoles("store_owner", "admin") as any,
  deliveryController.createTask
);
router.post(
  "/broadcast",
  authenticateToken as any,
  requireRoles("store_owner", "admin") as any,
  deliveryController.createTask
);
router.post(
  "/accept-task",
  authenticateToken as any,
  requireRoles("driver", "store_owner", "admin") as any,
  deliveryController.acceptTask
);
router.post(
  "/accept",
  authenticateToken as any,
  requireRoles("driver", "store_owner", "admin") as any,
  deliveryController.acceptTask
);
router.post(
  "/reject-task",
  authenticateToken as any,
  requireRoles("driver", "admin") as any,
  deliveryController.rejectTask
);
router.patch(
  "/task-status",
  authenticateToken as any,
  requireRoles("driver", "store_owner", "admin") as any,
  deliveryController.updateTaskStatus
);
router.get(
  "/my-tasks",
  authenticateToken as any,
  requireRoles("driver", "store_owner", "admin") as any,
  deliveryController.getMyTasks
);
router.post(
  "/update-location",
  authenticateToken as any,
  requireRoles("driver", "admin") as any,
  deliveryController.updateDriverLocation
);

export default router;
