import { Request, Response } from "express";
import { asyncHandler, ForbiddenError } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import * as equipmentService from "../services/equipmentService";

const assertEquipmentStoreAccess = (user: any, equipmentStoreId?: string) => {
  if (!user || user.role === "admin") return;
  if (
    user.assignedStoreId &&
    equipmentStoreId &&
    String(user.assignedStoreId) !== String(equipmentStoreId)
  ) {
    throw new ForbiddenError("Bạn không có quyền thao tác thiết bị của cửa hàng khác");
  }
};

export const getEquipment = asyncHandler(async (req: Request, res: Response) => {
  const filters: any = { ...req.query };
  if (req.user && req.user.role === "store_owner" && req.user.assignedStoreId) {
    filters.storeId = req.user.assignedStoreId;
  }
  const equipment = await equipmentService.getEquipment(filters);
  successResponse(res, equipment, "Lấy danh sách equipment thành công");
});

export const getEquipmentById = asyncHandler(async (req: Request, res: Response) => {
  const equipment = await equipmentService.getEquipmentById(req.params.id);
  successResponse(res, equipment, "Lấy chi tiết equipment thành công");
});

export const createEquipment = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  if (req.user && req.user.role === "store_owner" && req.user.assignedStoreId) {
    payload.storeId = req.user.assignedStoreId;
  }
  const equipment = await equipmentService.createEquipment(payload);
  successResponse(res, equipment, "Tạo equipment thành công", 201);
});

export const updateEquipment = asyncHandler(async (req: Request, res: Response) => {
  const existing: any = await equipmentService.getEquipmentById(req.params.id);
  assertEquipmentStoreAccess(req.user, existing?.storeId);
  const equipment = await equipmentService.updateEquipment(
    req.params.id,
    req.body,
  );
  successResponse(res, equipment, "Cập nhật equipment thành công");
});

export const deleteEquipment = asyncHandler(async (req: Request, res: Response) => {
  const existing: any = await equipmentService.getEquipmentById(req.params.id);
  assertEquipmentStoreAccess(req.user, existing?.storeId);
  await equipmentService.deleteEquipment(req.params.id);
  successResponse(res, null, "Xóa equipment thành công");
});
