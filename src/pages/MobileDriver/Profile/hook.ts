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

export const useMobileDriverProfile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    vehicleType: "Xe máy Honda Wave / Vision",
    licensePlate: "",
    idCardNumber: "",
    driverLicenseNumber: "",
    driverLicenseImage: "",
    password: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const parsed = getScopedProfile("driver");
      if (parsed) {
        setForm((prev) => ({
          ...prev,
          username: parsed.username || "",
          fullName: parsed.fullName || "",
          phone: parsed.phone || "",
          email: parsed.email || "",
          address: parsed.address || "",
          vehicleType: parsed.vehicleType || prev.vehicleType,
          licensePlate: parsed.licensePlate || "",
          idCardNumber: parsed.idCardNumber || "",
          driverLicenseNumber: parsed.driverLicenseNumber || "",
          driverLicenseImage: parsed.driverLicenseImage || "",
        }));
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
            vehicleType: u.vehicleType || prev.vehicleType,
            licensePlate: u.licensePlate || prev.licensePlate,
            idCardNumber: u.idCardNumber || prev.idCardNumber,
            driverLicenseNumber:
              u.driverLicenseNumber || prev.driverLicenseNumber,
            driverLicenseImage: u.driverLicenseImage || prev.driverLicenseImage,
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
        vehicleType: form.vehicleType.trim(),
        licensePlate: form.licensePlate.trim(),
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

      const currentObj = getScopedProfile("driver") || {};
      const merged = { ...currentObj, ...updatedUser };
      const token = getScopedToken("driver") || "";
      setScopedSession("driver", token, merged);

      setForm((prev) => ({ ...prev, password: "" }));
      showToast("Đã cập nhật hồ sơ Tài xế thành công!", "success");
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Không thể cập nhật thông tin Tài xế!",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearScopedSession("driver");
    showToast("Đã đăng xuất khỏi App Tài Xế!", "info");
    navigate("/mobile-driver/login", { replace: true });
  };

  return {
    form,
    setForm,
    saving,
    handleSave,
    handleLogout,
  };
};
