import React from "react";
import { User, Phone, Mail, MapPin, Lock, UserPlus } from "lucide-react";
import { InputText } from "../../../../components/InputText";
import { ButtonCustom } from "../../../../components/ButtonCustom";
import { CustomerRegisterFormState } from "../hook";

interface CustomerRegisterFormProps {
  regForm: CustomerRegisterFormState;
  setRegForm: React.Dispatch<React.SetStateAction<CustomerRegisterFormState>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const CustomerRegisterForm: React.FC<CustomerRegisterFormProps> = ({
  regForm,
  setRegForm,
  loading,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <InputText
          title="Username"
          required
          placeholder="vd: minhanh"
          startAdornment={<User className="w-3.5 h-3.5 text-slate-400" />}
          inputProps={{
            value: regForm.username,
            onChange: (e: any) =>
              setRegForm((p) => ({
                ...p,
                username: e.target.value.toLowerCase().replace(/\s/g, ""),
              })),
          }}
        />

        <InputText
          title="Số điện thoại"
          required
          placeholder="098xxxxxxx"
          startAdornment={<Phone className="w-3.5 h-3.5 text-slate-400" />}
          inputProps={{
            type: "tel",
            value: regForm.phone,
            onChange: (e: any) =>
              setRegForm((p) => ({ ...p, phone: e.target.value })),
          }}
        />
      </div>

      <InputText
        title="Họ và Tên khách hàng"
        required
        placeholder="Ví dụ: Nguyễn Minh Anh"
        inputProps={{
          value: regForm.fullName,
          onChange: (e: any) =>
            setRegForm((p) => ({ ...p, fullName: e.target.value })),
        }}
      />

      <InputText
        title="Email nhận hóa đơn & khôi phục mật khẩu"
        required
        placeholder="minhanh@gmail.com"
        startAdornment={<Mail className="w-3.5 h-3.5 text-slate-400" />}
        inputProps={{
          type: "email",
          value: regForm.email,
          onChange: (e: any) =>
            setRegForm((p) => ({ ...p, email: e.target.value })),
        }}
      />

      <InputText
        title="Địa chỉ lấy / giao đồ tại Hà Nội"
        placeholder="Số nhà, ngõ, phố, Quận tại Hà Nội"
        startAdornment={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
        inputProps={{
          value: regForm.address,
          onChange: (e: any) =>
            setRegForm((p) => ({ ...p, address: e.target.value })),
        }}
      />

      <InputText
        title="Mật khẩu bảo mật (tối thiểu 6 ký tự)"
        required
        placeholder="Nhập mật khẩu"
        startAdornment={<Lock className="w-3.5 h-3.5 text-slate-400" />}
        inputProps={{
          type: "password",
          value: regForm.password,
          onChange: (e: any) =>
            setRegForm((p) => ({ ...p, password: e.target.value })),
        }}
      />

      <ButtonCustom
        type="submit"
        loading={loading}
        iconStart={<UserPlus className="w-4 h-4" />}
        label={loading ? "ĐANG TẠO TÀI KHOẢN..." : "TẠO TÀI KHOẢN KHÁCH HÀNG"}
        textClassName="!text-xs !font-black"
      />
    </form>
  );
};
