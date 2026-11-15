// @ts-nocheck
import mongoose from "mongoose";
import { createModelFallback } from "../utils/dbFallback";

const contactInquirySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập họ và tên"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: [true, "Vui lòng nhập nội dung yêu cầu"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "resolved"],
      default: "pending",
    },
    storeReply: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const MongoContactInquiry =
  mongoose.models.ContactInquiry ||
  mongoose.model("ContactInquiry", contactInquirySchema);

const ContactInquiryProxy = new Proxy(MongoContactInquiry, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const fallback = createModelFallback("contact_inquiries");
    if (prop in fallback) {
      return (fallback as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default ContactInquiryProxy;
