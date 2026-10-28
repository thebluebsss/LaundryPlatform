// @ts-nocheck
import { Request, Response } from "express";
import Store from "../models/Store";
import { DEFAULT_STORES, DEFAULT_DRIVERS } from "../../data/storesData";

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Tìm kiếm các cửa hàng gần nhất theo tọa độ GPS (Haversine formula)
 */
export const getNearbyStores = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 10.7769; // default HCM center
    const lng = parseFloat(req.query.lng as string) || 106.7009;
    const maxRadius = parseFloat(req.query.radius as string) || 15; // km

    let stores = await Store.find();
    if (!stores || stores.length === 0) {
      stores = DEFAULT_STORES;
    }

    const storesWithDistance = stores
      .map((store: any) => {
        const storeObj = store.toObject ? store.toObject() : { ...store };
        const distance = calculateDistanceKm(lat, lng, storeObj.lat, storeObj.lng);
        // Calculate dynamic delivery fee: 15k base for 3km, +4k/km beyond 3km
        const deliveryFee = distance <= 3 ? 15000 : 15000 + Math.ceil(distance - 3) * 4000;
        // Estimated pickup time: 15 - 45 mins
        const estimatedPickupMinutes = Math.min(60, Math.max(15, Math.round(distance * 5 + 10)));

        return {
          ...storeObj,
          distanceKm: distance,
          deliveryFee,
          estimatedPickupMinutes,
        };
      })
      .filter((store: any) => store.distanceKm <= maxRadius)
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      userLocation: { lat, lng },
      radiusKm: maxRadius,
      total: storesWithDistance.length,
      data: storesWithDistance,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tìm tiệm giặt gần nhất",
    });
  }
};

/**
 * Lấy danh sách tất cả các cửa hàng giặt sấy
 */
export const getStores = async (req: Request, res: Response) => {
  try {
    const { city, district, search, status } = req.query;
    let stores = await Store.find();

    if (!stores || stores.length === 0) {
      stores = DEFAULT_STORES;
    }

    let filtered = [...stores];

    if (city) {
      filtered = filtered.filter((s: any) => s.city === city);
    }

    if (district) {
      filtered = filtered.filter((s: any) => s.district === district);
    }

    if (status) {
      filtered = filtered.filter((s: any) => s.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (s: any) =>
          s.name?.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q) ||
          s.district?.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tải danh sách cửa hàng",
    });
  }
};

/**
 * Lấy thông tin chi tiết 1 cửa hàng theo ID
 */
export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let store = await Store.findById(id);

    if (!store) {
      store = DEFAULT_STORES.find((s) => s.id === id);
    }

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cửa hàng",
      });
    }

    // Attach nearby active drivers
    const drivers = DEFAULT_DRIVERS.filter((d) => d.storeId === id || !id);

    res.json({
      success: true,
      data: {
        ...store.toObject ? store.toObject() : store,
        drivers,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy thông tin cửa hàng",
    });
  }
};

/**
 * Lấy danh sách shipper/xe giặt sấy đang hoạt động trên bản đồ
 */
export const getStoreDrivers = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;
    let drivers = DEFAULT_DRIVERS;
    if (storeId) {
      drivers = drivers.filter((d) => d.storeId === storeId);
    }

    res.json({
      success: true,
      data: drivers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy vị trí tài xế",
    });
  }
};

/**
 * Tạo mới cửa hàng (Dành cho Super Admin / Store Admin)
 */
export const createStore = async (req: Request, res: Response) => {
  try {
    const storeData = req.body;
    if (!storeData.code) {
      storeData.code = "STORE_" + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const newStore = await Store.create(storeData);

    res.status(201).json({
      success: true,
      message: "Tạo cửa hàng mới thành công",
      data: newStore,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể tạo cửa hàng",
    });
  }
};

/**
 * Cập nhật thông tin cửa hàng
 */
export const updateStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedStore = await Store.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedStore) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cửa hàng để cập nhật",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật thông tin cửa hàng thành công",
      data: updatedStore,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật cửa hàng",
    });
  }
};

/**
 * Xóa cửa hàng
 */
export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Store.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Đã xóa cửa hàng thành công",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi xóa cửa hàng",
    });
  }
};
