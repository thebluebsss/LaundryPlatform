import { useState, useEffect } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Users, Plus } from "lucide-react";
import { UsersTable } from "./components/UsersTable";
import { UserFormModal } from "./components/UserFormModal";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../../../services/api";
import { useLoading } from "../../../context/LoadingContext";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  role: "admin" | "user";
  createdAt: string;
  status: "active" | "inactive";
}

export const AdminUsers = () => {
  const navigate = useNavigate();
  const { setLoading: setGlobalLoading } = useLoading();
  const [users, setUsers] = useState<User[]>([]);
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
      // Ensure we always set an array
      setUsers(
        Array.isArray(usersData)
          ? usersData.map((u: any) => ({
              id: u._id || u.id,
              username: u.username,
              email: u.email,
              fullName: u.fullName,
              phoneNumber: u.phone || u.phoneNumber,
              address: u.address,
              role: u.role,
              createdAt: u.createdAt,
              status: u.status || "active",
            }))
          : [],
      );
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách người dùng",
      );
      // Set empty array on error
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (user: User) => {
    setLoading(true);
    try {
      if (editingUser) {
        // Update existing
        await usersAPI.update(user.id, user);
      } else {
        // Add new
        await usersAPI.create(user);
      }
      await loadUsers();
      setShowModal(false);
      setEditingUser(null);
    } catch (err: any) {
      console.error("Error saving user:", err);
      alert(err.response?.data?.message || "Không thể lưu người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setLoading(true);
    try {
      await usersAPI.delete(id);
      await loadUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert(err.response?.data?.message || "Không thể xóa người dùng");
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
      await loadUsers();
    } catch (err: any) {
      console.error("Error toggling user status:", err);
      alert(
        err.response?.data?.message ||
          "Không thể thay đổi trạng thái người dùng",
      );
    } finally {
      setLoading(false);
    }
  };

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
            Quản Lý Người Dùng
          </Typography>
          <Typography variant="body2" className="text-slate-500 mt-1">
            Thêm, sửa, xóa và quản lý tài khoản người dùng
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
            Thêm Người Dùng
          </Button>
        </Stack>
      </Box>

      {/* Loading/Error States */}
      {loading && (
        <Box className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
          <Typography className="text-slate-500">
            Đang tải dữ liệu...
          </Typography>
        </Box>
      )}

      {error && (
        <Box className="bg-red-50 p-4 rounded-2xl border border-red-200 text-center">
          <Typography className="text-red-600 text-sm font-medium">
            {error}
          </Typography>
          <Button
            onClick={loadUsers}
            size="small"
            sx={{ mt: 2, textTransform: "none" }}
          >
            Thử lại
          </Button>
        </Box>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <UsersTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onToggleStatus={handleToggleStatus}
        />
      )}

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
