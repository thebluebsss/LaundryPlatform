import { useState, useEffect } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Users, Plus } from "lucide-react";
import { UsersTable } from "./components/UsersTable";
import { UserFormModal } from "./components/UserFormModal";
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
  // Store Owner Partner Fields
  assignedStoreId?: string;
  storeName?: string;
  storeCode?: string;
  storeDistrict?: string;
  storeCity?: "hcm" | "hanoi" | "";
  storeLat?: number;
  storeLng?: number;
  openHours?: string;
  priceRange?: string;
  // Shipper / Driver Partner Fields
  vehicleType?: "bike" | "van" | "";
  licensePlate?: string;
  idCardNumber?: string;
  driverLicenseNumber?: string;
  driverLicenseImage?: string;
}

const normalizeRoleForUI = (role?: string): SystemRole => {
  if (role === "store_owner" || role === "store_manager") return "store_owner";
  if (role === "driver" || role === "shipper") return "driver";
  if (role === "admin") return "admin";
  return "user";
};

export const AdminUsers = () => {
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

  useEffect(() => {
    loadUsers();
  }, []);

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
              storeLat: u.storeLat !== undefined ? Number(u.storeLat) : undefined,
              storeLng: u.storeLng !== undefined ? Number(u.storeLng) : undefined,
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
        // Store Owner fields
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
        // Shipper fields
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

    // Nếu nâng cấp lên Chủ tiệm hoặc Shipper mà chưa có thông tin bắt buộc (định vị Google Maps hoặc bằng lái xe), mở Modal để điền đầy đủ
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

  return (
    <Box className="p-6 space-y-6">
      {/* Header */}
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Box>
          <Typography
            variant="h4"
            sx={{ fontSize: "24px", fontWeight: "bold", color: "slate.900" }}
          >
            <Users className="w-6 h-6 inline mr-2 text-blue-600" />
            Quản Lý Tài Khoản & Cấp Tài Khoản Đối Tác (RBAC)
          </Typography>
          <Typography variant="body2" className="text-slate-500 mt-1">
            Cấp trực tiếp tài khoản Chủ tiệm giặt (kèm địa chỉ & định vị Google
            Maps) và Đối tác Shipper (kèm ảnh chụp bằng lái xe & biển số)
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            onClick={() => navigate("/admin/dashboard")}
            variant="outlined"
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            ← Về Dashboard
          </Button>
          <Button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            variant="contained"
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "13px",
              bgcolor: "blue.600",
              "&:hover": { bgcolor: "blue.700" },
            }}
            startIcon={<Plus className="w-4 h-4" />}
          >
            Thêm Tài Khoản / Đối Tác
          </Button>
        </Stack>
      </Box>

      {/* Role Filter Tabs */}
      <Box className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: `Tất cả (${users.length})` },
            {
              id: "user",
              label: `Khách hàng (${
                users.filter((u) => normalizeRoleForUI(u.role) === "user")
                  .length
              })`,
            },
            {
              id: "store_owner",
              label: `Chủ tiệm giặt (${
                users.filter(
                  (u) => normalizeRoleForUI(u.role) === "store_owner"
                ).length
              })`,
            },
            {
              id: "driver",
              label: `Shipper / Tài xế (${
                users.filter((u) => normalizeRoleForUI(u.role) === "driver")
                  .length
              })`,
            },
            {
              id: "admin",
              label: `Quản trị viên (${
                users.filter((u) => normalizeRoleForUI(u.role) === "admin")
                  .length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                roleFilter === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          Chủ tiệm & Shipper chỉ được cấp tài khoản trực tiếp bởi Admin tại đây
        </div>
      </Box>

      {/* Error Message */}
      {error && (
        <Box className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </Box>
      )}

      {/* Users Table */}
      <UsersTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
        onChangeRole={handleChangeRole}
      />

      {/* User Form Modal */}
      {showModal && (
        <UserFormModal
          user={editingUser}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}
    </Box>
  );
};
