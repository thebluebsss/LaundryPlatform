import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../../../components/Toast";
import { useLoading } from "../../../context/LoadingContext";
import { setScopedSession } from "../../../utils/authStorage";

export const useStoreOwnerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { setLoading: setGlobalLoading } = useLoading();

  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get("redirect") || "/store-owner/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast("Vui lòng nhập đầy đủ tài khoản và mật khẩu!", "warning");
      return;
    }

    setSubmitting(true);
    setGlobalLoading(true);
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
          loggedUser.role === "store_manager" ? "store_owner" : loggedUser.role;

        if (normalizedRole !== "store_owner" && normalizedRole !== "admin") {
          showToast(
            "Tài khoản này không có quyền Chủ cửa hàng! Vui lòng đăng nhập bằng tài khoản Đối tác Chủ tiệm do Admin cấp.",
            "error"
          );
          return;
        }

        const profileToSave = { ...loggedUser, role: "store_owner" };
        setScopedSession("store_owner", result.data.token, profileToSave);

        showToast(
          `Chào mừng Chủ cửa hàng: ${loggedUser.fullName || loggedUser.username}!`,
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
      showToast("Lỗi kết nối máy chủ khi đăng nhập!", "error");
    } finally {
      setSubmitting(false);
      setGlobalLoading(false);
    }
  };

  return {
    submitting,
    username,
    setUsername,
    password,
    setPassword,
    handleLogin,
  };
};
