// @ts-nocheck
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Vui lòng nhập tên đăng nhập"],
      unique: true,
      trim: true,
      minlength: [3, "Tên đăng nhập phải có ít nhất 3 ký tự"],
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
    fullName: {
      type: String,
      required: [true, "Vui lòng nhập họ tên"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      match: [/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"],
    },
    role: {
      type: String,
      enum: ["admin", "user", "driver", "shipper", "store_manager", "guest"],
      default: "user",
    },
    vehicleType: {
      type: String,
      enum: ["bike", "van", ""],
      default: "",
    },
    licensePlate: {
      type: String,
      default: "",
    },
    currentLocation: {
      lat: Number,
      lng: Number,
    },
    assignedStoreId: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordOTP: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  // Tránh hash đè lên mật khẩu đã hash bằng bcrypt
  if (this.password && (this.password.startsWith("$2a$") || this.password.startsWith("$2b$"))) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordOTP;
  delete user.resetPasswordExpires;
  return user;
};

// Kiểm tra xem model đã tồn tại chưa để tránh lỗi OverwriteModelError
const MongoUser = mongoose.models.User || mongoose.model("User", userSchema);

import { createModelFallback } from "../utils/dbFallback";

const UserProxy = new Proxy(MongoUser, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const fallback = createModelFallback("users");
    if (prop in fallback) {
      return (fallback as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default UserProxy;
