export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest",
} as const;

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const PAYMENT_METHODS = {
  COD: "cod",
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  VNPAY: "vnpay",
  MOMO: "momo",
  STRIPE: "stripe",
  PAYOS: "payos",
} as const;

export const LAUNDRY_SERVICES = [
  "Giặt thường",
  "Giặt hấp",
  "Giặt khô",
  "Giặt chăn",
  "Giặt màn",
  "Giặt gối",
  "Giặt thảm",
  "Giặt giày",
  "Giặt áo khoác",
  "Giặt vest",
  "Giặt váy cưới",
  "Giặt rèm",
  "Giặt sofa",
  "Giặt nệm",
  "Giặt túi xách",
  "Giặt đồ da",
  "Giặt đồ len",
  "Giặt đồ lụa",
  "Giặt đồ công sở",
  "Giặt đồ thể thao",
  "Giặt đồ trẻ em",
  "Giặt đồ nội y",
  "Giặt đồ bảo hộ",
  "Giặt đồ y tế",
  "Giặt đồ khách sạn",
  "Giặt đồ nhà hàng",
  "Giặt đồ spa",
  "Giặt đồ gym",
  "Giặt đồ văn phòng",
  "Giặt hàng loạt",
];

export const PRODUCT_CATEGORIES = [
  "Bột giặt",
  "Nước xả",
  "Nước giặt",
  "Xà phòng",
  "Nước tẩy",
  "Phụ kiện",
  "accessory",
  "care",
  "cleaning",
  "detergent",
  "softener",
  "bleach",
  "bag",
  "other"
];

export const EQUIPMENT_TYPES = {
  WASHING_MACHINE: "washing-machine",
  DRYER: "dryer",
  IRON: "iron",
  OTHER: "other",
} as const;

export const EQUIPMENT_STATUS = {
  WORKING: "working",
  MAINTENANCE: "maintenance",
  BROKEN: "broken",
} as const;
