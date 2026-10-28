import mongoose from "mongoose";

const orderDetailItemSchema = new mongoose.Schema(
  {
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    fabricType: { type: String, default: "Cotton / Đồ hỗn hợp" },
    garmentDescription: { type: String, default: "" },
    careInstructions: { type: String, default: "" },
    pricingType: { type: String, default: "per_kg" },
    unitName: { type: String, default: "kg" },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    estimatedQuantity: { type: Number },
    actualQuantity: { type: Number, default: null },
    estimatedLineTotal: { type: Number },
    actualLineTotal: { type: Number, default: null },
    aiInspectionResult: { type: String, default: "" },
  },
  { _id: false }
);

const laundryOrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String },
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    description: { type: String, default: "" },
    items: { type: [orderDetailItemSchema], required: true },
    pickupDate: { type: String, required: true },
    pickupTime: { type: String, required: true },
    deliveryDate: { type: String, required: true },
    deliveryTime: { type: String, required: true },
    actualWeighedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
    promoCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    estimatedSubtotal: { type: Number },
    actualSubtotal: { type: Number, default: null },
    deliveryFee: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    weightConfirmStatus: {
      type: String,
      enum: ["not_weighed", "waiting_customer", "accepted", "rejected_return"],
      default: "not_weighed",
    },
    status: { type: String, default: "pending" },
    storeId: { type: String, default: "store-hcm-q1" },
    storeName: { type: String, default: "Tiệm Giặt Sấy Vô Trùng Q1" },
    shipperId: { type: String, default: "" },
    shipperName: { type: String, default: "" },
    shipperPhone: { type: String, default: "" },
    customerCoordinates: {
      lat: { type: Number, default: 10.7682 },
      lng: { type: Number, default: 106.6912 },
    },
    aiInspection: {
      type: Object,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["vietqr", "vnpay", "momo", "payos", "cod", "cash"],
      default: "vietqr",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
    },
    vietQrUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const MongoLaundryOrder =
  mongoose.models.LaundryOrder || mongoose.model("LaundryOrder", laundryOrderSchema);

import { createModelFallback } from "../utils/dbFallback";

const LaundryOrderProxy = new Proxy(MongoLaundryOrder, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const fallback = createModelFallback("laundry_orders");
    if (prop in fallback) {
      return (fallback as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default LaundryOrderProxy;
