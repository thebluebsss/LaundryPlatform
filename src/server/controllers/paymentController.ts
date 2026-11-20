import crypto from "crypto";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import * as paymentService from "../services/paymentService";
import * as bookingService from "../services/bookingService";
import * as orderService from "../services/orderService";
import { config } from "../config/env";
import { normalizeRole } from "../middleware/auth";

const verifyVietQrWebhookSignature = (req: Request): boolean => {
  if (!config.paymentWebhookSecret) return false;
  const sigHeader = String(
    req.headers["x-webhook-signature"] || req.headers["x-signature"] || ""
  ).trim();
  if (!sigHeader) return false;
  const expected = crypto
    .createHmac("sha256", config.paymentWebhookSecret)
    .update(JSON.stringify(req.body || {}))
    .digest("hex");
  const sigBuf = Buffer.from(sigHeader);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
};

/**
 * @desc    Tạo VNPay payment URL cho booking
 * @route   POST /api/payment/vnpay/create
 * @access  Public
 */
export const createVNPayBooking = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, amount, orderInfo } = req.body;
  const ipAddr = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

  const result = await paymentService.createVNPayPaymentUrl(
    bookingId,
    amount,
    orderInfo,
    ipAddr,
  );

  successResponse(res, result, "Tạo payment URL thành công");
});

/**
 * @desc    Tạo VNPay payment URL cho order
 * @route   POST /api/payment/products/vnpay/create
 * @access  Private
 */
export const createVNPayOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, amount, orderInfo } = req.body;
  const ipAddr = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

  const result = await paymentService.createVNPayPaymentUrl(
    orderId,
    amount,
    orderInfo,
    ipAddr,
  );

  successResponse(res, result, "Tạo payment URL thành công");
});

/**
 * @desc    VNPay IPN callback
 * @route   POST /api/payment/vnpay/ipn
 * @access  Public
 */
export const vnpayIPN = asyncHandler(async (req: Request, res: Response) => {
  const result: any = await paymentService.verifyVNPayIPN(req.query);

  if (result.success) {
    // Cập nhật payment status
    const { orderId, amount, transactionId } = result.data;

    try {
      await bookingService.updatePaymentStatus(orderId, "paid", {
        transactionId,
        gateway: "vnpay",
        amount,
      });
    } catch (error) {
      // Nếu không phải booking, thử order
      await orderService.updateOrderPaymentStatus(orderId, "paid", {
        transactionId,
        gateway: "vnpay",
        amount,
      });
    }
  }

  res.json(result);
});

/**
 * @desc    Tạo MoMo payment cho booking
 * @route   POST /api/payment/momo/create
 * @access  Public
 */
export const createMoMoBooking = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, amount, orderInfo } = req.body;

  const result = await paymentService.createMoMoPayment(
    bookingId,
    amount,
    orderInfo,
  );

  successResponse(res, result, "Tạo MoMo payment thành công");
});

/**
 * @desc    Tạo MoMo payment cho order
 * @route   POST /api/payment/products/momo/create
 * @access  Private
 */
export const createMoMoOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, amount, orderInfo } = req.body;

  const result = await paymentService.createMoMoPayment(
    orderId,
    amount,
    orderInfo,
  );

  successResponse(res, result, "Tạo MoMo payment thành công");
});

/**
 * @desc    MoMo IPN callback
 * @route   POST /api/payment/momo/ipn
 * @access  Public
 */
export const momoIPN = asyncHandler(async (req: Request, res: Response) => {
  const result: any = await paymentService.verifyMoMoIPN(req.body);

  if (result.success) {
    const { orderId, amount, transactionId } = result.data;

    try {
      await bookingService.updatePaymentStatus(orderId, "paid", {
        transactionId,
        gateway: "momo",
        amount,
      });
    } catch (error) {
      await orderService.updateOrderPaymentStatus(orderId, "paid", {
        transactionId,
        gateway: "momo",
        amount,
      });
    }
  }

  res.json(result);
});

/**
 * @desc    Tạo PayOS payment cho booking
 * @route   POST /api/payment/payos/create
 * @access  Public
 */
export const createPayOSBooking = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, amount, orderInfo, items } = req.body;

  const result = await paymentService.createPayOSPayment(
    bookingId,
    amount,
    orderInfo,
    items,
  );

  successResponse(res, result, "Tạo PayOS payment thành công");
});

/**
 * @desc    Tạo PayOS payment cho order
 * @route   POST /api/payment/products/payos/create
 * @access  Private
 */
export const createPayOSOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, amount, orderInfo, items } = req.body;

  const result = await paymentService.createPayOSPayment(
    orderId,
    amount,
    orderInfo,
    items,
  );

  successResponse(res, result, "Tạo PayOS payment thành công");
});

/**
 * @desc    PayOS webhook
 * @route   POST /api/payment/payos/webhook
 * @access  Public
 */
export const payosWebhook = asyncHandler(async (req: Request, res: Response) => {
  const result: any = await paymentService.verifyPayOSWebhook(req.body);

  if (result.success && result.data) {
    const orderId = String(result.data.orderId || result.data.orderCode || "");
    const amount = Number(result.data.amount || 0);
    const transactionId = String(
      result.data.transactionId || result.data.reference || result.data.orderCode || ""
    );

    if (orderId) {
      try {
        await bookingService.updatePaymentStatus(orderId, "paid", {
          transactionId,
          gateway: "payos",
          amount,
        });
      } catch {
        try {
          await orderService.updateOrderPaymentStatus(orderId, "paid", {
            transactionId,
            gateway: "payos",
            amount,
          });
        } catch {}
      }
    }
  }

  res.json(result);
});

/**
 * @desc    Tạo Stripe payment intent cho booking
 * @route   POST /api/payment/stripe/create-intent
 * @access  Public
 */
export const createStripeIntentBooking = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, amount } = req.body;

  const result = await paymentService.createStripePaymentIntent(
    bookingId,
    amount,
  );

  successResponse(res, result, "Tạo Stripe payment intent thành công");
});

/**
 * @desc    Tạo Stripe payment intent cho order
 * @route   POST /api/payment/products/stripe/create-intent
 * @access  Private
 */
export const createStripeIntentOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, amount } = req.body;

  const result = await paymentService.createStripePaymentIntent(
    orderId,
    amount,
  );

  successResponse(res, result, "Tạo Stripe payment intent thành công");
});

/**
 * @desc    Tính giá dịch vụ
 * @route   POST /api/payment/calculate-price
 * @access  Public
 */
export const calculatePrice = asyncHandler(async (req: Request, res: Response) => {
  const { service, weight, dryCleaningItems } = req.body;

  const pricing = paymentService.calculateServicePrice(
    service,
    weight,
    dryCleaningItems,
  );

  successResponse(res, pricing, "Tính giá thành công");
});

/**
 * @desc    Lấy payment status của booking
 * @route   GET /api/payment/status/:bookingId
 * @access  Private
 */
export const getBookingPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const booking: any = await bookingService.getBookingById(req.params.bookingId);
  const role = normalizeRole(req.user?.role);
  const isStaff = role === "admin" || role === "store_owner";
  const isOwner =
    (booking?.userId && String(booking.userId) === String(req.user?._id || req.user?.id)) ||
    (booking?.phone && req.user?.phone && String(booking.phone) === String(req.user.phone));
  if (!isStaff && !isOwner) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền xem trạng thái thanh toán của đơn này",
    });
  }

  successResponse(
    res,
    {
      paymentStatus: booking.paymentStatus,
      paymentDetails: booking.paymentDetails,
    },
    "Lấy payment status thành công",
  );
});

/**
 * @desc    Lấy payment status của order
 * @route   GET /api/payment/products/status/:orderId
 * @access  Private
 */
export const getOrderPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const order: any = await orderService.getOrderById(req.params.orderId);
  const role = normalizeRole(req.user?.role);
  const isStaff = role === "admin" || role === "store_owner";
  const ownerId = order?.userId?._id || order?.userId;
  if (!isStaff && ownerId && String(ownerId) !== String(req.user?._id || req.user?.id)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền xem trạng thái thanh toán của đơn hàng này",
    });
  }

  successResponse(
    res,
    {
      paymentStatus: order.paymentStatus,
      paymentDetails: order.paymentDetails,
    },
    "Lấy payment status thành công",
  );
});
export const vnpayIPNGet = asyncHandler(async (req: Request, res: Response) => {
  const result: any = await paymentService.verifyVNPayIPN(req.query);
  if (result.success && result.data?.orderId) {
    const { orderId, amount, transactionId } = result.data;
    try {
      await bookingService.updatePaymentStatus(orderId, "paid", {
        transactionId,
        gateway: "vnpay",
        amount,
      });
    } catch {
      try {
        await orderService.updateOrderPaymentStatus(orderId, "paid", {
          transactionId,
          gateway: "vnpay",
          amount,
        });
      } catch {}
    }
  }
  res.json(result);
});

export const momoIPNGet = asyncHandler(async (req: Request, res: Response) => {
  const result: any = await paymentService.verifyMoMoIPN(req.query);
  if (result.success && result.data?.orderId) {
    const { orderId, amount, transactionId } = result.data;
    try {
      await bookingService.updatePaymentStatus(orderId, "paid", {
        transactionId,
        gateway: "momo",
        amount,
      });
    } catch {
      try {
        await orderService.updateOrderPaymentStatus(orderId, "paid", {
          transactionId,
          gateway: "momo",
          amount,
        });
      } catch {}
    }
  }
  res.json(result);
});

/**
 * @desc    Tạo mã thanh toán VietQR ngân hàng 24/7 (Napas 247)
 * @route   POST /api/payment/vietqr/create
 * @access  Private
 */
export const createVietQRPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, amount } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp orderId",
    });
  }

  let resolvedAmount = Math.round(Number(amount || 0));
  const LaundryOrder = (await import("../models/LaundryOrder")).default;
  const existingOrder: any = await (LaundryOrder as any).findOne({ id: orderId });
  if (existingOrder && existingOrder.totalPrice) {
    resolvedAmount = Math.round(Number(existingOrder.totalPrice));
  }

  if (!resolvedAmount || resolvedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Số tiền thanh toán không hợp lệ",
    });
  }

  // Cấu hình tài khoản thụ hưởng VietQR ProLaundry
  const BANK_ID = "MB"; // Ngân hàng Quân Đội MBBank
  const ACCOUNT_NO = "0908123456";
  const ACCOUNT_NAME = "CONG TY TNHH PROLAUNDRY VIET NAM";
  const transferContent = encodeURIComponent(`GIATLA ${orderId}`);
  const encodedAccName = encodeURIComponent(ACCOUNT_NAME);

  // Sinh link ảnh VietQR chuẩn Napas247 theo chuẩn VietQR.io
  const qrImageUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${resolvedAmount}&addInfo=${transferContent}&accountName=${encodedAccName}`;

  if (existingOrder) {
    try {
      await (LaundryOrder as any).findOneAndUpdate(
        { id: orderId },
        {
          paymentMethod: "vietqr",
          vietQrUrl: qrImageUrl,
        }
      );
    } catch {}
  }

  successResponse(
    res,
    {
      orderId,
      amount: resolvedAmount,
      bankId: BANK_ID,
      bankName: "MBBank - Ngân Hàng Quân Đội",
      accountNumber: ACCOUNT_NO,
      accountName: ACCOUNT_NAME,
      transferContent: `GIATLA ${orderId}`,
      qrImageUrl,
      expiresInMinutes: 15,
    },
    "Tạo mã chuyển khoản VietQR thành công"
  );
});

/**
 * @desc    Xác nhận thanh toán VietQR (Yêu cầu chữ ký HMAC Webhook hoặc Admin/Chủ tiệm xác nhận)
 * @route   POST /api/payment/vietqr/confirm
 * @access  Signed Webhook / Admin / Store Owner
 */
export const confirmVietQRPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, transactionId, amount } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp mã đơn hàng orderId",
    });
  }

  const LaundryOrder = (await import("../models/LaundryOrder")).default;
  const order: any = await (LaundryOrder as any).findOne({ id: orderId });
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy đơn hàng tương ứng",
    });
  }

  const hasValidSig = verifyVietQrWebhookSignature(req);
  const authRole = req.user ? normalizeRole(req.user.role) : "";
  const isStaff = authRole === "admin" || authRole === "store_owner";
  const isOrderOwner =
    Boolean(req.user) &&
    ((order.userId && String(order.userId) === String(req.user._id || req.user.id)) ||
      (order.phoneNumber &&
        req.user.phone &&
        String(order.phoneNumber) === String(req.user.phone)));
  const isDevOwnerDemo = config.allowDemoPaymentConfirm && isOrderOwner;

  if (!hasValidSig && !isStaff && !isDevOwnerDemo) {
    return res.status(403).json({
      success: false,
      message:
        "Thiếu chữ ký xác thực webhook VietQR hợp lệ hoặc quyền Chủ tiệm/Admin",
    });
  }

  const expectedTotal = Math.round(Number(order.totalPrice || 0));
  if (hasValidSig && amount !== undefined && Number(amount) < expectedTotal) {
    return res.status(400).json({
      success: false,
      message: "Số tiền thanh toán không đủ theo giá trị đơn hàng",
    });
  }

  if (order.paymentStatus === "paid") {
    return successResponse(
      res,
      {
        orderId,
        paymentStatus: "paid",
        transactionId: order.paymentTransactionId || transactionId || `TXN-VQR-${Date.now()}`,
        paidAt: order.paidAt || new Date().toISOString(),
      },
      "Đơn hàng đã được xác nhận thanh toán trước đó"
    );
  }

  const resolvedTxId = transactionId || `TXN-VQR-${Date.now()}`;
  const paidAt = new Date().toISOString();

  await (LaundryOrder as any).findOneAndUpdate(
    { id: orderId },
    {
      paymentStatus: "paid",
      paymentTransactionId: resolvedTxId,
      paidAt,
    },
    { new: true }
  );

  successResponse(
    res,
    {
      orderId,
      paymentStatus: "paid",
      transactionId: resolvedTxId,
      paidAt,
    },
    "Xác nhận thanh toán VietQR thành công"
  );
});

