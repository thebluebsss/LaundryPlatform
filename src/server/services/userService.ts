// @ts-nocheck
import bcrypt from "bcryptjs";
import User from "../models/User";
import { NotFoundError, ValidationError } from "../utils/errorHandler";

/**
 * Lấy danh sách users với pagination và search
 */
export const getUsers = async (filters: any = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const query: any = {};

  // Search
  if (filters.search) {
    query.$or = [
      { fullName: new RegExp(filters.search, "i") },
      { email: new RegExp(filters.search, "i") },
      { username: new RegExp(filters.search, "i") },
      { phone: new RegExp(filters.search, "i") },
    ];
  }

  // Filters
  if (filters.role) query.role = filters.role;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy chi tiết user
 */
export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new NotFoundError("User không tồn tại");
  }
  return user;
};

/**
 * Tạo user mới (admin)
 */
export const createUser = async (userData: any) => {
  const {
    username,
    email,
    password,
    fullName,
    phone,
    address,
    role,
    isActive,
  } = userData;

  // Kiểm tra email đã tồn tại
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ValidationError("Email đã được sử dụng");
  }

  // Kiểm tra username đã tồn tại
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new ValidationError("Username đã được sử dụng");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    fullName,
    phone,
    address,
    role: role || "user",
    isActive: isActive !== undefined ? isActive : true,
  });

  return user;
};

/**
 * Cập nhật user
 */
export const updateUser = async (userId: string, updateData: any) => {
  // Nếu có password, hash nó
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  // Kiểm tra email unique nếu có thay đổi
  if (updateData.email) {
    const existingEmail = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId },
    });
    if (existingEmail) {
      throw new ValidationError("Email đã được sử dụng");
    }
  }

  // Kiểm tra username unique nếu có thay đổi
  if (updateData.username) {
    const existingUsername = await User.findOne({
      username: updateData.username,
      _id: { $ne: userId },
    });
    if (existingUsername) {
      throw new ValidationError("Username đã được sử dụng");
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true },
  ).select("-password");

  if (!user) {
    throw new NotFoundError("User không tồn tại");
  }

  return user;
};

/**
 * Xóa user
 */
export const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new NotFoundError("User không tồn tại");
  }
  return user;
};

/**
 * Toggle active status
 */
export const toggleUserActive = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User không tồn tại");
  }

  user.isActive = !user.isActive;
  await user.save();

  return user;
};

/**
 * Thống kê users
 */
export const getUserStats = async () => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    adminUsers,
    regularUsers,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "user" }),
    User.find().select("-password").sort({ createdAt: -1 }).limit(5),
  ]);

  return {
    total: totalUsers,
    totalUsers,
    active: activeUsers,
    activeUsers,
    inactive: inactiveUsers,
    inactiveUsers,
    admins: adminUsers,
    adminUsers,
    users: regularUsers,
    regularUsers,
    recentUsers,
  };
};
