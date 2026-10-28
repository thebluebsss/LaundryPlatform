import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { LoginFormCard } from "./components/LoginFormCard";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast";
import { useLoading } from "../../context/LoadingContext";
import { authAPI } from "../../services/api";

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setLoading: setGlobalLoading } = useLoading();
  const [loading, setLoadingState] = useState(false);
  
  const setLoading = (val: boolean) => {
    setLoadingState(val);
    setGlobalLoading(val);
  };
  
  const [error, setError] = useState("");

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(username, password);
      const data = response.data?.data;
      const token = data?.token;
      const user = data?.user;

      if (!token || user?.role !== "admin") {
        throw new Error("Tài khoản không có quyền truy cập quản trị hệ thống.");
      }

      localStorage.setItem("sachse_admin_token", token);
      showToast(
        "Chào ban quản trị! Đăng nhập trang tổng quan vận hành thành công.",
        "success",
      );

      // Notify global headers
      window.dispatchEvent(new Event("storage"));
      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Tài khoản hoặc mật khẩu Quản trị viên không chính xác. (Mặc định: admin / admin123)";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <LoginFormCard
        onLogin={handleLogin}
        loading={loading}
        error={error}
      />
    </Box>
  );
};
export default AdminLogin;
