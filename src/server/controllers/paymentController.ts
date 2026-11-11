import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import * as paymentService from "../services/paymentService";
import * as bookingService from "../services/bookingService";
import * as orderService from "../services/orderService";

/**
 * @desc    Tạo VNPay payment URL cho booking
 * @route   POST /api/payment/vnpay/create
 * @access  Public
 */
export const createVNPayBooking = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, amount, orderInfo } = req.body;
  const ipAddr = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

  const paymentUrl = await paymentService.createVNPayPaymentUrl(
    bookingId,
    amount,
    orderInfo,
    ipAddr,
  );

  successResponse(res, { paymentUrl }, "Tạo payment URL thành công");
});

/**
 * @desc    Tạo VNPay payment URL cho order
 * @route   POST /api/payment/products/vnpay/create
 * @access  Private
 */
export const createVNPayOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, amount, orderInfo } = req.body;
  const ipAddr = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

  const paymentUrl = await paymentService.createVNPayPaymentUrl(
    orderId,
    amount,
    orderInfo,
    ipAddr,
  );

  successResponse(res, { paymentUrl }, "Tạo payment URL thành công");
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
  const result = await paymentService.verifyPayOSWebhook(req.body);

  if (result.success) {
    const { orderId, amount, transactionId } = result.data;

    try {
      await bookingService.updatePaymentStatus(orderId, "paid", {
        transactionId,
        gateway: "payos",
        amount,
      });
    } catch (error) {
      await orderService.updateOrderPaymentStatus(orderId, "paid", {
        transactionId,
        gateway: "payos",
        amount,
      });
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
 * @access  Public
 */
export const getBookingPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);

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
 * @access  Public
 */
export const getOrderPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.orderId);

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
  // Let callback parse GET queries too
  const result: any = await paymentService.verifyVNPayIPN(req.query);
  res.json(result);
});
export const momoIPNGet = asyncHandler(async (req: Request, res: Response) => {
  const result: any = await paymentService.verifyMoMoIPN(req.query);
  res.json(result);
});

/**
 * @desc    Tạo mã thanh toán VietQR ngân hàng 24/7 (Napas 247)
 * @route   POST /api/payment/vietqr/create
 * @access  Public
 */
export const createVietQRPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, amount, customerName, orderInfo } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp orderId và số tiền (amount)",
    });
  }

  // Cấu hình tài khoản thụ hưởng VietQR ProLaundry
  const BANK_ID = "MB"; // Ngân hàng Quân Đội MBBank
  const ACCOUNT_NO = "0908123456";
  const ACCOUNT_NAME = "CONG TY TNHH PROLAUNDRY VIET NAM";
  const transferContent = encodeURIComponent(`GIATLA ${orderId}`);
  const encodedAccName = encodeURIComponent(ACCOUNT_NAME);

  // Sinh link ảnh VietQR chuẩn Napas247 theo chuẩn VietQR.io
  const qrImageUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${Math.round(amount)}&addInfo=${transferContent}&accountName=${encodedAccName}`;

  // Cập nhật thông tin vào đơn hàng nếu có
  try {
    const LaundryOrder = (await import("../models/LaundryOrder")).default;
    await (LaundryOrder as any).findOneAndUpdate(
      { id: orderId },
      {
        paymentMethod: "vietqr",
        vietQrUrl: qrImageUrl,
      }
    );
  } catch (err) {}

  successResponse(
    res,
    {
      orderId,
      amount: Math.round(amount),
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
 * @desc    Xác nhận thanh toán VietQR (qua Webhook hoặc Khách xác nhận)
 * @route   POST /api/payment/vietqr/confirm
 * @access  Public
 */
export const confirmVietQRPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, transactionId, amount } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp mã đơn hàng orderId",
    });
  }

  try {
    const LaundryOrder = (await import("../models/LaundryOrder")).default;
    const order = await (LaundryOrder as any).findOneAndUpdate(
      { id: orderId },
      {
        paymentStatus: "paid",
        status: "washing",
      },
      { new: true }
    );

    successResponse(
      res,
      {
        orderId,
        paymentStatus: "paid",
        transactionId: transactionId || `TXN-VQR-${Date.now()}`,
        paidAt: new Date().toISOString(),
      },
      "Xác nhận thanh toán VietQR thành công"
    );
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi xác nhận giao dịch VietQR",
    });
  }
});

