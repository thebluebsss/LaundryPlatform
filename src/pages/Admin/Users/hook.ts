import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../../../services/api";
import { useLoading } from "../../../context/LoadingContext";
import { useToast } from "../../../components/Toast";

export type SystemRole =
  | "admin"
  | "user"
  | "store_owner"
  | "store_manager"
  | "shipper"
  | "driver"
  | "guest";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  role: SystemRole;
  createdAt: string;
  status: "active" | "inactive";
  assignedStoreId?: string;
  storeName?: string;
  storeCode?: string;
  storeDistrict?: string;
  storeCity?: "hcm" | "hanoi" | "";
  storeLat?: number;
  storeLng?: number;
  openHours?: string;
  priceRange?: string;
  vehicleType?: "bike" | "van" | "";
  licensePlate?: string;
  idCardNumber?: string;
  driverLicenseNumber?: string;
  driverLicenseImage?: string;
}

export const normalizeRoleForUI = (role?: string): SystemRole => {
  if (role === "store_owner" || role === "store_manager") return "store_owner";
  if (role === "driver" || role === "shipper") return "driver";
  if (role === "admin") return "admin";
  return "user";
};

export const useAdminUsers = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setLoading: setGlobalLoading } = useLoading();
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoadingState] = useState(true);

  const setLoading = (val: boolean) => {
    setLoadingState(val);
    setGlobalLoading(val);
  };

  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await usersAPI.getAll();
      const usersData = response.data.data?.users || [];
      setUsers(
        Array.isArray(usersData)
          ? usersData.map((u: any) => ({
              id: u._id || u.id,
              username: u.username,
              email: u.email,
              fullName: u.fullName,
              phoneNumber: u.phone || u.phoneNumber,
              address: u.address,
              role: normalizeRoleForUI(u.role),
              createdAt: u.createdAt,
              status:
                u.isActive === false || u.status === "inactive"
                  ? "inactive"
                  : "active",
              assignedStoreId: u.assignedStoreId || "",
              storeName: u.storeName || "",
              storeCode: u.storeCode || "",
              storeDistrict: u.storeDistrict || "",
              storeCity: u.storeCity || "hcm",
              storeLat:
                u.storeLat !== undefined ? Number(u.storeLat) : undefined,
              storeLng:
                u.storeLng !== undefined ? Number(u.storeLng) : undefined,
              openHours: u.openHours || "06:30 - 22:00",
              priceRange: u.priceRange || "15.000đ - 120.000đ",
              vehicleType: u.vehicleType || "",
              licensePlate: u.licensePlate || "",
              idCardNumber: u.idCardNumber || "",
              driverLicenseNumber: u.driverLicenseNumber || "",
              driverLicenseImage: u.driverLicenseImage || "",
            }))
          : []
      );
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách người dùng"
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSaveUser = async (user: User & { password?: string }) => {
    setLoading(true);
    try {
      const normalizedRole = normalizeRoleForUI(user.role);
      const payload: any = {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phoneNumber,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: normalizedRole,
        status: user.status,
        isActive: user.status !== "inactive",
        assignedStoreId: user.assignedStoreId || "",
        storeName: user.storeName || "",
        storeCode: user.storeCode || "",
        storeDistrict: user.storeDistrict || "",
        storeCity: user.storeCity || "hcm",
        storeLat:
          user.storeLat !== undefined ? Number(user.storeLat) : undefined,
        storeLng:
          user.storeLng !== undefined ? Number(user.storeLng) : undefined,
        openHours: user.openHours || "06:30 - 22:00",
        priceRange: user.priceRange || "15.000đ - 120.000đ",
        vehicleType: user.vehicleType || "",
        licensePlate: user.licensePlate || "",
        idCardNumber: user.idCardNumber || "",
        driverLicenseNumber: user.driverLicenseNumber || "",
        driverLicenseImage: user.driverLicenseImage || "",
        ...(user.password ? { password: user.password } : {}),
      };

      if (editingUser && editingUser.id) {
        await usersAPI.update(user.id, payload);
        showToast(
          normalizedRole === "store_owner"
            ? "Đã cập nhật hồ sơ Chủ tiệm giặt & đồng bộ vị trí cửa hàng trên Google Maps!"
            : normalizedRole === "driver"
              ? "Đã cập nhật hồ sơ Đối tác Shipper & thông tin bằng lái xe!"
              : "Đã cập nhật tài khoản & phân quyền người dùng!",
          "success"
        );
      } else {
        await usersAPI.create(payload);
        showToast(
          normalizedRole === "store_owner"
            ? "Đã tạo tài khoản Chủ tiệm giặt & khởi tạo chi nhánh trên Google Maps!"
            : normalizedRole === "driver"
              ? "Đã tạo tài khoản Đối tác Shipper giao nhận mới!"
              : "Đã tạo tài khoản người dùng mới!",
          "success"
        );
      }
      await loadUsers();
      setShowModal(false);
      setEditingUser(null);
    } catch (err: any) {
      console.error("Error saving user:", err);
      showToast(
        err.response?.data?.message || "Không thể lưu thông tin người dùng",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (user: User, newRole: SystemRole) => {
    const normalizedRole = normalizeRoleForUI(newRole);

    if (
      normalizedRole === "store_owner" &&
      (!user.storeName || !user.address || user.storeLat === undefined)
    ) {
      showToast(
        "Vui lòng bổ sung Tên tiệm, Địa chỉ đầy đủ và Định vị trên Google Maps cho Chủ tiệm giặt!",
        "info"
      );
      setEditingUser({
        ...user,
        role: "store_owner",
        storeCity: "hanoi",
        storeDistrict: user.storeDistrict || "Quận Hoàn Kiếm",
        storeLat: user.storeLat ?? 21.0285,
        storeLng: user.storeLng ?? 105.8542,
      });
      setShowModal(true);
      return;
    }

    if (
      normalizedRole === "driver" &&
      (!user.licensePlate || !user.driverLicenseImage)
    ) {
      showToast(
        "Vui lòng bổ sung Biển số xe và Ảnh chụp bằng lái xe (GPLX) cho Đối tác Shipper!",
        "info"
      );
      setEditingUser({
        ...user,
        role: "driver",
        vehicleType: user.vehicleType || "bike",
      });
      setShowModal(true);
      return;
    }

    try {
      await usersAPI.update(user.id, { role: normalizedRole });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, role: normalizedRole } : u
        )
      );
      const roleLabel =
        normalizedRole === "store_owner"
          ? "Chủ tiệm giặt"
          : normalizedRole === "driver"
            ? "Shipper (Tài xế)"
            : normalizedRole === "admin"
              ? "Quản trị viên"
              : "Khách hàng";
      showToast(
        `Đã lưu quyền "${roleLabel}" vào CSDL cho tài khoản ${
          user.fullName || user.username
        }!`,
        "success"
      );
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          "Không thể lưu phân quyền mới vào CSDL!",
        "error"
      );
    }
  };

  const handleDeleteUser = async (id: string) => {
    setLoading(true);
    try {
      await usersAPI.delete(id);
      showToast("Đã xóa tài khoản khỏi hệ thống!", "info");
      await loadUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      showToast(
        err.response?.data?.message || "Không thể xóa người dùng",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleToggleStatus = async (id: string) => {
    setLoading(true);
    try {
      await usersAPI.toggleActive(id);
      showToast("Đã cập nhật trạng thái hoạt động của tài khoản!", "info");
      await loadUsers();
    } catch (err: any) {
      console.error("Error toggling user status:", err);
      showToast(
        err.response?.data?.message ||
          "Không thể thay đổi trạng thái người dùng",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter === "all") return true;
    return normalizeRoleForUI(u.role) === roleFilter;
  });

  return {
    navigate,
    users,
    roleFilter,
    setRoleFilter,
    showModal,
    setShowModal,
    editingUser,
    setEditingUser,
    loading,
    error,
    filteredUsers,
    handleSaveUser,
    handleChangeRole,
    handleDeleteUser,
    handleEditUser,
    handleToggleStatus,
  };
};
