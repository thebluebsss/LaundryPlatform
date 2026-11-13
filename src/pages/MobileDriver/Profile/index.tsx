import React from "react";
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
import { InputText } from "../../../components/InputText";
import { ButtonCustom } from "../../../components/ButtonCustom";
import { useMobileDriverProfile } from "./hook";

export const MobileDriverProfile: React.FC = () => {
  const { form, setForm, saving, handleSave, handleLogout } =
    useMobileDriverProfile();

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
          <InputText
            title="Họ và Tên Tài xế"
            required
            startAdornment={<User className="w-4 h-4 text-slate-400" />}
            inputProps={{
              value: form.fullName,
              onChange: (e: any) =>
                setForm((p) => ({ ...p, fullName: e.target.value })),
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <InputText
              title="Số điện thoại"
              required
              startAdornment={<Phone className="w-3.5 h-3.5 text-slate-400" />}
              inputProps={{
                type: "tel",
                value: form.phone,
                onChange: (e: any) =>
                  setForm((p) => ({ ...p, phone: e.target.value })),
              }}
            />

            <InputText
              title="Biển kiểm soát Hà Nội"
              placeholder="VD: 29-B1 123.45"
              inputProps={{
                value: form.licensePlate,
                onChange: (e: any) =>
                  setForm((p) => ({ ...p, licensePlate: e.target.value })),
              }}
            />
          </div>

          <InputText
            title="Loại phương tiện giao nhận"
            placeholder="VD: Xe máy Honda Wave có baga chở túi giặt"
            inputProps={{
              value: form.vehicleType,
              onChange: (e: any) =>
                setForm((p) => ({ ...p, vehicleType: e.target.value })),
            }}
          />

          <InputText
            title="Email nhận thông báo đối soát"
            startAdornment={<Mail className="w-4 h-4 text-slate-400" />}
            inputProps={{
              type: "email",
              value: form.email,
              onChange: (e: any) =>
                setForm((p) => ({ ...p, email: e.target.value })),
            }}
          />

          <InputText
            title="Khu vực hoạt động thường trú tại Hà Nội"
            placeholder="VD: Quận Cầu Giấy, Đống Đa, Hà Nội"
            startAdornment={<MapPin className="w-4 h-4 text-slate-400" />}
            inputProps={{
              value: form.address,
              onChange: (e: any) =>
                setForm((p) => ({ ...p, address: e.target.value })),
            }}
          />

          <InputText
            title="Đổi mật khẩu mới (Để trống nếu giữ nguyên)"
            placeholder="Nhập tối thiểu 6 ký tự nếu đổi mật khẩu"
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
              saving ? "ĐANG LƯU HỒ SƠ..." : "LƯU THAY ĐỔI HỒ SƠ TÀI XẾ"
            }
            className="!bg-emerald-600 hover:!bg-emerald-700"
            textClassName="!text-xs !font-black"
          />
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
