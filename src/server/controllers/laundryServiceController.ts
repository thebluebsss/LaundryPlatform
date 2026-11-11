import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import * as laundryServiceService from "../services/laundryServiceService";

export const getLaundryServices = asyncHandler(async (req: Request, res: Response) => {
  const data = await laundryServiceService.getLaundryServices(req.query);
  successResponse(res, data, "Lấy danh sách dịch vụ thành công");
});

export const getLaundryServiceById = asyncHandler(async (req: Request, res: Response) => {
  const service = await laundryServiceService.getLaundryServiceById(req.params.id);
  successResponse(res, service, "Lấy chi tiết dịch vụ thành công");
});

export const createLaundryService = asyncHandler(async (req: Request, res: Response) => {
  const service = await laundryServiceService.createLaundryService(req.body);
  successResponse(res, service, "Tạo dịch vụ thành công", 201);
});

export const updateLaundryService = asyncHandler(async (req: Request, res: Response) => {
  const service = await laundryServiceService.updateLaundryService(req.params.id, req.body);
  successResponse(res, service, "Cập nhật dịch vụ thành công");
});

export const deleteLaundryService = asyncHandler(async (req: Request, res: Response) => {
  await laundryServiceService.deleteLaundryService(req.params.id);
  successResponse(res, null, "Xóa dịch vụ thành công");
});
