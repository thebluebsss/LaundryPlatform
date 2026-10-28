import express from "express";
import * as userController from "../controllers/userController";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { validate } from "../utils/validators";
import { createUserSchema, updateUserSchema } from "../utils/validators";

const router = express.Router();

router.get("/", authenticateToken as any, requireAdmin as any, userController.getUsers);

router.get(
  "/stats",
  authenticateToken as any,
  requireAdmin as any,
  userController.getUserStats,
);

router.get("/:id", authenticateToken as any, requireAdmin as any, userController.getUserById);

router.post(
  "/",
  authenticateToken as any,
  requireAdmin as any,
  validate(createUserSchema),
  userController.createUser,
);

router.patch(
  "/:id",
  authenticateToken as any,
  requireAdmin as any,
  validate(updateUserSchema),
  userController.updateUser,
);

router.delete(
  "/:id",
  authenticateToken as any,
  requireAdmin as any,
  userController.deleteUser,
);

router.patch(
  "/:id/toggle-active",
  authenticateToken as any,
  requireAdmin as any,
  userController.toggleUserActive,
);

export default router;
