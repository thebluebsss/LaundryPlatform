import { Box, Typography, Stack } from "@mui/material";
import { Users, Plus } from "lucide-react";
import { UsersTable } from "./components/UsersTable";
import { UserFormModal } from "./components/UserFormModal";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";
import { useAdminUsers, normalizeRoleForUI } from "./hook";

export type { SystemRole, User } from "./hook";

export const AdminUsers = () => {
  const {
    navigate,
    users,
    roleFilter,
    setRoleFilter,
    showModal,
    setShowModal,
    editingUser,
    setEditingUser,
    error,
    filteredUsers,
    handleSaveUser,
    handleChangeRole,
    handleDeleteUser,
    handleEditUser,
    handleToggleStatus,
  } = useAdminUsers();

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

        <Stack direction="row" spacing={1.5}>
          <ButtonOutLine
            onClick={() => navigate("/admin/dashboard")}
            label="← Về Dashboard"
            className="!w-auto !h-10 !px-4"
            textClassName="!text-xs"
          />
          <ButtonCustom
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            iconStart={<Plus className="w-4 h-4" />}
            label="Thêm Tài Khoản / Đối Tác"
            className="!w-auto !h-10 !px-4"
            textClassName="!text-xs"
          />
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
