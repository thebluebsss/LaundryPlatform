import React from "react";
import { User, Phone, MapPin, Clock } from "lucide-react";
import { DISTRICTS } from "../../../data";
import { InputText } from "../../../components/InputText";
import { InputSelect } from "../../../components/InputSelect";
import { InputArea } from "../../../components/InputArea";
import { Box } from "@mui/material";

interface BookingFormProps {
  fullname: string;
  setFullname: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  city: "hanoi" | "hcm";
  setCity: (val: "hanoi" | "hcm") => void;
  district: string;
  setDistrict: (val: string) => void;
  addressDetail: string;
  setAddressDetail: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  customerSpecialRequest?: string;
  setCustomerSpecialRequest?: (val: string) => void;
  pickupDateStr: string;
  setPickupDateStr: (val: string) => void;
  pickupTimeSlot: string;
  setPickupTimeSlot: (val: string) => void;
  deliveryDateStr: string;
  setDeliveryDateStr: (val: string) => void;
  deliveryTimeSlot: string;
  setDeliveryTimeSlot: (val: string) => void;
  errors: Record<string, string>;
  timeSlots: string[];
}

const QUICK_REQUEST_SUGGESTIONS = [
  "Trả đồ gấp trước 18h tối nay",
  "Trả đồ trước 9h sáng mai để đi công tác",
  "Ủi phẳng treo móc sẵn (không gấp)",
  "Giặt riêng đồ em bé bằng nước ấm",
];

export const BookingForm: React.FC<BookingFormProps> = ({
  fullname,
  setFullname,
  phoneNumber,
  setPhoneNumber,
  setCity,
  district,
  setDistrict,
  addressDetail,
  setAddressDetail,
  notes,
  setNotes,
  customerSpecialRequest = "",
  setCustomerSpecialRequest,
  errors,
}) => {
  return (
    <Box className="flex flex-col gap-6">
      {/* Section 1: Customer info */}
      <Box className="flex flex-col gap-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 m-0 select-none">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block" />
          1. Thông tin liên hệ nhận hàng
        </h3>

        <Box className="flex flex-col gap-4">
          <InputText
            title="Họ & Tên khách hàng *"
            placeholder="Nguyễn Văn A"
            startAdornment={
              <User style={{ width: "16px", height: "16px", color: "#94a3b8" }} />
            }
            inputProps={{
              value: fullname,
              onChange: (e: any) => setFullname(e.target.value),
            }}
            inputError={errors.fullname}
          />

          <InputText
            title="Số điện thoại di động *"
            placeholder="0912345678"
            startAdornment={
              <Phone style={{ width: "16px", height: "16px", color: "#94a3b8" }} />
            }
            inputProps={{
              value: phoneNumber,
              onChange: (e: any) => setPhoneNumber(e.target.value),
            }}
            inputError={errors.phone}
          />
        </Box>
      </Box>

      {/* Section 2: Address */}
      <Box className="flex flex-col gap-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 m-0 select-none">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block" />
          2. Khu vực giao nhận hàng (TP. Hà Nội)
        </h3>

        <Box className="flex flex-col gap-4">
          <InputSelect
            title="Thành phố *"
            value="hanoi"
            onChange={() => {
              setCity("hanoi");
              setDistrict(DISTRICTS.hanoi[0]);
            }}
            options={[{ value: "hanoi", label: "TP. Hà Nội" }]}
          />

          <InputSelect
            title="Chọn Quận / Huyện (Hà Nội) *"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            options={DISTRICTS.hanoi.map((d) => ({ value: d, label: d }))}
          />

          <InputText
            title="Địa chỉ chi tiết (Số nhà, ngõ ngách, tên đường) *"
            placeholder="Ví dụ: Số 25, Ngõ 102 Đường Kim Mã"
            startAdornment={
              <MapPin
                style={{ width: "16px", height: "16px", color: "#94a3b8" }}
              />
            }
            inputProps={{
              value: addressDetail,
              onChange: (e: any) => setAddressDetail(e.target.value),
            }}
            inputError={errors.addressDetail}
          />
        </Box>
      </Box>

      {/* Section 3: Customer Special Request */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-black text-amber-900">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            3. Yêu cầu đặc biệt của khách (VD: Muốn trả đồ trước ngày/giờ cụ thể, giặt gấp...)
          </span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed m-0">
          Chủ cửa hàng sẽ nhìn thấy yêu cầu này ngay trên đơn giặt và có thể cập nhật phụ phí xử lý nhanh (nếu có) để bạn duyệt.
        </p>
        <InputText
          inputProps={{
            placeholder:
              "VD: Mình muốn nhận lại đồ sạch trước 17h ngày mai (Thứ 6)...",
            value: customerSpecialRequest,
            onChange: (e: any) =>
              setCustomerSpecialRequest?.(e.target.value),
          }}
        />
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {QUICK_REQUEST_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setCustomerSpecialRequest?.(suggestion)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/80 border border-amber-200 text-[11px] font-semibold text-amber-900 cursor-pointer transition-colors"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Section 4: Notes */}
      <InputArea
        title="4. Ghi chú thêm cho Tài xế hoặc Thợ giặt"
        placeholder="Ví dụ: Gọi điện trước 10 phút khi đến lấy đồ, gửi tại lễ tân tòa nhà..."
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </Box>
  );
};
