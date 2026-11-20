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
          <span className="inline-block text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            Dành cho đối tác chủ tiệm
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Đăng nhập chủ tiệm giặt
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Quản lý đơn giặt, cân đo thực tế, điều phối tài xế và cập nhật thông
            tin cửa hàng.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <InputText
            title="Tên đăng nhập hoặc email"
            required
            placeholder="Nhập tên đăng nhập hoặc email"
            startAdornment={<User className="w-4 h-4 text-slate-400" />}
            inputProps={{
              value: username,
              onChange: (e: any) => setUsername(e.target.value),
            }}
          />

          <InputText
            title="Mật khẩu"
            required
            placeholder="Nhập mật khẩu"
            startAdornment={<Lock className="w-4 h-4 text-slate-400" />}
            inputProps={{
              type: "password",
              value: password,
              onChange: (e: any) => setPassword(e.target.value),
            }}
          />

          {(import.meta as any).env?.DEV && (
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-2 text-xs">
              <div>
                <div className="font-semibold text-blue-900">
                  Tài khoản chủ tiệm mẫu (Dev):
                </div>
                <div className="font-mono text-[11px] text-blue-700">
                  owner / 123456
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUsername("owner");
                  setPassword("123456");
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-[11px] shrink-0 cursor-pointer"
              >
                Điền nhanh
              </button>
            </div>
          )}

          <ButtonCustom
            type="submit"
            loading={submitting}
            iconStart={<LogIn className="w-4 h-4" />}
            label="Đăng nhập"
          />
        </form>

        {/* Partner Onboarding Policy Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-800">
            <Info className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Đăng ký mở tài khoản đối tác</span>
          </div>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            Để trở thành đối tác tiệm giặt Sạch Sẽ, vui lòng liên hệ đội ngũ
            phát triển đối tác để xác nhận cơ sở, cập nhật địa chỉ cửa hàng và
            nhận tài khoản quản lý.
          </p>
          <div className="pt-1 flex items-center gap-3 text-[11px] font-semibold text-amber-900">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Phone className="w-3.5 h-3.5 text-amber-700" />
              Hotline đối tác: 1900-5454-99
            </span>
            <span>·</span>
            <span>partner@sachse.vn</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <NavLink
            to="/"
            className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang chủ</span>
          </NavLink>

          <NavLink
            to="/admin/login"
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Quản trị hệ thống</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
