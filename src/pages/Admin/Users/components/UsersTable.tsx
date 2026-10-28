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
import { Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { User } from "../index";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const UsersTable = ({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
}: UsersTableProps) => {
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
              Tên đăng nhập
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "12px" }}>
              Họ và tên
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "12px" }}>
              Email
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "12px" }}>
              Số điện thoại
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "12px" }}>
              Vai trò
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
              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" className="text-slate-400">
                  Chưa có người dùng nào
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                sx={{
                  "&:hover": { bgcolor: "slate.50" },
                  transition: "background-color 0.2s",
                }}
              >
                <TableCell>
                  <Typography
                    sx={{ fontSize: "13px", fontWeight: "600" }}
                    className="text-slate-700"
                  >
                    {user.username}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{ fontSize: "13px" }}
                    className="text-slate-600"
                  >
                    {user.fullName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{ fontSize: "13px" }}
                    className="text-slate-600"
                  >
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{ fontSize: "13px" }}
                    className="text-slate-600"
                  >
                    {user.phoneNumber || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role === "admin" ? "Quản trị" : "Khách hàng"}
                    size="small"
                    sx={{
                      bgcolor: user.role === "admin" ? "purple.50" : "blue.50",
                      color: user.role === "admin" ? "purple.700" : "blue.700",
                      fontWeight: "bold",
                      fontSize: "11px",
                      height: "24px",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      user.status === "active" ? "Hoạt động" : "Vô hiệu hóa"
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
                        user.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"
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
                    <Tooltip title="Chỉnh sửa">
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
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Bạn có chắc muốn xóa người dùng "${user.fullName}"?`,
                            )
                          ) {
                            onDelete(user.id);
                          }
                        }}
                        sx={{
                          color: "rose.600",
                          "&:hover": { bgcolor: "rose.50" },
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
