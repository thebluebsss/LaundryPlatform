import { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Edit,
  Trash2,
  UserCheck,
  UserX,
  MapPin,
  Store,
  Bike,
  FileCheck,
} from "lucide-react";
import { User, SystemRole } from "../index";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onChangeRole?: (user: User, newRole: SystemRole) => void;
}

export const UsersTable = ({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
  onChangeRole,
}: UsersTableProps) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewLicenseUrl, setPreviewLicenseUrl] = useState<string | null>(
    null
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "slate.100",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "slate.50" }}>
              <TableCell sx={{ fontWeight: "bold", fontSize: "12px" }}>
                Tài khoản & Họ tên
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "12px" }}>
                Liên hệ (Email / SĐT)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "12px" }}>
                Hồ sơ Đối tác / Định vị / Bằng lái
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "12px" }}>
                Phân quyền (RBAC)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "12px" }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "12px" }}>
                Ngày tạo
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "12px" }}
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" className="text-slate-400">
                    Chưa có người dùng nào
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const effectiveRole =
                  user.role === "store_manager"
                    ? "store_owner"
                    : user.role === "shipper"
                    ? "driver"
                    : user.role;

                return (
                  <TableRow
                    key={user.id}
                    sx={{
                      "&:hover": { bgcolor: "slate.50" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="text-xs font-black text-slate-900">
                          {user.fullName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          @{user.username}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        <div className="text-slate-700 font-medium">
                          {user.email}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          {user.phoneNumber || "—"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {effectiveRole === "store_owner" ? (
                        <div className="space-y-1 text-[11px]">
                          <div className="font-bold text-blue-700 flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {user.storeName || "Chưa khai báo tên tiệm"}
                            </span>
                          </div>
                          {user.address && (
                            <div className="text-slate-600 flex items-start gap-1 max-w-xs">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">
                                {user.address}
                              </span>
                            </div>
                          )}
                          {user.storeLat !== undefined &&
                          user.storeLng !== undefined ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px]">
                              GPS: {Number(user.storeLat).toFixed(4)},{" "}
                              {Number(user.storeLng).toFixed(4)}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onEdit(user)}
                              className="text-[10px] font-bold text-amber-600 underline cursor-pointer"
                            >
                              + Bổ sung tọa độ Google Maps
                            </button>
                          )}
                        </div>
                      ) : effectiveRole === "driver" ? (
                        <div className="space-y-1 text-[11px]">
                          <div className="font-bold text-emerald-700 flex items-center gap-1">
                            <Bike className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {user.licensePlate
                                ? `Biển số: ${user.licensePlate}`
                                : "Chưa cập nhật biển số"}
                            </span>
                          </div>
                          {user.driverLicenseNumber && (
                            <div className="text-slate-600 text-[10px]">
                              GPLX: <strong>{user.driverLicenseNumber}</strong>{" "}
                              {user.idCardNumber
                                ? `· CCCD: ${user.idCardNumber}`
                                : ""}
                            </div>
                          )}
                          {user.driverLicenseImage ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewLicenseUrl(
                                  user.driverLicenseImage || null
                                )
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] hover:bg-emerald-100 cursor-pointer"
                            >
                              <FileCheck className="w-3 h-3" />
                              <span>Xem ảnh Bằng lái xe</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onEdit(user)}
                              className="text-[10px] font-bold text-amber-600 underline cursor-pointer"
                            >
                              + Đính kèm ảnh chụp bằng lái
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500">
                          {user.address || "Khách hàng / Nội bộ"}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {onChangeRole ? (
                        <select
                          value={effectiveRole}
                          onChange={(e) =>
                            onChangeRole(user, e.target.value as SystemRole)
                          }
                          className="py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:border-blue-500"
                        >
                          <option value="user">Khách hàng</option>
                          <option value="store_owner">Chủ tiệm giặt</option>
                          <option value="driver">Shipper (Tài xế)</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      ) : (
                        <Chip
                          label={effectiveRole}
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "11px",
                            height: "24px",
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          user.status === "active" ? "Hoạt động" : "Tạm khóa"
                        }
                        size="small"
                        sx={{
                          bgcolor:
                            user.status === "active" ? "green.50" : "gray.100",
                          color:
                            user.status === "active" ? "green.700" : "gray.600",
                          fontWeight: "bold",
                          fontSize: "11px",
                          height: "24px",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography
                        sx={{ fontSize: "13px" }}
                        className="text-slate-500"
                      >
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box className="flex items-center justify-center gap-1">
                        <Tooltip
                          title={
                            user.status === "active"
                              ? "Khóa tài khoản vi phạm"
                              : "Duyệt / Mở khóa tài khoản"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => onToggleStatus(user.id)}
                            sx={{
                              color:
                                user.status === "active"
                                  ? "orange.600"
                                  : "green.600",
                              "&:hover": {
                                bgcolor:
                                  user.status === "active"
                                    ? "orange.50"
                                    : "green.50",
                              },
                            }}
                          >
                            {user.status === "active" ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa hồ sơ & Định vị">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(user)}
                            sx={{
                              color: "blue.600",
                              "&:hover": { bgcolor: "blue.50" },
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </IconButton>
                        </Tooltip>

                        {confirmDeleteId === user.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                onDelete(user.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Xóa
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              onClick={() => setConfirmDeleteId(user.id)}
                              sx={{
                                color: "red.600",
                                "&:hover": { bgcolor: "red.50" },
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Preview Driver License Image */}
      {previewLicenseUrl && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
          onClick={() => setPreviewLicenseUrl(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">
                Ảnh Chụp Bằng Lái Xe (GPLX) Đối Tác Shipper
              </div>
              <button
                type="button"
                onClick={() => setPreviewLicenseUrl(null)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Đóng
              </button>
            </div>
            <img
              src={previewLicenseUrl}
              alt="Bằng lái xe Shipper"
              className="w-full max-h-[380px] object-contain rounded-2xl border border-slate-200 bg-slate-50"
            />
          </div>
        </div>
      )}
    </>
  );
};
