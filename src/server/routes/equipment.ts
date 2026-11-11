import express from "express";
import * as equipmentController from "../controllers/equipmentController";
import { optionalAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", optionalAuth as any, equipmentController.getEquipment);
router.get("/:id", optionalAuth as any, equipmentController.getEquipmentById);
router.post("/", optionalAuth as any, equipmentController.createEquipment);
router.patch("/:id", optionalAuth as any, equipmentController.updateEquipment);
router.delete("/:id", optionalAuth as any, equipmentController.deleteEquipment);

export default router;
