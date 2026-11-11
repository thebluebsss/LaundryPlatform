import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bike,
  LogIn,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useToast } from "../../../components/Toast";
import { setScopedSession } from "../../../utils/authStorage";
import { MobileAppSplash } from "../../../components/MobileAppSplash";

export const MobileDriverAuth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get("redirect") || "/mobile-driver/radar";

  const [replaySplash, setReplaySplash] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast(
        "Vui lòng nhập Username, Email hoặc SĐT Shipper và mật khẩu!",
        "warning",
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const loggedUser = result.data.user;
        const normalizedRole =
          loggedUser.role === "shipper" ? "driver" : loggedUser.role;

        if (normalizedRole !== "driver" && normalizedRole !== "admin") {
          showToast(
            "Tài khoản này không phải là Đối tác Tài xế Shipper! Vui lòng dùng tài khoản Shipper do Admin cấp.",
            "error",
          );
          setLoading(false);
          return;
        }

        loggedUser.role = "driver";
        setScopedSession("driver", result.data.token, loggedUser);
        showToast(
          `Đăng nhập thành công Tài xế: ${loggedUser.fullName || loggedUser.username}`,
          "success",
        );
        navigate(redirectTo, { replace: true });
      } else {
        showToast(
          result.message || "Tài khoản hoặc mật khẩu không chính xác!",
          "error",
        );
      }
    } catch {
      showToast("Lỗi kết nối máy chủ. Vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

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
          <button
            type="button"
            onClick={() => setReplaySplash(true)}
            className="text-[11px] font-bold bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-xl border border-white/20 cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Intro</span>
          </button>
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
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Username, Email hoặc Số điện thoại Tài xế *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username, email hoặc SĐT tài xế"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Mật khẩu *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu bảo mật"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>
              {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP APP TÀI XẾ"}
            </span>
          </button>

          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="text-[10px] font-extrabold text-emerald-800 uppercase">
              Tài khoản Tài xế khởi tạo sẵn (Chạm để điền nhanh):
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername("driver");
                setPassword("123456");
              }}
              className="w-full p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 flex items-center justify-between text-xs cursor-pointer"
            >
              <span className="font-black text-emerald-700">
                Nguyễn Văn Hùng (Shipper Hà Nội)
              </span>
              <span className="font-mono text-[11px] text-slate-600">
                driver / 123456
              </span>
            </button>
          </div>
        </form>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Phiên đăng nhập độc lập cho App Tài Xế
          </span>
        </div>
      </div>
    </div>
  );
};
