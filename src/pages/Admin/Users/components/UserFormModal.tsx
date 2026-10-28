import { useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { X } from "lucide-react";
import { User } from "../index";
import { InputText } from "../../../../components/InputText";
import { InputSelect } from "../../../../components/InputSelect";

interface UserFormModalProps {
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

export const UserFormModal = ({
  user,
  onClose,
  onSave,
}: UserFormModalProps) => {
  const [formData, setFormData] = useState<Partial<User>>({
    id: user?.id || "",
    username: user?.username || "",
    email: user?.email || "",
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    role: user?.role || "user",
    status: user?.status || "active",
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username?.trim())
      newErrors.username = "Tên đăng nhập không được để trống";

    if (!formData.email?.trim()) newErrors.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.fullName?.trim())
      newErrors.fullName = "Họ tên không được để trống";

    // Password validation only for new users
    if (!user) {
      if (!password.trim()) newErrors.password = "Mật khẩu không được để trống";
      else if (password.length < 6)
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

      if (password !== confirmPassword)
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData as User);
    }
  };

  return (
    <Box className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <Box className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <Box className="flex items-center justify-between mb-4">
          <Typography
            variant="h6"
            sx={{ fontSize: "18px", fontWeight: "bold" }}
          >
            {user ? "Chỉnh Sửa Người Dùng" : "Thêm Người Dùng Mới"}
          </Typography>
          <Button
            onClick={onClose}
            sx={{
              minWidth: "auto",
              p: 1,
              borderRadius: "50%",
              color: "slate.500",
              "&:hover": { bgcolor: "slate.100" },
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputText
                title="Tên đăng nhập"
                required
                placeholder="username123"
                inputError={errors.username}
                inputProps={{
                  value: formData.username,
                  onChange: (e: any) =>
                    setFormData({ ...formData, username: e.target.value }),
                  disabled: !!user, // Cannot change username when editing
                }}
              />

              <InputText
                title="Họ và tên"
                required
                placeholder="Nguyễn Văn A"
                inputError={errors.fullName}
                inputProps={{
                  value: formData.fullName,
                  onChange: (e: any) =>
                    setFormData({ ...formData, fullName: e.target.value }),
                }}
              />
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputText
                title="Email"
                required
                placeholder="email@example.com"
                inputError={errors.email}
                inputProps={{
                  type: "email",
                  value: formData.email,
                  onChange: (e: any) =>
                    setFormData({ ...formData, email: e.target.value }),
                }}
              />

              <InputText
                title="Số điện thoại"
                placeholder="0912345678"
                inputProps={{
                  value: formData.phoneNumber,
                  onChange: (e: any) =>
                    setFormData({ ...formData, phoneNumber: e.target.value }),
                }}
              />
            </Box>

            {!user && (
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputText
                  title="Mật khẩu"
                  required
                  placeholder="Nhập mật khẩu"
                  inputError={errors.password}
                  inputProps={{
                    type: "password",
                    value: password,
                    onChange: (e: any) => setPassword(e.target.value),
                  }}
                />

                <InputText
                  title="Xác nhận mật khẩu"
                  required
                  placeholder="Nhập lại mật khẩu"
                  inputError={errors.confirmPassword}
                  inputProps={{
                    type: "password",
                    value: confirmPassword,
                    onChange: (e: any) => setConfirmPassword(e.target.value),
                  }}
                />
              </Box>
            )}

            <InputText
              title="Địa chỉ"
              placeholder="123 Đường ABC, Quận 1, TP.HCM"
              inputProps={{
                value: formData.address,
                onChange: (e: any) =>
                  setFormData({ ...formData, address: e.target.value }),
              }}
            />

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputSelect
                title="Vai trò"
                required
                value={formData.role}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "user",
                  })
                }
                options={[
                  { value: "user", label: "Khách hàng" },
                  { value: "admin", label: "Quản trị viên" },
                ]}
              />

              <InputSelect
                title="Trạng thái"
                required
                value={formData.status}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "inactive",
                  })
                }
                options={[
                  { value: "active", label: "Hoạt động" },
                  { value: "inactive", label: "Vô hiệu hóa" },
                ]}
              />
            </Box>

            <Stack direction="row" spacing={2} className="pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: "bold",
                  bgcolor: "blue.600",
                  "&:hover": { bgcolor: "blue.700" },
                }}
              >
                {user ? "Cập Nhật" : "Thêm Mới"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};
