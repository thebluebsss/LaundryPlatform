// @ts-nocheck
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên cửa hàng"],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Vui lòng nhập địa chỉ"],
      trim: true,
    },
    district: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      enum: ["hcm", "hanoi"],
      default: "hcm",
    },
    phone: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewCount: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ["open", "busy", "closed"],
      default: "open",
    },
    openHours: {
      type: String,
      default: "06:00 - 22:00",
    },
    priceRange: {
      type: String,
      default: "15.000đ - 120.000đ",
    },
    features: [String],
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=600",
    },
    managerName: String,
    managerPhone: String,
    activeShippersCount: {
      type: Number,
      default: 8,
    },
    activeMachinesCount: {
      type: Number,
      default: 16,
    },
  },
  {
    timestamps: true,
  }
);

const MongoStore = mongoose.models.Store || mongoose.model("Store", storeSchema);

import { createModelFallback } from "../utils/dbFallback";

const StoreProxy = new Proxy(MongoStore, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const fallback = createModelFallback("stores");
    if (prop in fallback) {
      return (fallback as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default StoreProxy;
