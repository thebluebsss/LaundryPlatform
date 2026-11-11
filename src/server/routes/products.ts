import express from "express";
import * as productController from "../controllers/productController";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { validate } from "../utils/validators";
import {
  createProductSchema,
  updateProductSchema,
} from "../utils/validators";

const router = express.Router();

router.get("/", productController.getProducts);

router.get("/recommendations", productController.getRecommendations);

router.get("/:id", productController.getProductById);

router.post(
  "/",
  authenticateToken as any,
  requireAdmin as any,
  validate(createProductSchema),
  productController.createProduct,
);

router.patch(
  "/:id",
  authenticateToken as any,
  requireAdmin as any,
  validate(updateProductSchema),
  productController.updateProduct,
);

router.delete(
  "/:id",
  authenticateToken as any,
  requireAdmin as any,
  productController.deleteProduct,
);

export default router;
