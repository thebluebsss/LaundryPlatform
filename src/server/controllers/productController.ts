import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import * as productService from "../services/productService";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await productService.getProducts(req.query);
  successResponse(res, products, "Lấy danh sách products thành công");
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  successResponse(res, product, "Lấy chi tiết product thành công");
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  successResponse(res, product, "Tạo product thành công", 201);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  successResponse(res, product, "Cập nhật product thành công");
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  successResponse(res, null, "Xóa product thành công");
});

export const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { service } = req.query;
  const { bookingId } = req.params;

  // Nếu có bookingId, lấy service từ booking
  let serviceType: any = service;
  if (bookingId && !service) {
    const bookingService = await import("../services/bookingService");
    const booking = await bookingService.getBookingById(bookingId);
    serviceType = booking.service;
  }

  const products = await productService.getRecommendations(serviceType || "all");
  successResponse(res, products, "Lấy recommendations thành công");
});
