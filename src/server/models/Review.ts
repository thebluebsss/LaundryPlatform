// @ts-nocheck
import mongoose from "mongoose";
import { createModelFallback } from "../utils/dbFallback";

const reviewSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: [true, "Vui lòng cung cấp mã đơn hàng"],
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, "Vui lòng nhập tên khách hàng"],
      trim: true,
    },
    customerPhone: {
      type: String,
      default: "",
    },
    storeId: {
      type: String,
      required: [true, "Vui lòng cung cấp mã cửa hàng"],
      index: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    shipperId: {
      type: String,
      default: "",
      index: true,
    },
    shipperName: {
      type: String,
      default: "",
    },
    storeRating: {
      type: Number,
      required: [true, "Vui lòng chọn số sao đánh giá cửa hàng"],
      min: 1,
      max: 5,
      default: 5,
    },
    storeComment: {
      type: String,
      trim: true,
      default: "",
    },
    shipperRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    shipperComment: {
      type: String,
      trim: true,
      default: "",
    },
    storeReply: {
      type: String,
      trim: true,
      default: "",
    },
    repliedAt: {
      type: String,
      default: null,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const MongoReview =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);

const ReviewProxy = new Proxy(MongoReview, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const fallback = createModelFallback("reviews");
    if (prop in fallback) {
      return (fallback as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default ReviewProxy;
