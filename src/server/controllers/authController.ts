import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import * as authService from "../services/authService";
import User from "../models/User";

/**
 * @desc    Kiểm tra trùng lặp (username, email, phone)
 * @route   GET /api/auth/check-duplicate
 * @access  Public
 */
export const checkDuplicate = asyncHandler(async (req: Request, res: Response) => {
  const { field, value } = req.query;
  if (!field || !value) {
    return res.status(400).json({ success: false, message: "Thiếu trường dữ liệu" });
  }

  const query: any = {};
  query[field as string] = value;

  const existing = await User.findOne(query);
  res.status(200).json({
    success: true,
    duplicated: !!existing,
  });
});

/**
 * @desc    Đăng ký user mới
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  successResponse(res, result, "Đăng ký thành công", 201);
});

/**
 * @desc    Đăng nhập
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  const emailOrUsername = email || username; // Accept either email or username
  const result = await authService.login(emailOrUsername, password);
  successResponse(res, result, "Đăng nhập thành công");
});

/**
 * @desc    Lấy profile user hiện tại
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user._id);
  successResponse(res, user, "Lấy profile thành công");
});

/**
 * @desc    Cập nhật profile
 * @route   PATCH /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  successResponse(res, user, "Cập nhật profile thành công");
});

/**
 * @desc    Quên mật khẩu - Gửi OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  successResponse(res, result, "OTP đã được gửi");
});

/**
 * @desc    Reset mật khẩu với OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  const result = await authService.resetPassword(email, otp, newPassword);
  successResponse(res, result, "Đặt lại mật khẩu thành công");
});
