import express from "express";
import * as contactController from "../controllers/contactController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = express.Router();

router.post("/", contactController.createContactInquiry);
router.get(
  "/",
  authenticateToken as any,
  requireAdmin as any,
  contactController.getContactInquiries
);

export default router;
