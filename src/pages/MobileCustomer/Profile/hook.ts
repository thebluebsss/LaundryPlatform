import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../../services/api";
import { useToast } from "../../../components/Toast";
import {
  getScopedProfile,
  getScopedToken,
  setScopedSession,
  clearScopedSession,
} from "../../../utils/authStorage";

export const useMobileCustomerProfile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    password: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const parsed = getScopedProfile("customer");
      if (parsed) {
        setForm({
          username: parsed.username || "",
          fullName: parsed.fullName || "",
          phone: parsed.phone || "",
          email: parsed.email || "",
          address: parsed.address || "",
          password: "",
        });
      }
      try {
        const res = await authAPI.getProfile();
        const u = res.data?.data;
        if (u) {
          setForm((prev) => ({
            ...prev,
            username: u.username || prev.username,
            fullName: u.fullName || prev.fullName,
            phone: u.phone || prev.phone,
            email: u.email || prev.email,
            address: u.address || prev.address,
          }));
        }
      } catch {
        // fallback to cached profile
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) {
      showToast("Vui lòng nhập đầy đủ Họ tên và Số điện thoại!", "warning");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim(),
      };
      if (form.password.trim().length >= 6) {
        payload.password = form.password.trim();
      } else if (form.password.trim().length > 0) {
        showToast("Mật khẩu mới phải có tối thiểu 6 ký tự!", "warning");
        setSaving(false);
        return;
      }

      const res = await authAPI.updateProfile(payload);
      const updatedUser = res.data?.data || payload;

      const currentObj = getScopedProfile("customer") || {};
      const merged = { ...currentObj, ...updatedUser };
      const token = getScopedToken("customer") || "";
      setScopedSession("customer", token, merged);

      setForm((prev) => ({ ...prev, password: "" }));
      showToast("Đã cập nhật hồ sơ cá nhân thành công!", "success");
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Không thể cập nhật thông tin cá nhân!",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearScopedSession("customer");
    showToast("Đã đăng xuất khỏi App Khách Hàng!", "info");
    navigate("/mobile-customer/login", { replace: true });
  };

  return {
    form,
    setForm,
    saving,
    handleSave,
    handleLogout,
  };
};
