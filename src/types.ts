export type PricingType = "per_kg" | "per_item";

export type ServiceCategory =
  | "wash_fold"
  | "dry_clean"
  | "heavy_items"
  | "special_care";

export interface LaundryService {
  id: string;
  name: string;
  category: ServiceCategory;
  pricingType: PricingType;
  unitPrice: number;
  unitName: string;
  description: string;
  iconName: string;
  durationDays: number;
  featured?: boolean;
}

export interface CartItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  pricingType: PricingType;
  unitName: string;
  // Multi-fabric & actual weighing fields (Order_Details)
  fabricType?: string;
  garmentDescription?: string;
  careInstructions?: string;
  estimatedQuantity?: number;
  actualQuantity?: number;
  estimatedLineTotal?: number;
  actualLineTotal?: number;
}

export type WeightConfirmStatus =
  | "not_weighed"
  | "waiting_customer"
  | "accepted"
  | "rejected_return";

export type OrderStatus =
  | "pending" // Chờ nhận hàng
  | "picking_up" // Đang lấy đồ
  | "sorting" // Đang phân loại / cân đo
  | "waiting_confirm" // Chờ khách xác nhận khối lượng thực tế
  | "washing" // Đang giặt sấy
  | "ironing" // Đang là ủi & đóng gói
  | "delivering" // Đang giao hàng
  | "returning" // Đang hoàn trả đồ (khách từ chối giá mới)
  | "completed" // Đã hoàn thành
  | "cancelled"; // Đã hủy

export interface LaundryStore {
  id: string;
  name: string;
  code: string;
  address: string;
  district: string;
  city: "hcm" | "hanoi";
  phone: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  status: "open" | "busy" | "closed";
  openHours: string;
  priceRange: string;
  features: string[];
  image: string;
  managerName?: string;
  managerPhone?: string;
  activeShippersCount: number;
  activeMachinesCount: number;
}

export interface CourierDriver {
  id: string;
  name: string;
  phone: string;
  storeId: string;
  storeName: string;
  vehicleType: "bike" | "van";
  rating: number;
  completedOrders: number;
  lat: number;
  lng: number;
  status: "available" | "picking" | "delivering";
  avatar?: string;
}

export interface GarmentInspectionResult {
  garmentType: string;
  detectedFabric: string;
  confidence: number;
  careInstructions: string[];
  recommendedService: ServiceCategory;
  recommendedServiceName: string;
  declaredService: string;
  isDiscrepancy: boolean;
  discrepancySeverity: "none" | "low" | "medium" | "high";
  warningMessage: string;
  suggestedUnitPrice: number;
  fraudRiskScore: number;
  notes: string;
  imageUrl?: string;
}

export interface DeliveryTask {
  id: string;
  orderId: string;
  taskType: "pickup_from_customer" | "deliver_to_customer";
  storeId: string;
  storeName: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  storeAddress: string;
  pickupCoordinates: { lat: number; lng: number };
  deliveryCoordinates: { lat: number; lng: number };
  distanceKm: number;
  shippingFee: number;
  tipAmount?: number;
  status: "broadcasting" | "accepted" | "picking_up" | "arrived_pickup" | "in_transit" | "completed" | "cancelled";
  notes?: string;
  createdAt?: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  completedAt?: string;
}

export interface LaundryOrder {
  id: string;
  userId?: string;
  storeId?: string;
  storeName?: string;
  shipperId?: string;
  shipperName?: string;
  shipperPhone?: string;
  customerCoordinates?: { lat: number; lng: number };
  customerName: string;
  phoneNumber: string;
  address: string;
  district: string;
  items: CartItem[];
  products?: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    unit: string;
  }[];
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
  orderDate?: string;
  description?: string;
  actualWeighedAt?: string;
  completedAt?: string;
  notes: string;
  promoCode?: string;
  discountAmount: number;
  subtotal: number;
  estimatedSubtotal?: number;
  actualSubtotal?: number;
  weightConfirmStatus?: WeightConfirmStatus;
  productsTotal?: number;
  deliveryFee: number;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod?: "vietqr" | "vnpay" | "momo" | "payos" | "cod" | "cash";
  paymentStatus?: "pending" | "paid" | "refunded" | "failed";
  vietQrUrl?: string;
  aiInspection?: GarmentInspectionResult;
  createdAt: string;
}

export interface PromoCode {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  value: number;
  minSubtotal?: number;
}

export interface OrderReview {
  id: string;
  orderId: string;
  userId?: string;
  customerName: string;
  customerPhone?: string;
  storeId: string;
  storeName: string;
  shipperId?: string;
  shipperName?: string;
  storeRating: number;
  storeComment: string;
  shipperRating: number;
  shipperComment: string;
  storeReply?: string;
  repliedAt?: string | null;
  isHidden?: boolean;
  createdAt: string;
  updatedAt?: string;
}

