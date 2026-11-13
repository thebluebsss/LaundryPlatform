import React from "react";
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
import { InputText } from "../../../components/InputText";
import { ButtonCustom } from "../../../components/ButtonCustom";
import { useMobileCustomerProfile } from "./hook";

export const MobileCustomerProfile: React.FC = () => {
  const { form, setForm, saving, handleSave, handleLogout } =
    useMobileCustomerProfile();

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
          <InputText
            title="Họ và Tên khách hàng"
            required
            startAdornment={<User className="w-4 h-4 text-slate-400" />}
            inputProps={{
              value: form.fullName,
              onChange: (e: any) =>
                setForm((p) => ({ ...p, fullName: e.target.value })),
            }}
          />

          <InputText
            title="Số điện thoại liên hệ Shipper"
            required
            startAdornment={<Phone className="w-4 h-4 text-slate-400" />}
            inputProps={{
              type: "tel",
              value: form.phone,
              onChange: (e: any) =>
                setForm((p) => ({ ...p, phone: e.target.value })),
            }}
          />

          <InputText
            title="Địa chỉ Email"
            startAdornment={<Mail className="w-4 h-4 text-slate-400" />}
            inputProps={{
              type: "email",
              value: form.email,
              onChange: (e: any) =>
                setForm((p) => ({ ...p, email: e.target.value })),
            }}
          />

          <InputText
            title="Địa chỉ lấy & giao đồ mặc định tại Hà Nội"
            placeholder="Số nhà, đường/phố, Quận tại Hà Nội"
            startAdornment={<MapPin className="w-4 h-4 text-slate-400" />}
            inputProps={{
              value: form.address,
              onChange: (e: any) =>
                setForm((p) => ({ ...p, address: e.target.value })),
            }}
          />

          <InputText
            title="Đổi mật khẩu mới (Để trống nếu giữ nguyên)"
            placeholder="Tối thiểu 6 ký tự nếu muốn đổi mật khẩu"
            startAdornment={<Lock className="w-4 h-4 text-slate-400" />}
            inputProps={{
              type: "password",
              value: form.password,
              onChange: (e: any) =>
                setForm((p) => ({ ...p, password: e.target.value })),
            }}
          />

          <ButtonCustom
            type="submit"
            loading={saving}
            iconStart={<Save className="w-4 h-4" />}
            label={
              saving
                ? "ĐANG LƯU HỒ SƠ..."
                : "LƯU THAY ĐỔI THÔNG TIN CÁ NHÂN"
            }
            textClassName="!text-xs !font-black"
          />
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
