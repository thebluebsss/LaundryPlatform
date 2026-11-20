import { useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
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
    <Box className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      <Stack spacing={4}>
        <Box className="text-center space-y-2">
          <Box className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: "700", color: "#0f172a", fontSize: "1.35rem" }}
          >
            Đăng nhập quản trị
          </Typography>
          <Typography variant="caption" className="text-slate-500 block">
            Dành cho quản trị viên theo dõi đơn hàng, chi nhánh và tài khoản hệ
            thống
          </Typography>
        </Box>

        {error && (
          <Box className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
            <Typography variant="caption" className="text-rose-600 font-semibold block">
              {error}
            </Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <InputText
              title="Tên đăng nhập"
              required
              placeholder="Nhập tên đăng nhập"
              startAdornment={<User className="w-4 h-4 text-slate-400" />}
              inputProps={{
                value: username,
                onChange: (e: any) => setUsername(e.target.value),
              }}
            />

            <InputText
              title="Mật khẩu"
              required
              placeholder="Nhập mật khẩu"
              startAdornment={<Lock className="w-4 h-4 text-slate-400" />}
              endAdornment={
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{
                    p: 0,
                    minWidth: "auto",
                    color: "#94a3b8",
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
                py: 1.4,
                borderRadius: "12px",
                fontWeight: "600",
                textTransform: "none",
                bgcolor: "#4f46e5",
                "&:hover": { bgcolor: "#4338ca" },
                boxShadow: "none",
              }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <Button
              onClick={() => navigate("/")}
              fullWidth
              variant="text"
              startIcon={<ArrowLeft className="w-4 h-4" />}
              sx={{
                py: 1,
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "none",
                color: "#64748b",
                "&:hover": {
                  color: "#4f46e5",
                  bgcolor: "transparent"
                }
              }}
            >
              Về trang chủ
            </Button>
          </Stack>
        </form>

        <Box className="border-t border-slate-100 pt-4 flex flex-col items-center gap-2">
          <Typography variant="caption" className="text-slate-400">
            Hệ thống quản trị nội bộ Giặt Là Sạch Sẽ
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};
