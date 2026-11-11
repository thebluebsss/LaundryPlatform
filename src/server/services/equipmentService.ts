// @ts-nocheck
import Equipment from "../models/Equipment";
import { NotFoundError } from "../utils/errorHandler";

/**
 * Lấy danh sách equipment
 */
export const getEquipment = async (filters: any = {}) => {
  const query: any = {};

  if (filters.type && filters.type !== "all") query.type = filters.type;
  if (filters.status && filters.status !== "all") query.status = filters.status;

  if (filters.search) {
    query.$or = [
      { name: new RegExp(filters.search, "i") },
      { model: new RegExp(filters.search, "i") },
      { serialNumber: new RegExp(filters.search, "i") },
      { location: new RegExp(filters.search, "i") },
    ];
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const [equipment, total] = await Promise.all([
    Equipment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Equipment.countDocuments(query),
  ]);

  return {
    equipment,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Lấy chi tiết equipment
 */
export const getEquipmentById = async (equipmentId: string) => {
  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) {
    throw new NotFoundError("Equipment không tồn tại");
  }
  return equipment;
};

/**
 * Tạo equipment mới
 */
export const createEquipment = async (equipmentData: any) => {
  const equipment = await Equipment.create({
    ...equipmentData,
    purchaseDate: equipmentData.purchaseDate || new Date().toISOString(),
  });
  return equipment;
};

/**
 * Cập nhật equipment
 */
export const updateEquipment = async (equipmentId: string, updateData: any) => {
  const equipment = await Equipment.findByIdAndUpdate(
    equipmentId,
    { $set: updateData },
    { new: true, runValidators: false },
  );

  if (!equipment) {
    throw new NotFoundError("Equipment không tồn tại");
  }

  return equipment;
};

/**
 * Xóa equipment
 */
export const deleteEquipment = async (equipmentId: string) => {
  const equipment = await Equipment.findByIdAndDelete(equipmentId);
  if (!equipment) {
    throw new NotFoundError("Equipment không tồn tại");
  }
  return equipment;
};
