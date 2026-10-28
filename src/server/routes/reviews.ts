import express from "express";
import * as reviewController from "../controllers/reviewController";

const router = express.Router();

router.get("/", reviewController.getReviews);
router.post("/", reviewController.createOrUpdateReview);
router.patch("/:id/reply", reviewController.replyToReview);
router.patch("/:id/visibility", reviewController.toggleReviewVisibility);

export default router;
