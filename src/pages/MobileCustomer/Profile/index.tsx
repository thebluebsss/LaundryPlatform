import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  Save,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { authAPI } from "../../../services/api";
import { useToast } from "../../../components/Toast";
import {
  getScopedProfile,
  getScopedToken,
  setScopedSession,
  clearScopedSession,
} from "../../../utils/authStorage";

export const MobileCustomerProfile: React.FC = () => {
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
        "error",
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

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            {(form.fullName || form.username || "KH").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold">
              <Sparkles className="w-3 h-3" />
              Tài khoản Khách Hàng · TP. Hà Nội
            </div>
            <h2 className="text-base font-black text-slate-900 truncate mt-0.5">
              {form.fullName || form.username}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              @{form.username || "customer"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 mt-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Họ và Tên khách hàng *
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Số điện thoại liên hệ Shipper *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Địa chỉ lấy & giao đồ mặc định tại Hà Nội
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Số nhà, đường/phố, Quận tại Hà Nội"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
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
                placeholder="Tối thiểu 6 ký tự nếu muốn đổi mật khẩu"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>
              {saving ? "ĐANG LƯU HỒ SƠ..." : "LƯU THAY ĐỔI THÔNG TIN CÁ NHÂN"}
            </span>
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Đồng bộ tự động khi tạo đơn
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};
