import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional vì có thể có booking từ guest
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    service: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      default: "",
    },
    pickupTime: {
      type: String,
      default: "",
    },
    deliveryTime: {
      type: String,
      default: "",
    },
    promoCode: {
      type: String,
      default: "",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    productsTotal: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    items: [
      {
        serviceId: String,
        serviceName: String,
        quantity: Number,
        unitPrice: Number,
        pricingType: String,
        unitName: String,
      }
    ],
    products: [
      {
        productId: String,
        productName: String,
        quantity: Number,
        unitPrice: Number,
        unit: String,
      }
    ],
    pickupDate: {
      type: Date,
      required: false,
    },
    deliveryDate: {
      type: Date,
      required: false,
    },
    detergent: {
      type: String,
      enum: ["Omo", "Gain", "Bột giặt của tôi"],
      default: "Omo",
    },
    bleach: {
      type: String,
      enum: ["Sử dụng", "Không sử dụng"],
      default: "Sử dụng",
    },
    useBag: {
      type: String,
      enum: ["Có", "Không"],
      default: "Có",
    },
    dryCleaningItems: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: "",
    },
    estimatedWeight: {
      type: Number,
      required: false,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "bank_transfer", "vnpay", "momo"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "refunded", "cancelled"],
      default: "unpaid",
    },
    paymentDetails: {
      transactionId: String,
      paymentGateway: String,
      amount: Number,
      currency: { type: String, default: "VND" },
      paidAt: Date,
      cardLast4: String,
      bankName: String,
      gatewayResponse: Object,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ phone: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ status: 1 });

const MongoBooking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

import { createModelFallback } from "../utils/dbFallback";

const BookingProxy = new Proxy(MongoBooking, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const fallback = createModelFallback("bookings");
    if (prop in fallback) {
      return (fallback as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default BookingProxy;
