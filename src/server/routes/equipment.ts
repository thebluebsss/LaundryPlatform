import express from "express";
import * as equipmentController from "../controllers/equipmentController";
import {
  authenticateToken,
  optionalAuth,
  requireRoles,
} from "../middleware/auth";

const router = express.Router();

router.get("/", optionalAuth as any, equipmentController.getEquipment);
router.get("/:id", optionalAuth as any, equipmentController.getEquipmentById);
router.post(
  "/",
  authenticateToken as any,
  requireRoles("admin", "store_owner", "store_manager") as any,
  equipmentController.createEquipment
);
router.patch(
  "/:id",
  authenticateToken as any,
  requireRoles("admin", "store_owner", "store_manager") as any,
  equipmentController.updateEquipment
);
router.delete(
  "/:id",
  authenticateToken as any,
  requireRoles("admin", "store_owner", "store_manager") as any,
  equipmentController.deleteEquipment
);

export default router;
