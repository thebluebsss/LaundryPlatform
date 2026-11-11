import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import * as bookingService from "../services/bookingService";

/**
 * @desc    Lấy danh sách bookings của user hiện tại
 * @route   GET /api/bookings/my
 * @access  Private
 */
export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page as string;
  const limit = req.query.limit as string;
  const userId = req.user._id;

  const result = await bookingService.getBookingsByUserId(
    userId,
    parseInt(page) || 1,
    parseInt(limit) || 10,
  );

  successResponse(res, result, "Lấy danh sách bookings thành công");
});

/**
 * @desc    Lấy danh sách bookings
 * @route   GET /api/bookings
 * @access  Private/Admin
 */
export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, paymentStatus, phone, service } = req.query;

  const filters = { status, paymentStatus, phone, service };
  const result = await bookingService.getBookings(
    filters,
    parseInt(page as string) || 1,
    parseInt(limit as string) || 10,
  );

  successResponse(res, result, "Lấy danh sách bookings thành công");
});

/**
 * @desc    Lấy chi tiết booking
 * @route   GET /api/bookings/:id
 * @access  Public
 */
export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.getBookingById(req.params.id);
  successResponse(res, booking, "Lấy chi tiết booking thành công");
});

/**
 * @desc    Tìm booking theo số điện thoại
 * @route   GET /api/bookings/phone/:phone
 * @access  Public
 */
export const getBookingsByPhone = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await bookingService.getBookingsByPhone(req.params.phone);
  successResponse(res, bookings, "Tìm bookings thành công");
});

/**
 * @desc    Tạo booking mới
 * @route   POST /api/bookings
 * @access  Public
 */
export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  // Thêm userId nếu user đã đăng nhập
  const bookingData = {
    ...req.body,
    userId: req.user?._id, // Optional: chỉ thêm nếu user đã login
  };

  const booking = await bookingService.createBooking(bookingData);
  successResponse(res, booking, "Tạo booking thành công", 201);
});

/**
 * @desc    Cập nhật trạng thái booking
 * @route   PATCH /api/bookings/:id/status
 * @access  Private/Admin
 */
export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const booking = await bookingService.updateBookingStatus(
    req.params.id,
    status,
  );
  successResponse(res, booking, "Cập nhật trạng thái thành công");
});

/**
 * @desc    Cập nhật trạng thái thanh toán
 * @route   PATCH /api/bookings/:id/payment-status
 * @access  Private/Admin
 */
export const updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { paymentStatus, paymentDetails } = req.body;
  const booking = await bookingService.updatePaymentStatus(
    req.params.id,
    paymentStatus,
    paymentDetails,
  );
  successResponse(res, booking, "Cập nhật trạng thái thanh toán thành công");
});

/**
 * @desc    Xóa booking
 * @route   DELETE /api/bookings/:id
 * @access  Private/Admin
 */
export const deleteBooking = asyncHandler(async (req: Request, res: Response) => {
  await bookingService.deleteBooking(req.params.id);
  successResponse(res, null, "Xóa booking thành công");
});

/**
 * @desc    Thống kê bookings
 * @route   GET /api/stats
 * @access  Private/Admin
 */
export const getBookingStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await bookingService.getBookingStats();
  successResponse(res, stats, "Lấy thống kê thành công");
});
