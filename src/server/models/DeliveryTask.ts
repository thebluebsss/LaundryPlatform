import mongoose from "mongoose";

const deliveryTaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    taskType: {
      type: String,
      enum: ["pickup_from_customer", "deliver_to_customer"],
      default: "pickup_from_customer",
    },
    storeId: { type: String, required: true },
    storeName: { type: String, required: true },
    driverId: { type: String, default: "" },
    driverName: { type: String, default: "" },
    driverPhone: { type: String, default: "" },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    storeAddress: { type: String, required: true },
    pickupCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    deliveryCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    distanceKm: { type: Number, default: 2.5 },
    shippingFee: { type: Number, default: 20000 },
    tipAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["broadcasting", "accepted", "picking_up", "arrived_pickup", "in_transit", "completed", "cancelled"],
      default: "broadcasting",
    },
    notes: { type: String, default: "" },
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const MongoDeliveryTask =
  mongoose.models.DeliveryTask || mongoose.model("DeliveryTask", deliveryTaskSchema);

import { createModelFallback } from "../utils/dbFallback";

const DeliveryTaskProxy = new Proxy(MongoDeliveryTask, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const fallback = createModelFallback("delivery_tasks");
    if (prop in fallback) {
      return (fallback as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default DeliveryTaskProxy;
