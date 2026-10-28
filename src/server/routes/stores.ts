import express from "express";
import * as storeController from "../controllers/storeController";
import { authenticateToken, requireAdmin, optionalAuth } from "../middleware/auth";

const router = express.Router();

// Public routes for users to locate nearby stores and couriers
router.get("/", storeController.getStores);
router.get("/nearby", storeController.getNearbyStores);
router.get("/drivers", storeController.getStoreDrivers);
router.get("/:id", storeController.getStoreById);

// Admin / Store Admin routes
router.post("/", authenticateToken as any, requireAdmin as any, storeController.createStore);
router.patch("/:id", authenticateToken as any, storeController.updateStore);
router.delete("/:id", authenticateToken as any, requireAdmin as any, storeController.deleteStore);

export default router;
