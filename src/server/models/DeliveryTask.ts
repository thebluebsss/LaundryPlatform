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
    pickupAddress: { type: String, default: "" },
    deliveryAddress: { type: String, default: "" },
    pickupCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    deliveryCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    customerCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    storeCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
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
    broadcastRadiusKm: { type: Number, default: 1.0 },
    distanceKm: { type: Number, default: 1.2 },
    shippingFee: { type: Number, default: 25000 },
    tipAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: "cod" },
    pickupDate: { type: String, default: "" },
    pickupTime: { type: String, default: "09:00 - 11:00" },
    deliveryDate: { type: String, default: "" },
    deliveryTime: { type: String, default: "16:00 - 18:00" },
    rejectedDriverIds: { type: [String], default: [] },
    status: {
      type: String,
      enum: [
        "broadcasting",
        "accepted",
        "picking_up",
        "arrived_pickup",
        "picked_up",
        "in_transit",
        "completed",
        "cancelled",
      ],
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

if (mongoose.models.DeliveryTask) {
  delete mongoose.models.DeliveryTask;
}

const MongoDeliveryTask = mongoose.model("DeliveryTask", deliveryTaskSchema);

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
