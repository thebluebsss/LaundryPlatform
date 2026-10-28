import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      default: "chai",
    },
    weight: {
      type: String,
      default: "",
    },
    brand: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    recommendFor: {
      type: [String],
      default: ["all"],
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ tags: 1 });

const MongoProduct =
  mongoose.models.Product || mongoose.model("Product", productSchema);

import { createModelFallback } from "../utils/dbFallback";

const ProductProxy = new Proxy(MongoProduct, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const fallback = createModelFallback("products");
    if (prop in fallback) {
      return (fallback as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default ProductProxy;
