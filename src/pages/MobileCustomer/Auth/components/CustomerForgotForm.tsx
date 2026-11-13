import React from "react";
import {
  KeyRound,
  Mail,
  Send,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { InputText } from "../../../../components/InputText";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";

interface CustomerForgotFormProps {
  forgotStep: 1 | 2;
  setForgotStep: (step: 1 | 2) => void;
  forgotEmail: string;
  setForgotEmail: (val: string) => void;
  forgotOtp: string;
  setForgotOtp: (val: string) => void;
  forgotNewPassword: string;
  setForgotNewPassword: (val: string) => void;
  forgotConfirmPassword: string;
  setForgotConfirmPassword: (val: string) => void;
  fallbackOtpHint: string | null;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loading: boolean;
  onSendOtp: (e: React.FormEvent) => void;
  onResetPassword: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

export const CustomerForgotForm: React.FC<CustomerForgotFormProps> = ({
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
  showPassword,
  setShowPassword,
  loading,
  onSendOtp,
  onResetPassword,
  onBackToLogin,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
          <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Khôi phục mật khẩu qua Email (OTP 6 số)</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {forgotStep === 1
            ? "Nhập địa chỉ Email đã đăng ký tài khoản khách hàng để nhận mã xác thực OTP có hiệu lực trong 10 phút."
            : `Mã OTP gồm 6 chữ số đã được gửi tới ${forgotEmail}. Vui lòng nhập mã OTP và mật khẩu mới bên dưới.`}
        </p>
      </div>

      {forgotStep === 1 ? (
        <form onSubmit={onSendOtp} className="space-y-3.5">
          <InputText
            title="Email hoặc Tên đăng nhập đã đăng ký"
            required
            placeholder="Nhập địa chỉ email đã đăng ký tài khoản"
            startAdornment={<Mail className="w-4 h-4 text-slate-400" />}
            inputProps={{
              value: forgotEmail,
              onChange: (e: any) => setForgotEmail(e.target.value),
            }}
          />

          <ButtonCustom
            type="submit"
            loading={loading}
            iconStart={<Send className="w-4 h-4" />}
            label={
              loading ? "Đang gửi mã OTP..." : "Gửi Mã Xác Nhận OTP Qua Email"
            }
            textClassName="!text-xs !font-bold"
          />

          <ButtonOutLine
            type="button"
            onClick={onBackToLogin}
            iconStart={<ArrowLeft className="w-3.5 h-3.5" />}
            label="Quay lại Đăng nhập"
            textClassName="!text-xs !font-bold"
          />
        </form>
      ) : (
        <form onSubmit={onResetPassword} className="space-y-3.5">
          {fallbackOtpHint && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold">Mã xác thực OTP của bạn:</div>
              <div className="text-base font-bold tracking-widest text-blue-700 tabular-nums">
                {fallbackOtpHint}
              </div>
              <div className="text-[11px] text-amber-700">
                Lưu ý: Để Gmail tự động gửi thư qua SMTP, biến EMAIL_PASS trong
                Secret cần dùng Mật khẩu ứng dụng Google (App Password 16 ký tự)
                thay vì mật khẩu đăng nhập Gmail thường.
              </div>
            </div>
          )}

          <InputText
            title="Mã xác nhận OTP (6 chữ số)"
            required
            placeholder="Nhập 6 chữ số OTP"
            inputProps={{
              maxLength: 6,
              value: forgotOtp,
              onChange: (e: any) =>
                setForgotOtp(e.target.value.replace(/\D/g, "")),
            }}
          />

          <InputText
            title="Mật khẩu mới (tối thiểu 6 ký tự)"
            required
            placeholder="Nhập mật khẩu mới"
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
              value: forgotNewPassword,
              onChange: (e: any) => setForgotNewPassword(e.target.value),
            }}
          />

          <InputText
            title="Nhập lại mật khẩu mới"
            required
            placeholder="Xác nhận lại mật khẩu mới"
            startAdornment={<Lock className="w-4 h-4 text-slate-400" />}
            inputProps={{
              type: showPassword ? "text" : "password",
              value: forgotConfirmPassword,
              onChange: (e: any) => setForgotConfirmPassword(e.target.value),
            }}
          />

          <ButtonCustom
            type="submit"
            loading={loading}
            iconStart={<CheckCircle2 className="w-4 h-4" />}
            label={
              loading ? "Đang cập nhật..." : "Xác Nhận Đặt Lại Mật Khẩu"
            }
            className="!bg-emerald-600 hover:!bg-emerald-700"
            textClassName="!text-xs !font-bold"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setForgotStep(1)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Đổi Email / Gửi lại OTP</span>
            </button>
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Về trang Đăng nhập
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
