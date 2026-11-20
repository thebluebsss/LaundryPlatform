import express from "express";
import * as storeController from "../controllers/storeController";
import { authenticateToken, optionalAuth, requireAdmin, requireRoles } from "../middleware/auth";

const router = express.Router();

// Public routes for users to locate nearby stores and couriers
router.get("/", storeController.getStores);
router.get("/nearby", storeController.getNearbyStores);
router.get("/drivers", optionalAuth as any, storeController.getStoreDrivers);
router.get("/:id", storeController.getStoreById);

// Admin / Store Owner routes
router.post("/", authenticateToken as any, requireAdmin as any, storeController.createStore);
router.patch(
  "/:id",
  authenticateToken as any,
  requireRoles("admin", "store_owner", "store_manager") as any,
  storeController.updateStore
);
router.delete("/:id", authenticateToken as any, requireAdmin as any, storeController.deleteStore);

export default router;
