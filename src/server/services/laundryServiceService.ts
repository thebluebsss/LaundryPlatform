// @ts-nocheck
import LaundryService from "../models/LaundryService";
import { NotFoundError } from "../utils/errorHandler";

/**
 * Lấy danh sách laundry services với filters
 */
export const getLaundryServices = async (filters: any = {}) => {
  const query: any = {};

  // Filters
  if (filters.category) query.category = filters.category;
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }

  // Search
  if (filters.search) {
    query.name = new RegExp(filters.search, "i");
  }

  // Sort
  let sort: any = { createdAt: -1 };

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 100; // Default fetch more
  const skip = (page - 1) * limit;

  const [services, total] = await Promise.all([
    LaundryService.find(query).sort(sort).skip(skip).limit(limit),
    LaundryService.countDocuments(query),
  ]);

  return {
    services,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy chi tiết laundry service
 */
export const getLaundryServiceById = async (id: string) => {
  const service = await LaundryService.findById(id);
  if (!service) {
    throw new NotFoundError("Dịch vụ không tồn tại");
  }
  return service;
};

/**
 * Tạo laundry service mới
 */
export const createLaundryService = async (serviceData: any) => {
  const service = await LaundryService.create(serviceData);
  return service;
};

/**
 * Cập nhật laundry service
 */
export const updateLaundryService = async (id: string, updateData: any) => {
  const service = await LaundryService.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  if (!service) {
    throw new NotFoundError("Dịch vụ không tồn tại");
  }

  return service;
};

/**
 * Xóa laundry service
 */
export const deleteLaundryService = async (id: string) => {
  const service = await LaundryService.findByIdAndDelete(id);
  if (!service) {
    throw new NotFoundError("Dịch vụ không tồn tại");
  }
  return service;
};
