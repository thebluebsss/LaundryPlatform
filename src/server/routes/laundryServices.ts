import express from "express";
import * as laundryServiceController from "../controllers/laundryServiceController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = express.Router();

router.get("/", laundryServiceController.getLaundryServices);
router.get("/:id", laundryServiceController.getLaundryServiceById);

router.post(
  "/",
  authenticateToken as any,
  requireAdmin as any,
  laundryServiceController.createLaundryService,
);

router.patch(
  "/:id",
  authenticateToken as any,
  requireAdmin as any,
  laundryServiceController.updateLaundryService,
);

router.delete(
  "/:id",
  authenticateToken as any,
  requireAdmin as any,
  laundryServiceController.deleteLaundryService,
);

export default router;
