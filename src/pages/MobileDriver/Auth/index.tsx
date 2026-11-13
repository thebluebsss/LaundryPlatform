import React from "react";
import { Bike, LogIn, Lock, User, Eye, EyeOff } from "lucide-react";
import { MobileAppSplash } from "../../../components/MobileAppSplash";
import { InputText } from "../../../components/InputText";
import { ButtonCustom } from "../../../components/ButtonCustom";
import { useMobileDriverAuth } from "./hook";

export const MobileDriverAuth: React.FC = () => {
  const {
    replaySplash,
    setReplaySplash,
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    handleDriverLogin,
  } = useMobileDriverAuth();

  if (replaySplash) {
    return (
      <MobileAppSplash
        appType="driver"
        isLoggedIn={false}
        onFinish={() => setReplaySplash(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300 my-2">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-md">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                vn.sachse.driver · Hà Nội
              </span>
              <h1 className="text-lg font-black mt-1">
                Sạch Sẽ Tài Xế (Driver App)
              </h1>
            </div>
          </div>
        </div>
        <p className="text-xs text-emerald-100 mt-3 leading-relaxed">
          Ứng dụng dành riêng cho Đối tác Tài xế thu gom đồ bẩn và giao trả đồ
          sạch tại TP. Hà Nội.
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
          <span className="font-black">Cấp tài khoản Đối tác Shipper:</span> Tài
          xế không tự đăng ký trực tuyến. Hồ sơ (CCCD, Bằng lái GPLX, Biển số
          xe) do Quản trị viên Platform thẩm định trực tiếp và cấp tài khoản.
        </div>

        <form onSubmit={handleDriverLogin} className="space-y-3.5">
          <InputText
            title="Username, Email hoặc Số điện thoại Tài xế"
            required
            placeholder="Nhập username, email hoặc SĐT tài xế"
            startAdornment={<User className="w-4 h-4 text-slate-400" />}
            inputProps={{
              value: username,
              onChange: (e: any) => setUsername(e.target.value),
            }}
          />

          <InputText
            title="Mật khẩu"
            required
            placeholder="Nhập mật khẩu bảo mật"
            startAdornment={<Lock className="w-4 h-4 text-slate-400" />}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            inputProps={{
              type: showPassword ? "text" : "password",
              value: password,
              onChange: (e: any) => setPassword(e.target.value),
            }}
          />

          <ButtonCustom
            type="submit"
            loading={loading}
            iconStart={<LogIn className="w-4 h-4" />}
            label={loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP APP TÀI XẾ"}
            className="!bg-emerald-600 hover:!bg-emerald-700"
            textClassName="!text-xs !font-black"
          />
        </form>
      </div>
    </div>
  );
};
