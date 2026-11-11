// @ts-nocheck
import bcrypt from "bcryptjs";
import User from "../models/User";
import Store from "../models/Store";
import { NotFoundError, ValidationError } from "../utils/errorHandler";

const normalizeUserRole = (rawRole?: string): string => {
  if (rawRole === "store_owner" || rawRole === "store_manager") {
    return "store_owner";
  }
  if (rawRole === "driver" || rawRole === "shipper") {
    return "driver";
  }
  if (rawRole === "admin") {
    return "admin";
  }
  return "user";
};

/**
 * Tự động khởi tạo hoặc cập nhật chi nhánh cửa hàng trên Google Maps cho Chủ tiệm
 */
const syncPartnerStoreForOwner = async (userDoc: any, inputData: any) => {
  const storeName =
    inputData.storeName ||
    userDoc.storeName ||
    `Tiệm Giặt Sấy - ${userDoc.fullName || userDoc.username}`;
  const storeAddress = inputData.address || userDoc.address || "";
  const storeLat = Number(
    inputData.storeLat ?? userDoc.storeLat ?? 21.0285
  );
  const storeLng = Number(
    inputData.storeLng ?? userDoc.storeLng ?? 105.8542
  );
  const storeDistrict =
    inputData.storeDistrict || userDoc.storeDistrict || "Quận Hoàn Kiếm";
  const storeCity = inputData.storeCity || userDoc.storeCity || "hanoi";
  const storeCode =
    inputData.storeCode ||
    userDoc.storeCode ||
    "STORE_" +
      String(userDoc.username || Date.now())
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);
  const openHours =
    inputData.openHours || userDoc.openHours || "06:30 - 22:00";
  const priceRange =
    inputData.priceRange || userDoc.priceRange || "15.000đ - 120.000đ";

  const existingStoreId =
    inputData.assignedStoreId || userDoc.assignedStoreId || "";

  let syncedStore: any = null;
  if (existingStoreId) {
    syncedStore =
      (await Store.findOne({ customId: existingStoreId })) ||
      (await Store.findById(existingStoreId));
  }
  if (!syncedStore && storeCode) {
    syncedStore = await Store.findOne({ code: storeCode });
  }

  const storePayload = {
    name: storeName,
    code: storeCode,
    address: storeAddress || "Địa chỉ đang cập nhật",
    district: storeDistrict,
    city: storeCity === "hanoi" ? "hanoi" : "hcm",
    phone: userDoc.phone || "0900000000",
    lat: storeLat,
    lng: storeLng,
    status: "open",
    isActive: true,
    openHours,
    priceRange,
    features: ["Giặt sấy siêu tốc", "Khử trùng UV Nano", "Giao nhận tận nơi"],
    managerName: userDoc.fullName || userDoc.username,
    managerPhone: userDoc.phone || "0900000000",
    ownerId: String(userDoc._id || userDoc.id),
  };

  if (syncedStore) {
    const targetId = syncedStore._id || syncedStore.id;
    syncedStore = await Store.findByIdAndUpdate(
      targetId,
      { $set: storePayload },
      { new: true }
    );
  } else {
    const newCustomId = "store-" + Date.now();
    syncedStore = await Store.create({
      ...storePayload,
      id: newCustomId,
      customId: newCustomId,
      rating: 5.0,
      reviewCount: 1,
    });
  }

  return syncedStore;
};

/**
 * Lấy danh sách users với pagination và search
 */
export const getUsers = async (filters: any = {}, page = 1, limit = 100) => {
  const skip = (page - 1) * limit;

  const query: any = {};

  if (filters.search) {
    query.$or = [
      { fullName: new RegExp(filters.search, "i") },
      { email: new RegExp(filters.search, "i") },
      { username: new RegExp(filters.search, "i") },
      { phone: new RegExp(filters.search, "i") },
    ];
  }

  if (filters.role) {
    query.role = normalizeUserRole(filters.role);
  }
  if (filters.isActive !== undefined) query.isActive = filters.isActive;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  const normalizedUsers = (users || []).map((u: any) => {
    const obj = u.toObject ? u.toObject() : { ...u };
    obj.role = normalizeUserRole(obj.role);
    obj.status = obj.isActive === false ? "inactive" : "active";
    return obj;
  });

  return {
    users: normalizedUsers,
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
    phoneNumber,
    address,
    role,
    status,
    isActive,
    // Store Owner fields
    assignedStoreId,
    storeName,
    storeCode,
    storeDistrict,
    storeCity,
    storeLat,
    storeLng,
    openHours,
    priceRange,
    // Driver / Shipper fields
    vehicleType,
    licensePlate,
    idCardNumber,
    driverLicenseNumber,
    driverLicenseImage,
    currentLocation,
  } = userData;

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ValidationError("Email đã được sử dụng");
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new ValidationError("Username đã được sử dụng");
  }

  const rawPass = password || "123456";
  const hashedPassword = await bcrypt.hash(rawPass, 10);
  const resolvedRole = normalizeUserRole(role);
  const resolvedActive =
    status !== undefined
      ? status === "active"
      : isActive !== undefined
      ? isActive
      : true;

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    fullName,
    phone: phone || phoneNumber || "0900000000",
    address: address || "",
    role: resolvedRole,
    isActive: resolvedActive,
    isAvailable: resolvedRole === "driver" ? true : undefined,
    assignedStoreId: assignedStoreId || "",
    storeName: storeName || "",
    storeCode: storeCode || "",
    storeDistrict: storeDistrict || "Quận Hoàn Kiếm",
    storeCity: storeCity || "hanoi",
    storeLat: storeLat !== undefined ? Number(storeLat) : undefined,
    storeLng: storeLng !== undefined ? Number(storeLng) : undefined,
    openHours: openHours || "06:30 - 22:00",
    priceRange: priceRange || "15.000đ - 120.000đ",
    vehicleType: vehicleType || (resolvedRole === "driver" ? "bike" : ""),
    licensePlate: licensePlate || "",
    idCardNumber: idCardNumber || "",
    driverLicenseNumber: driverLicenseNumber || "",
    driverLicenseImage: driverLicenseImage || "",
    currentLocation:
      currentLocation ||
      (resolvedRole === "driver"
        ? { lat: 21.0285, lng: 105.8542 }
        : undefined),
  });

  if (resolvedRole === "store_owner") {
    try {
      const syncedStore = await syncPartnerStoreForOwner(user, userData);
      if (syncedStore) {
        const linkedStoreId =
          syncedStore.customId ||
          syncedStore.id ||
          String(syncedStore._id || "");
        await User.findByIdAndUpdate(user._id || user.id, {
          $set: {
            assignedStoreId: linkedStoreId,
            storeCode: syncedStore.code,
            storeName: syncedStore.name,
          },
        });
        user.assignedStoreId = linkedStoreId;
      }
    } catch (err) {
      console.error("Failed to sync partner store on user create:", err);
    }
  }

  return user;
};

/**
 * Cập nhật user & phân quyền RBAC
 */
export const updateUser = async (userId: string, updateData: any) => {
  const patch: any = {};

  if (updateData.fullName !== undefined) patch.fullName = updateData.fullName;
  if (updateData.email !== undefined) patch.email = updateData.email;
  if (updateData.username !== undefined) patch.username = updateData.username;
  if (updateData.address !== undefined) patch.address = updateData.address;
  if (updateData.phone !== undefined || updateData.phoneNumber !== undefined) {
    patch.phone = updateData.phone || updateData.phoneNumber;
  }
  if (updateData.role !== undefined) {
    patch.role = normalizeUserRole(updateData.role);
  }
  if (updateData.status !== undefined) {
    patch.isActive = updateData.status === "active";
  } else if (updateData.isActive !== undefined) {
    patch.isActive = updateData.isActive;
  }
  if (updateData.password) {
    patch.password = await bcrypt.hash(updateData.password, 10);
  }

  // Partner fields
  if (updateData.assignedStoreId !== undefined)
    patch.assignedStoreId = updateData.assignedStoreId;
  if (updateData.storeName !== undefined)
    patch.storeName = updateData.storeName;
  if (updateData.storeCode !== undefined)
    patch.storeCode = updateData.storeCode;
  if (updateData.storeDistrict !== undefined)
    patch.storeDistrict = updateData.storeDistrict;
  if (updateData.storeCity !== undefined)
    patch.storeCity = updateData.storeCity;
  if (updateData.storeLat !== undefined)
    patch.storeLat = Number(updateData.storeLat);
  if (updateData.storeLng !== undefined)
    patch.storeLng = Number(updateData.storeLng);
  if (updateData.openHours !== undefined)
    patch.openHours = updateData.openHours;
  if (updateData.priceRange !== undefined)
    patch.priceRange = updateData.priceRange;

  if (updateData.vehicleType !== undefined)
    patch.vehicleType = updateData.vehicleType;
  if (updateData.licensePlate !== undefined)
    patch.licensePlate = updateData.licensePlate;
  if (updateData.idCardNumber !== undefined)
    patch.idCardNumber = updateData.idCardNumber;
  if (updateData.driverLicenseNumber !== undefined)
    patch.driverLicenseNumber = updateData.driverLicenseNumber;
  if (updateData.driverLicenseImage !== undefined)
    patch.driverLicenseImage = updateData.driverLicenseImage;
  if (updateData.currentLocation !== undefined)
    patch.currentLocation = updateData.currentLocation;

  // Kiểm tra email unique nếu đổi sang email của người khác
  if (patch.email) {
    const existingEmail = await User.findOne({ email: patch.email });
    if (
      existingEmail &&
      String(existingEmail._id || existingEmail.id) !== String(userId)
    ) {
      throw new ValidationError("Email đã được sử dụng bởi tài khoản khác");
    }
  }

  // Kiểm tra username unique nếu đổi sang username của người khác
  if (patch.username) {
    const existingUsername = await User.findOne({ username: patch.username });
    if (
      existingUsername &&
      String(existingUsername._id || existingUsername.id) !== String(userId)
    ) {
      throw new ValidationError("Username đã được sử dụng bởi tài khoản khác");
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: patch },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new NotFoundError("User không tồn tại");
  }

  if (
    normalizeUserRole(user.role) === "store_owner" &&
    (updateData.storeName || updateData.storeLat || updateData.address)
  ) {
    try {
      const syncedStore = await syncPartnerStoreForOwner(user, updateData);
      if (syncedStore) {
        const linkedStoreId =
          syncedStore.customId ||
          syncedStore.id ||
          String(syncedStore._id || "");
        await User.findByIdAndUpdate(userId, {
          $set: {
            assignedStoreId: linkedStoreId,
            storeCode: syncedStore.code,
            storeName: syncedStore.name,
          },
        });
        user.assignedStoreId = linkedStoreId;
      }
    } catch (err) {
      console.error("Failed to sync partner store on user update:", err);
    }
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

  const nextActive = user.isActive === false ? true : false;
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive: nextActive } },
    { new: true }
  );

  return updated;
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
