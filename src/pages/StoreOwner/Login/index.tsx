import React from "react";
import { NavLink } from "react-router-dom";
import {
  Store,
  LogIn,
  Lock,
  User,
  Phone,
  ArrowLeft,
  ShieldCheck,
  Info,
} from "lucide-react";
import { InputText } from "../../../components/InputText";
import { ButtonCustom } from "../../../components/ButtonCustom";
import { useStoreOwnerLogin } from "./hook";

export const StoreOwnerLogin: React.FC = () => {
  const {
    submitting,
    username,
    setUsername,
    password,
    setPassword,
    handleLogin,
  } = useStoreOwnerLogin();

  return (
    <div className="min-h-[560px] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            Web Portal Dành Riêng Cho Đối Tác
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Đăng Nhập Chủ Tiệm Giặt
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống quản lý đơn giặt, cân đo thực tế, điều phối Shipper và cấu
            hình cửa hàng trên Google Maps
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <InputText
            title="Tên đăng nhập hoặc Email Chủ tiệm"
            required
            placeholder="Ví dụ: owner hoặc owner@sachse.com"
            startAdornment={<User className="w-4 h-4 text-slate-400" />}
            inputProps={{
              value: username,
              onChange: (e: any) => setUsername(e.target.value),
            }}
          />

          <InputText
            title="Mật khẩu quản trị tiệm"
            required
            placeholder="Nhập mật khẩu do Admin cấp"
            startAdornment={<Lock className="w-4 h-4 text-slate-400" />}
            inputProps={{
              type: "password",
              value: password,
              onChange: (e: any) => setPassword(e.target.value),
            }}
          />

          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-2 text-xs">
            <div>
              <div className="font-bold text-blue-900">
                Tài khoản Chủ tiệm khởi tạo sẵn:
              </div>
              <div className="font-mono text-[11px] text-blue-700">
                Tài khoản: <strong>owner</strong> · Mật khẩu:{" "}
                <strong>123456</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername("owner");
                setPassword("123456");
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] shrink-0 cursor-pointer"
            >
              Điền nhanh
            </button>
          </div>

          <ButtonCustom
            type="submit"
            loading={submitting}
            iconStart={<LogIn className="w-4 h-4" />}
            label="Đăng Nhập Cổng Chủ Tiệm"
          />
        </form>

        {/* Partner Onboarding Policy Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1.5">
          <div className="font-black flex items-center gap-1.5 text-amber-800">
            <Info className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Quy định cấp tài khoản Đối tác Chủ tiệm giặt</span>
          </div>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            Chủ tiệm giặt không tự đăng ký tài khoản trực tuyến. Vui lòng liên
            hệ trực tiếp <strong>Quản trị viên Platform</strong> để thẩm định cơ
            sở, khai báo địa chỉ chi tiết, định vị tọa độ trên Google Maps và
            nhận bàn giao tài khoản vận hành.
          </p>
          <div className="pt-1 flex items-center gap-3 text-[11px] font-bold text-amber-900">
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-700" />
              Hotline Đối tác: 1900 6868
            </span>
            <span>·</span>
            <span>Email: partner@sachse.vn</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <NavLink
            to="/"
            className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Trang chủ Khách hàng</span>
          </NavLink>

          <NavLink
            to="/admin/login"
            className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cổng Admin Platform</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
