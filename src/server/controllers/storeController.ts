import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse, errorResponse } from "../utils/response";
import Store from "../models/Store";
import User from "../models/User";

// Haversine formula to calculate distance in km
const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

const normalizeStoreDoc = (doc: any) => {
  const s = doc?.toObject ? doc.toObject() : doc;
  return {
    ...s,
    id: s.customId || s.id || s._id?.toString(),
  };
};

/**
 * @desc    Tìm kiếm cửa hàng gần vị trí GPS (Haversine distance)
 * @route   GET /api/stores/nearby
 * @access  Public
 */
export const getNearbyStores = asyncHandler(async (req: Request, res: Response) => {
  const lat = Number(req.query.lat || 21.0285);
  const lng = Number(req.query.lng || 105.8542);
  const radiusKm = Number(req.query.radiusKm || 50);
  const city = req.query.city as string | undefined;

  const query: any = { isActive: true };
  if (city && city !== "all") {
    query.city = city;
  }

  const dbStores = await Store.find(query);
  const sourceStores = dbStores.map(normalizeStoreDoc);

  const nearby = sourceStores
    .map((s: any) => ({
      ...s,
      distanceKm: getDistanceFromLatLonInKm(
        lat,
        lng,
        Number(s.lat || 21.0285),
        Number(s.lng || 105.8542)
      ),
    }))
    .filter((s: any) => s.distanceKm <= radiusKm)
    .sort((a: any, b: any) => a.distanceKm - b.distanceKm);

  successResponse(res, nearby, "Tìm kiếm cửa hàng gần vị trí GPS thành công");
});

/**
 * @desc    Lấy danh sách tất cả các cửa hàng giặt sấy từ CSDL
 * @route   GET /api/stores
 * @access  Public
 */
const escapeRegex = (raw: unknown) =>
  String(raw ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const maskPhone = (phone: string) => {
  const clean = String(phone || "").trim();
  if (clean.length < 7) return "***";
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
};

export const getStores = asyncHandler(async (req: Request, res: Response) => {
  const { city, status, search, ownerId } = req.query;

  const query: any = {};
  if (city && city !== "all") query.city = city;
  if (status && status !== "all") query.status = status;
  if (ownerId) query.ownerId = ownerId;
  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { address: { $regex: safeSearch, $options: "i" } },
      { district: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const stores = await Store.find(query);
  const formatted = stores
    .filter((s: any) => s.isActive !== false)
    .map(normalizeStoreDoc);

  successResponse(res, formatted, "Lấy danh sách cửa hàng thành công");
});

/**
 * @desc    Lấy thông tin chi tiết 1 cửa hàng
 * @route   GET /api/stores/:id
 * @access  Public
 */
export const getStoreById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  let store = await (Store as any).findOne({ customId: id });
  if (!store) {
    store = await (Store as any).findById(id);
  }

  if (!store) {
    return errorResponse(res, "Không tìm thấy cửa hàng này", 404);
  }

  successResponse(res, normalizeStoreDoc(store), "Lấy thông tin cửa hàng thành công");
});

/**
 * @desc    Lấy danh sách tài xế thực tế trong CSDL (ẩn SĐT/biển số chi tiết nếu chưa đăng nhập)
 * @route   GET /api/stores/drivers
 * @access  Public (full contact info for authenticated users/staff)
 */
export const getStoreDrivers = asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.query;
  const isAuthenticated = Boolean(req.user);
  const users = await (User as any).find({ role: "driver" });
  const drivers = (users || []).map((u: any) => {
    const obj = u.toObject ? u.toObject() : u;
    const rawPhone = obj.phone || "0911222333";
    const rawPlate = obj.licensePlate || "29-B1 888.99";
    return {
      id: obj._id || obj.id || obj.username,
      name: obj.fullName || obj.username || "Tài xế Sạch Sẽ",
      phone: isAuthenticated ? rawPhone : maskPhone(rawPhone),
      storeId: obj.assignedStoreId || (storeId as string) || "",
      storeName: obj.storeName || "Hệ thống Sạch Sẽ",
      vehicleType: obj.vehicleType === "van" ? "van" : "bike",
      licensePlate: isAuthenticated ? rawPlate : "***",
      rating: 4.9,
      completedOrders: obj.completedOrders || 0,
      lat: obj.currentLocation?.lat || obj.lat || 21.0285,
      lng: obj.currentLocation?.lng || obj.lng || 105.8542,
      status: obj.isAvailable === false ? "busy" : "available",
    };
  });

  const filtered =
    storeId && storeId !== "all"
      ? drivers.filter((d: any) => !d.storeId || d.storeId === storeId)
      : drivers;

  successResponse(res, filtered, "Lấy danh sách tài xế thành công");
});

/**
 * @desc    Tạo mới một cửa hàng
 * @route   POST /api/stores
 * @access  Private (Admin / Store Owner)
 */
export const createStore = asyncHandler(async (req: Request, res: Response) => {
  const storeData = { ...req.body };
  const customId =
    storeData.id ||
    storeData.customId ||
    `store-${Date.now()}`;
  const code =
    storeData.code ||
    `STORE_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const newStore = await (Store as any).create({
    ...storeData,
    customId,
    id: customId,
    code,
    rating: storeData.rating ?? 5.0,
    reviewCount: storeData.reviewCount ?? 0,
    status: storeData.status || "open",
    isActive: true,
  });

  successResponse(res, normalizeStoreDoc(newStore), "Tạo cửa hàng mới thành công", 201);
});

/**
 * @desc    Cập nhật thông tin cửa hàng
 * @route   PUT/PATCH /api/stores/:id
 * @access  Private (Admin / Store Owner)
 */
export const updateStore = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  let existing = await (Store as any).findOne({ customId: id });
  if (!existing) {
    try {
      existing = await (Store as any).findById(id);
    } catch {}
  }

  if (!existing) {
    return errorResponse(res, "Không tìm thấy cửa hàng để cập nhật", 404);
  }

  const user = req.user;
  const userRole = user?.role === "store_manager" ? "store_owner" : user?.role;
  if (userRole !== "admin") {
    const storeKey = String(existing.customId || existing.id || existing._id || "");
    const ownerMatches =
      existing.ownerId && String(existing.ownerId) === String(user?._id || user?.id);
    const assignedMatches =
      user?.assignedStoreId && String(user.assignedStoreId) === storeKey;
    if (!ownerMatches && !assignedMatches && user?.assignedStoreId) {
      return errorResponse(res, "Bạn không có quyền cập nhật cửa hàng của đối tác khác", 403);
    }
  }

  const allowedFields = [
    "name",
    "address",
    "district",
    "city",
    "phone",
    "lat",
    "lng",
    "openHours",
    "priceRange",
    "status",
    "description",
    "image",
    "images",
    "services",
    "isActive",
  ];
  const safeUpdate: Record<string, any> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === "isActive" && userRole !== "admin") continue;
      safeUpdate[field] = req.body[field];
    }
  }

  const store = await (Store as any).findByIdAndUpdate(
    existing._id || existing.id,
    { $set: safeUpdate },
    { new: true }
  );

  successResponse(res, normalizeStoreDoc(store), "Cập nhật cửa hàng thành công");
});

/**
 * @desc    Xóa cửa hàng
 * @route   DELETE /api/stores/:id
 * @access  Private (Admin)
 */
export const deleteStore = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  let store = await (Store as any).findOneAndDelete({ customId: id });
  if (!store) {
    store = await (Store as any).findByIdAndDelete(id);
  }

  successResponse(res, null, "Đã xóa cửa hàng khỏi hệ thống");
});
