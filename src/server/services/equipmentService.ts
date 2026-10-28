// @ts-nocheck
import Equipment from "../models/Equipment";
import { NotFoundError } from "../utils/errorHandler";

const DEFAULT_EQUIPMENT = [
  {
    _id: "eq-wash-01",
    name: "Máy giặt công nghiệp Electrolux 20kg #01",
    type: "washing-machine",
    model: "WH6-20CV",
    serialNumber: "ELX-2026-W001",
    purchaseDate: "2025-03-15",
    status: "working",
    location: "Tiệm Giặt Sấy Vô Trùng Q1 - Khu Giặt Thường",
    notes: "Đang chạy mẻ giặt Cotton 5.5kg (Đơn ORD-8825)",
  },
  {
    _id: "eq-wash-02",
    name: "Máy giặt khô hữu cơ LG Commercial 15kg #02",
    type: "washing-machine",
    model: "LG-GIANT-C15",
    serialNumber: "LGC-2026-W002",
    purchaseDate: "2025-05-10",
    status: "working",
    location: "Tiệm Giặt Sấy Vô Trùng Q1 - Khu Đồ Cao Cấp",
    notes: "Chuyên xử lý lụa, vest, áo dài và dạ lông cừu",
  },
  {
    _id: "eq-dryer-01",
    name: "Máy sấy đảo chiều SpeedQueen 25kg #01",
    type: "dryer",
    model: "SQ-ST055",
    serialNumber: "SPQ-2026-D001",
    purchaseDate: "2025-03-15",
    status: "working",
    location: "Tiệm Giặt Sấy Vô Trùng Q1 - Khu Sấy Khử Khuẩn UV",
    notes: "Tích hợp đèn UV-C khử trùng lồng sấy 99.9%",
  },
  {
    _id: "eq-dryer-02",
    name: "Tủ hấp sấy tạo phom LG Styler Pro #02",
    type: "dryer",
    model: "S5MBP-PRO",
    serialNumber: "LGS-2026-D002",
    purchaseDate: "2025-08-20",
    status: "maintenance",
    location: "Tiệm Giặt Sấy Vô Trùng Q1 - Khu Đồ Cao Cấp",
    notes: "Đang vệ sinh bộ lọc hơi nước định kỳ hàng tháng",
  },
  {
    _id: "eq-iron-01",
    name: "Bàn ủi hơi nước công nghiệp Laurastar #01",
    type: "iron",
    model: "LS-PULSE-PRO",
    serialNumber: "LRS-2026-I001",
    purchaseDate: "2025-06-01",
    status: "working",
    location: "Tiệm Giặt Sấy Vô Trùng Q1 - Khu Hoàn Thiện & Đóng Gói",
    notes: "Áp suất hơi nước khô 3.5 bar chống bóng vải",
  },
];

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

  let [equipment, total] = await Promise.all([
    Equipment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Equipment.countDocuments(query),
  ]);

  if ((!equipment || equipment.length === 0) && !filters.type && !filters.status && !filters.search) {
    for (const item of DEFAULT_EQUIPMENT) {
      try {
        await Equipment.create(item);
      } catch (e) {}
    }
    equipment = await Equipment.find(query).sort({ createdAt: -1 });
    if (!equipment || equipment.length === 0) {
      equipment = DEFAULT_EQUIPMENT;
    }
    total = equipment.length;
  }

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
