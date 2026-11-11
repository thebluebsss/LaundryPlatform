import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["washing-machine", "dryer", "iron", "other"],
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
    purchaseDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["working", "maintenance", "broken"],
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
