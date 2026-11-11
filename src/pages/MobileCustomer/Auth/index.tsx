import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Droplets,
  MapPin,
  LogIn,
  UserPlus,
  Lock,
  User,
  Phone,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useToast } from "../../../components/Toast";
import { setScopedSession } from "../../../utils/authStorage";
import { MobileAppSplash } from "../../../components/MobileAppSplash";

export const MobileCustomerAuth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get("redirect") || "/mobile-customer/home";

  const [replaySplash, setReplaySplash] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regForm, setRegForm] = useState({
    username: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      showToast(
        "Vui lòng nhập tên đăng nhập/email/SĐT và mật khẩu!",
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
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const loggedUser = result.data.user;
        const normalizedRole =
          loggedUser.role === "store_manager"
            ? "store_owner"
            : loggedUser.role === "shipper"
              ? "driver"
              : loggedUser.role || "user";

        if (normalizedRole !== "user") {
          showToast(
            "Đây là App Khách Hàng. Tài khoản Tài xế/Chủ tiệm vui lòng đăng nhập đúng ứng dụng tương ứng!",
            "error",
          );
          setLoading(false);
          return;
        }

        loggedUser.role = "user";
        setScopedSession("customer", result.data.token, loggedUser);
        showToast(
          `Xin chào ${loggedUser.fullName || loggedUser.username}! Chào mừng bạn đến với App Sạch Sẽ.`,
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !regForm.username.trim() ||
      !regForm.fullName.trim() ||
      !regForm.phone.trim() ||
      !regForm.email.trim() ||
      regForm.password.length < 6
    ) {
      showToast(
        "Vui lòng điền đầy đủ thông tin và mật khẩu tối thiểu 6 ký tự!",
        "warning",
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...regForm,
          username: regForm.username.trim().toLowerCase(),
          role: "user",
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const loggedUser = { ...result.data.user, role: "user" };
        setScopedSession("customer", result.data.token, loggedUser);
        showToast(
          "Đăng ký tài khoản Khách hàng thành công! Đang vào Trang chủ...",
          "success",
        );
        navigate("/mobile-customer/home", { replace: true });
      } else {
        showToast(
          result.message || "Đăng ký thất bại, vui lòng kiểm tra lại!",
          "error",
        );
      }
    } catch {
      showToast("Lỗi kết nối máy chủ khi đăng ký!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (replaySplash) {
    return (
      <MobileAppSplash
        appType="customer"
        isLoggedIn={false}
        onFinish={() => setReplaySplash(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300 my-2">
      {/* App Header Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-md">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                vn.sachse.customer · Hà Nội
              </span>
              <h1 className="text-lg font-black mt-1">
                Sạch Sẽ — App Khách Hàng
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
        <p className="text-xs text-blue-100 mt-3 leading-relaxed">
          Đặt lịch thu gom tận nhà, chụp ảnh quần áo bằng Camera điện thoại và
          duyệt cân thực tế minh bạch tại TP. Hà Nội.
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Mode Switcher */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              mode === "login"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              mode === "register"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Đăng Ký Khách Hàng
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tên đăng nhập, Email hoặc Số điện thoại *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Nhập username, email hoặc SĐT"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
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
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP APP KHÁCH HÀNG"}
              </span>
            </button>

            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
              <div className="text-[10px] font-extrabold text-blue-800 uppercase">
                Tài khoản Khách hàng thử nghiệm (Chạm để điền nhanh):
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginUsername("user");
                  setLoginPassword("123456");
                }}
                className="w-full p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-400 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-black text-blue-700">
                  Khách hàng Hà Nội
                </span>
                <span className="font-mono text-[11px] text-slate-600">
                  user / 123456
                </span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={regForm.username}
                  onChange={(e) =>
                    setRegForm((p) => ({
                      ...p,
                      username: e.target.value.toLowerCase().replace(/\s/g, ""),
                    }))
                  }
                  placeholder="vd: minhanh"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Số điện thoại *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) =>
                      setRegForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="098xxxxxxx"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Họ và Tên khách hàng *
              </label>
              <input
                type="text"
                required
                value={regForm.fullName}
                onChange={(e) =>
                  setRegForm((p) => ({ ...p, fullName: e.target.value }))
                }
                placeholder="Ví dụ: Nguyễn Minh Anh"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Email nhận hóa đơn *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) =>
                    setRegForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="minhanh@gmail.com"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Địa chỉ lấy / giao đồ tại Hà Nội
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regForm.address}
                  onChange={(e) =>
                    setRegForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="Số nhà, ngõ, phố, Quận tại Hà Nội"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Mật khẩu bảo mật (tối thiểu 6 ký tự) *
              </label>
              <input
                type="password"
                required
                value={regForm.password}
                onChange={(e) =>
                  setRegForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Nhập mật khẩu"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {loading ? "ĐANG TẠO TÀI KHOẢN..." : "TẠO TÀI KHOẢN KHÁCH HÀNG"}
              </span>
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Phiên đăng nhập độc lập cho App Khách Hàng
          </span>
        </div>
      </div>
    </div>
  );
};
