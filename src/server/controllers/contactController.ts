import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import ContactInquiry from "../models/ContactInquiry";

/**
 * @desc    Gửi liên hệ & yêu cầu tư vấn dịch vụ giặt sấy đặc biệt từ khách hàng
 * @route   POST /api/contact
 * @access  Public
 */
export const createContactInquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Lời nhắn",
      });
    }

    const inquiry = await (ContactInquiry as any).create({
      id: "INQ-" + Math.floor(10000 + Math.random() * 90000),
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : "",
      message: String(message).trim(),
      status: "new",
    });

    successResponse(
      res,
      inquiry,
      "Gửi yêu cầu tư vấn dịch vụ giặt sấy thành công",
      201
    );
  }
);

/**
 * @desc    Lấy danh sách liên hệ & yêu cầu tư vấn của khách hàng
 * @route   GET /api/contact
 * @access  Public / Store / Admin
 */
export const getContactInquiries = asyncHandler(
  async (req: Request, res: Response) => {
    const inquiries = await (ContactInquiry as any)
      .find({})
      .sort({ createdAt: -1 });
    successResponse(
      res,
      inquiries || [],
      "Lấy danh sách yêu cầu liên hệ thành công"
    );
  }
);
