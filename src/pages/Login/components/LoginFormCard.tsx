import { useState } from "react";
import { Box, Typography, Button, Stack, Chip } from "@mui/material";
import { User, Lock, Eye, EyeOff, ShieldAlert, ArrowLeft } from "lucide-react";
import { InputText } from "../../../components/InputText";
import { useNavigate } from "react-router-dom";

interface LoginFormCardProps {
  onLogin: (username: string, password: string) => void;
  loading: boolean;
  error?: string;
}

export const LoginFormCard = ({
  onLogin,
  loading,
  error,
}: LoginFormCardProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username, password);
    }
  };

  return (
    <Box className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient corner */}
      <Box className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none bg-indigo-505/10" />

      <Stack spacing={4}>
        <Box className="text-center space-y-2">
          <Box className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: "800", color: "indigo.950" }}
          >
            Quản Trị Viên Đăng Nhập
          </Typography>
          <Typography variant="caption" className="text-slate-500 block">
            Vui lòng điền thông tin cấp quyền để truy cập trang điều phối vận đơn,
            doanh thu và quản lý khách hàng
          </Typography>
        </Box>

        {error && (
          <Box className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
            <Typography variant="caption" className="text-rose-600 font-semibold block">
              ⚠ {error}
            </Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <InputText
              title="Tên đăng nhập quản trị"
              required
              placeholder="Nhập username"
              startAdornment={<User className="w-4 h-4 text-slate-400" />}
              inputProps={{
                value: username,
                onChange: (e: any) => setUsername(e.target.value),
              }}
            />

            <InputText
              title="Mật khẩu bảo mật"
              required
              placeholder="Nhập password"
              startAdornment={<Lock className="w-4 h-4 text-slate-400" />}
              endAdornment={
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{
                    p: 0,
                    minWidth: "auto",
                    color: "slate-400",
                    "&:hover": { bgcolor: "transparent" },
                  }}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              }
              inputProps={{
                type: showPassword ? "text" : "password",
                value: password,
                onChange: (e: any) => setPassword(e.target.value),
              }}
            />

            <Button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              fullWidth
              variant="contained"
              sx={{
                py: 1.5,
                borderRadius: "12px",
                fontWeight: "bold",
                textTransform: "none",
                bgcolor: "indigo.600",
                "&:hover": { bgcolor: "indigo.700" },
                boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.2)",
              }}
            >
              {loading ? "Đang xác thực..." : "Yêu Cầu Truy Cập Hệ Thống"}
            </Button>

            <Button
              onClick={() => navigate("/auth")}
              fullWidth
              variant="text"
              startIcon={<ArrowLeft className="w-4 h-4" />}
              sx={{
                py: 1,
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "none",
                color: "slate.500",
                "&:hover": {
                  color: "indigo.600",
                  bgcolor: "transparent"
                }
              }}
            >
              Quay lại đăng nhập thành viên (Khách hàng)
            </Button>
          </Stack>
        </form>

        <Box className="border-t border-slate-100 pt-4 flex flex-col items-center gap-2">
          <Typography variant="caption" className="text-slate-400">
            Hệ thống quản lý nội bộ Giặt Là Sạch Sẽ
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};
