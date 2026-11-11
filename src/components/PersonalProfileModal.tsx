import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  Save,
  ShieldCheck,
} from "lucide-react";
import { authAPI } from "../services/api";
import { useToast } from "./Toast";
import {
  detectActiveScopeFromUrl,
  getScopedProfile,
  getScopedToken,
  setScopedSession,
} from "../utils/authStorage";

interface PersonalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleLabel?: string;
}

export const PersonalProfileModal: React.FC<PersonalProfileModalProps> = ({
  isOpen,
  onClose,
  roleLabel = "Chủ tài khoản",
}) => {
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
    if (!isOpen) return;
    const loadProfile = async () => {
      const scope = detectActiveScopeFromUrl();
      const parsed = getScopedProfile(scope);
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
  }, [isOpen]);

  if (!isOpen) return null;

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
        showToast("Mật khẩu mới phải từ 6 ký tự trở lên!", "warning");
        setSaving(false);
        return;
      }

      const res = await authAPI.updateProfile(payload);
      const updatedUser = res.data?.data || payload;

      const scope = detectActiveScopeFromUrl();
      const currentObj = getScopedProfile(scope) || {};
      const merged = { ...currentObj, ...updatedUser };
      const token = getScopedToken(scope) || "";
      setScopedSession(scope, token, merged);

      showToast("Đã cập nhật thông tin cá nhân thành công!", "success");
      onClose();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Không thể cập nhật thông tin cá nhân!",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/25 font-black">
              {(form.fullName || form.username || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                {roleLabel}
              </span>
              <h3 className="text-base font-black mt-0.5">
                Thay Đổi Thông Tin Cá Nhân
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và Tên chủ tài khoản *
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số điện thoại liên hệ *
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Địa chỉ liên hệ tại TP. Hà Nội
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
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
                placeholder="Nhập tối thiểu 6 ký tự nếu muốn đổi mật khẩu"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Tài khoản @{form.username || "user"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
