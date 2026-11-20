import express from "express";
import * as reviewController from "../controllers/reviewController";
import {
  authenticateToken,
  requireAdmin,
  requireRoles,
} from "../middleware/auth";

const router = express.Router();

router.get("/", reviewController.getReviews);
router.post("/", reviewController.createOrUpdateReview);
router.patch(
  "/:id/reply",
  authenticateToken as any,
  requireRoles("admin", "store_owner", "store_manager") as any,
  reviewController.replyToReview
);
router.patch(
  "/:id/visibility",
  authenticateToken as any,
  requireAdmin as any,
  reviewController.toggleReviewVisibility
);

export default router;
