import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      required: true,
      enum: ["washing-machine", "dryer", "iron", "washer", "steamer", "other"],
    },
    model: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    storeId: {
      type: String,
      default: "store-hn-hoankiem",
    },
    storeName: {
      type: String,
      default: "Tiệm Giặt Sạch Sẽ Hoàn Kiếm",
    },
    capacityKg: {
      type: Number,
      default: 15,
    },
    currentOrderId: {
      type: String,
      default: "",
    },
    remainingMinutes: {
      type: Number,
      default: 0,
    },
    temperatureCelsius: {
      type: Number,
      default: 40,
    },
    cycleCount: {
      type: Number,
      default: 0,
    },
    purchaseDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["working", "running", "idle", "maintenance", "broken"],
      default: "working",
    },
    location: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

const MongoEquipment =
  mongoose.models.Equipment || mongoose.model("Equipment", equipmentSchema);

import { createModelFallback } from "../utils/dbFallback";

const EquipmentProxy = new Proxy(MongoEquipment, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const fallback = createModelFallback("equipment");
    if (prop in fallback) {
      return (fallback as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default EquipmentProxy;
