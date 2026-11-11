import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import * as orderService from "../services/orderService";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.body, req.user._id);
  successResponse(res, order, "Tạo order thành công", 201);
});

export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await orderService.getUserOrders(
    req.user._id,
    parseInt(page as string) || 1,
    parseInt(limit as string) || 10,
  );
  successResponse(res, result, "Lấy danh sách orders thành công");
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, orderStatus, paymentStatus } = req.query;
  const filters = { orderStatus, paymentStatus };
  const result = await orderService.getAllOrders(
    filters,
    parseInt(page as string) || 1,
    parseInt(limit as string) || 10,
  );
  successResponse(res, result, "Lấy danh sách orders thành công");
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);
  successResponse(res, order, "Lấy chi tiết order thành công");
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { orderStatus } = req.body;
  const order = await orderService.updateOrderStatus(
    req.params.id,
    orderStatus,
  );
  successResponse(res, order, "Cập nhật trạng thái thành công");
});

export const updateOrderPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { paymentStatus, paymentDetails } = req.body;
  const order = await orderService.updateOrderPaymentStatus(
    req.params.id,
    paymentStatus,
    paymentDetails,
  );
  successResponse(res, order, "Cập nhật trạng thái thanh toán thành công");
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user.role === "admin";
  const order = await orderService.cancelOrder(
    req.params.id,
    req.user._id,
    isAdmin,
  );
  successResponse(res, order, "Hủy order thành công");
});
