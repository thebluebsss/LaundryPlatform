import rateLimit from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";

/**
 * Rate limiter cho authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: isProd ? 25 : 200,
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
  max: isProd ? 600 : 2000,
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
  max: isProd ? 30 : 100,
  message: {
    success: false,
    message: "Quá nhiều yêu cầu thanh toán, vui lòng thử lại sau",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
