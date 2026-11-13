import React from "react";
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { InputText } from "../../../../components/InputText";
import { ButtonCustom } from "../../../../components/ButtonCustom";

interface CustomerLoginFormProps {
  loginUsername: string;
  setLoginUsername: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchForgot: () => void;
}

export const CustomerLoginForm: React.FC<CustomerLoginFormProps> = ({
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  showPassword,
  setShowPassword,
  loading,
  onSubmit,
  onSwitchForgot,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      <InputText
        title="Tên đăng nhập, Email hoặc Số điện thoại"
        required
        placeholder="Nhập username, email hoặc SĐT"
        startAdornment={<User className="w-4 h-4 text-slate-400" />}
        inputProps={{
          value: loginUsername,
          onChange: (e: any) => setLoginUsername(e.target.value),
        }}
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Mật khẩu <span className="text-red-500">*</span>
          </span>
          <button
            type="button"
            onClick={onSwitchForgot}
            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Quên mật khẩu?
          </button>
        </div>

        <InputText
          placeholder="Nhập mật khẩu"
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
            required: true,
            value: loginPassword,
            onChange: (e: any) => setLoginPassword(e.target.value),
          }}
        />
      </div>

      <ButtonCustom
        type="submit"
        loading={loading}
        iconStart={<LogIn className="w-4 h-4" />}
        label={loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP APP KHÁCH HÀNG"}
        textClassName="!text-xs !font-black"
      />
    </form>
  );
};
