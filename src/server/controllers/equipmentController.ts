import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import * as equipmentService from "../services/equipmentService";

export const getEquipment = asyncHandler(async (req: Request, res: Response) => {
  const equipment = await equipmentService.getEquipment(req.query);
  successResponse(res, equipment, "Lấy danh sách equipment thành công");
});

export const getEquipmentById = asyncHandler(async (req: Request, res: Response) => {
  const equipment = await equipmentService.getEquipmentById(req.params.id);
  successResponse(res, equipment, "Lấy chi tiết equipment thành công");
});

export const createEquipment = asyncHandler(async (req: Request, res: Response) => {
  const equipment = await equipmentService.createEquipment(req.body);
  successResponse(res, equipment, "Tạo equipment thành công", 201);
});

export const updateEquipment = asyncHandler(async (req: Request, res: Response) => {
  const equipment = await equipmentService.updateEquipment(
    req.params.id,
    req.body,
  );
  successResponse(res, equipment, "Cập nhật equipment thành công");
});

export const deleteEquipment = asyncHandler(async (req: Request, res: Response) => {
  await equipmentService.deleteEquipment(req.params.id);
  successResponse(res, null, "Xóa equipment thành công");
});
