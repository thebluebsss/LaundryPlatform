import rateLimit from "express-rate-limit";

/**
 * Rate limiter cho authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // Tăng lên 1000 requests để test
  message: {
    success: false,
    message: "Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau 15 phút",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter chung cho API
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // Tăng lên 1000 requests để test
  message: {
    success: false,
    message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter cho payment endpoints
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 100, // Tăng lên 100 requests
  message: {
    success: false,
    message: "Quá nhiều yêu cầu thanh toán, vui lòng thử lại sau",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
