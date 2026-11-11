import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  Bike,
  CreditCard,
  Save,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { authAPI } from "../../../services/api";
import { useToast } from "../../../components/Toast";
import {
  getScopedProfile,
  getScopedToken,
  setScopedSession,
  clearScopedSession,
} from "../../../utils/authStorage";

export const MobileDriverProfile: React.FC = () => {
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
        "error",
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

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            <Bike className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
              <ShieldCheck className="w-3 h-3" />
              Đối tác Tài xế Shipper · Hà Nội
            </div>
            <h2 className="text-base font-black text-slate-900 truncate mt-0.5">
              {form.fullName || form.username}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              @{form.username || "driver"} ·{" "}
              {form.licensePlate || "29-H1 686.88"}
            </p>
          </div>
        </div>

        {/* Verified Driver License Info from Admin */}
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-900 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
              Hồ sơ định danh do Admin xác thực
            </span>
            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
              Đã duyệt
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
            <div>
              <span className="text-slate-500">Số CCCD:</span>{" "}
              <span className="font-bold">
                {form.idCardNumber || "001098012345"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Số GPLX:</span>{" "}
              <span className="font-bold">
                {form.driverLicenseNumber || "010234567890"}
              </span>
            </div>
          </div>
          {form.driverLicenseImage && (
            <div className="pt-1">
              <img
                src={form.driverLicenseImage}
                alt="Bằng lái xe GPLX"
                className="h-24 w-full object-cover rounded-xl border border-emerald-200"
              />
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 mt-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Họ và Tên Tài xế *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fullName: e.target.value }))
                }
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Số điện thoại *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Biển kiểm soát Hà Nội
              </label>
              <input
                type="text"
                value={form.licensePlate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, licensePlate: e.target.value }))
                }
                placeholder="VD: 29-B1 123.45"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Loại phương tiện giao nhận
            </label>
            <input
              type="text"
              value={form.vehicleType}
              onChange={(e) =>
                setForm((p) => ({ ...p, vehicleType: e.target.value }))
              }
              placeholder="VD: Xe máy Honda Wave có baga chở túi giặt"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Email nhận thông báo đối soát
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Khu vực hoạt động thường trú tại Hà Nội
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="VD: Quận Cầu Giấy, Đống Đa, Hà Nội"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Đổi mật khẩu mới (Để trống nếu giữ nguyên)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Nhập tối thiểu 6 ký tự nếu đổi mật khẩu"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>
              {saving ? "ĐANG LƯU HỒ SƠ..." : "LƯU THAY ĐỔI HỒ SƠ TÀI XẾ"}
            </span>
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Cần đổi biển số/GPLX gốc? Liên hệ Admin 1900 6868
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};
