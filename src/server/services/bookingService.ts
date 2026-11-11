// @ts-nocheck
import Booking from "../models/Booking";
import { NotFoundError } from "../utils/errorHandler";
import { calculateServicePrice } from "./paymentService";

/**
 * Lấy bookings của user cụ thể
 */
export const getBookingsByUserId = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const query = { userId };

  const [bookings, total] = await Promise.all([
    Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Booking.countDocuments(query),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy danh sách bookings với pagination
 */
export const getBookings = async (filters: any = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const query: any = {};

  // Filters
  if (filters.status) query.status = filters.status;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.phone) query.phone = new RegExp(filters.phone, "i");
  if (filters.service) query.service = filters.service;

  const [bookings, total] = await Promise.all([
    Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Booking.countDocuments(query),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy chi tiết booking
 */
export const getBookingById = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new NotFoundError("Booking không tồn tại");
  }
  return booking;
};

/**
 * Tìm booking theo số điện thoại
 */
export const getBookingsByPhone = async (phone: string) => {
  const bookings = await Booking.find({ phone }).sort({ createdAt: -1 });
  return bookings;
};

/**
 * Tạo booking mới
 */
export const createBooking = async (bookingData: any) => {
  // Tính giá dịch vụ
  const pricing = calculateServicePrice(
    bookingData.service,
    bookingData, // Pass full object so estimatedWeight etc are handled nicely
  );

  const booking = await Booking.create({
    ...bookingData,
    totalAmount: bookingData.totalPrice !== undefined ? bookingData.totalPrice : pricing.totalPrice,
    status: "pending",
    paymentStatus: "unpaid",
  });

  return booking;
};

/**
 * Cập nhật trạng thái booking
 */
export const updateBookingStatus = async (bookingId: string, status: string) => {
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status },
    { new: true, runValidators: true },
  );

  if (!booking) {
    throw new NotFoundError("Booking không tồn tại");
  }

  return booking;
};

/**
 * Cập nhật trạng thái thanh toán
 */
export const updatePaymentStatus = async (
  bookingId: string,
  paymentStatus: string,
  paymentDetails: any = {},
) => {
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      paymentStatus,
      $set: {
        "paymentDetails.transactionId": paymentDetails.transactionId,
        "paymentDetails.gateway": paymentDetails.gateway,
        "paymentDetails.amount": paymentDetails.amount,
        "paymentDetails.paidAt": paymentDetails.paidAt || new Date(),
      },
    },
    { new: true, runValidators: true },
  );

  if (!booking) {
    throw new NotFoundError("Booking không tồn tại");
  }

  return booking;
};

/**
 * Xóa booking
 */
export const deleteBooking = async (bookingId: string) => {
  const booking = await Booking.findByIdAndDelete(bookingId);
  if (!booking) {
    throw new NotFoundError("Booking không tồn tại");
  }
  return booking;
};

/**
 * Thống kê bookings
 */
export const getBookingStats = async () => {
  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    processingBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue,
    recentBookings,
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: "pending" }),
    Booking.countDocuments({ status: "confirmed" }),
    Booking.countDocuments({ status: "processing" }),
    Booking.countDocuments({ status: "completed" }),
    Booking.countDocuments({ status: "cancelled" }),
    Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Booking.find().sort({ createdAt: -1 }).limit(5),
  ]);

  return {
    total: totalBookings,
    totalBookings,
    pending: pendingBookings,
    pendingBookings,
    confirmed: confirmedBookings,
    confirmedBookings,
    processing: processingBookings,
    processingBookings,
    completed: completedBookings,
    completedBookings,
    cancelled: cancelledBookings,
    cancelledBookings,
    totalRevenue: totalRevenue[0]?.total || 0,
    recentBookings,
  };
};
