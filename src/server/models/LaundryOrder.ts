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
    customerSpecialRequest: { type: String, default: "" },
    extraFee: { type: Number, default: 0 },
    extraFeeReason: { type: String, default: "" },
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
    storeId: { type: String, default: "store-hn-hoankiem" },
    storeName: { type: String, default: "Tiệm Giặt Sạch Sẽ Hoàn Kiếm" },
    shipperId: { type: String, default: "" },
    shipperName: { type: String, default: "" },
    shipperPhone: { type: String, default: "" },
    customerCoordinates: {
      lat: { type: Number, default: 21.0285 },
      lng: { type: Number, default: 105.8542 },
    },
    storeCoordinates: {
      lat: { type: Number, default: 21.0325 },
      lng: { type: Number, default: 105.8582 },
    },
    driverLocation: {
      lat: { type: Number },
      lng: { type: Number },
      heading: { type: Number },
      speedKmh: { type: Number },
      updatedAt: { type: String },
      driverId: { type: String },
      driverName: { type: String },
    },
    messages: {
      type: [
        {
          id: { type: String },
          orderId: { type: String },
          senderRole: { type: String },
          senderName: { type: String },
          text: { type: String },
          isQuickReply: { type: Boolean, default: false },
          createdAt: { type: String },
        },
      ],
      default: [],
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
    paymentTransactionId: { type: String, default: "" },
    paidAt: { type: String, default: "" },
    vietQrUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
    strict: false,
  }
);

if (mongoose.models.LaundryOrder) {
  delete mongoose.models.LaundryOrder;
}

const MongoLaundryOrder = mongoose.model("LaundryOrder", laundryOrderSchema);

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
