import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../../../components/Toast";
import { setScopedSession } from "../../../utils/authStorage";

export const useMobileDriverAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get("redirect") || "/mobile-driver/radar";

  const [replaySplash, setReplaySplash] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast(
        "Vui lòng nhập Username, Email hoặc SĐT Shipper và mật khẩu!",
        "warning"
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const loggedUser = result.data.user;
        const normalizedRole =
          loggedUser.role === "shipper" ? "driver" : loggedUser.role;

        if (normalizedRole !== "driver" && normalizedRole !== "admin") {
          showToast(
            "Tài khoản này không phải là Đối tác Tài xế Shipper! Vui lòng dùng tài khoản Shipper do Admin cấp.",
            "error"
          );
          setLoading(false);
          return;
        }

        loggedUser.role = "driver";
        setScopedSession("driver", result.data.token, loggedUser);
        showToast(
          `Đăng nhập thành công Tài xế: ${loggedUser.fullName || loggedUser.username}`,
          "success"
        );
        navigate(redirectTo, { replace: true });
      } else {
        showToast(
          result.message || "Tài khoản hoặc mật khẩu không chính xác!",
          "error"
        );
      }
    } catch {
      showToast("Lỗi kết nối máy chủ. Vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    replaySplash,
    setReplaySplash,
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    handleDriverLogin,
  };
};
