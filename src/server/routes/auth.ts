import express from "express";
import * as authController from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";
import { validate } from "../utils/validators";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../utils/validators";

const router = express.Router();

router.post(
  "/register",
  authLimiter as any,
  validate(registerSchema),
  authController.register,
);

router.get(
  "/check-duplicate",
  authController.checkDuplicate
);

router.post(
  "/login",
  authLimiter as any,
  validate(loginSchema),
  authController.login,
);

router.get("/profile", authenticateToken as any, authController.getProfile);

router.patch(
  "/profile",
  authenticateToken as any,
  validate(updateProfileSchema),
  authController.updateProfile,
);

router.post(
  "/forgot-password",
  authLimiter as any,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  authLimiter as any,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

export default router;
