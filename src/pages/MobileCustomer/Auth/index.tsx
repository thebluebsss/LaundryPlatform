import React from "react";
import { Droplets } from "lucide-react";
import { MobileAppSplash } from "../../../components/MobileAppSplash";
import { useMobileCustomerAuth } from "./hook";
import { CustomerLoginForm } from "./components/CustomerLoginForm";
import { CustomerRegisterForm } from "./components/CustomerRegisterForm";
import { CustomerForgotForm } from "./components/CustomerForgotForm";

export const MobileCustomerAuth: React.FC = () => {
  const {
    replaySplash,
    setReplaySplash,
    mode,
    setMode,
    showPassword,
    setShowPassword,
    loading,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    regForm,
    setRegForm,
    forgotStep,
    setForgotStep,
    forgotEmail,
    setForgotEmail,
    forgotOtp,
    setForgotOtp,
    forgotNewPassword,
    setForgotNewPassword,
    forgotConfirmPassword,
    setForgotConfirmPassword,
    fallbackOtpHint,
    handleLogin,
    handleRegister,
    handleSendOtp,
    handleResetPassword,
  } = useMobileCustomerAuth();

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
        </div>
        <p className="text-xs text-blue-100 mt-3 leading-relaxed">
          Đặt lịch thu gom tận nhà, theo dõi tiến độ giặt sấy và duyệt cân thực
          tế minh bạch tại TP. Hà Nội.
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Mode Switcher */}
        <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
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
            className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === "register"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Đăng Ký
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setForgotStep(1);
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === "forgot"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Quên Mật Khẩu
          </button>
        </div>

        {mode === "login" ? (
          <CustomerLoginForm
            loginUsername={loginUsername}
            setLoginUsername={setLoginUsername}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loading={loading}
            onSubmit={handleLogin}
            onSwitchForgot={() => {
              setMode("forgot");
              setForgotStep(1);
              if (loginUsername.includes("@")) {
                setForgotEmail(loginUsername.trim());
              }
            }}
          />
        ) : mode === "forgot" ? (
          <CustomerForgotForm
            forgotStep={forgotStep}
            setForgotStep={setForgotStep}
            forgotEmail={forgotEmail}
            setForgotEmail={setForgotEmail}
            forgotOtp={forgotOtp}
            setForgotOtp={setForgotOtp}
            forgotNewPassword={forgotNewPassword}
            setForgotNewPassword={setForgotNewPassword}
            forgotConfirmPassword={forgotConfirmPassword}
            setForgotConfirmPassword={setForgotConfirmPassword}
            fallbackOtpHint={fallbackOtpHint}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loading={loading}
            onSendOtp={handleSendOtp}
            onResetPassword={handleResetPassword}
            onBackToLogin={() => setMode("login")}
          />
        ) : (
          <CustomerRegisterForm
            regForm={regForm}
            setRegForm={setRegForm}
            loading={loading}
            onSubmit={handleRegister}
          />
        )}
      </div>
    </div>
  );
};
