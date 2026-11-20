import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Box } from "@mui/material";
import { InputText } from "../../components/InputText";
import { InputArea } from "../../components/InputArea";
import { ButtonCustom } from "../../components/ButtonCustom";
import { useContactForm } from "./hook";

export const Contact: React.FC = () => {
  const {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    message,
    setMessage,
    isSubmitting,
    handleSubmit,
  } = useContactForm();

  const getIconBoxClass = (
    colorScheme: "blue" | "indigo" | "emerald" | "amber"
  ) => {
    const schemes = {
      blue: "bg-blue-50 text-blue-600",
      indigo: "bg-indigo-50 text-indigo-600",
      emerald: "bg-emerald-50 text-emerald-600",
      amber: "bg-amber-50 text-amber-600",
    };
    return `w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${schemes[colorScheme]}`;
  };

  return (
    <Box id="contact-root-container" className="flex flex-col gap-8">
      {/* Intro section banner */}
      <Box className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col gap-3">
        <Box className="max-w-2xl">
          <p className="text-xs font-semibold text-blue-600 m-0">
            Hỗ trợ khách hàng
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 m-0 mt-1 tracking-tight">
            Liên hệ Giặt Là Sạch Sẽ
          </h2>
          <p className="text-xs md:text-sm text-slate-600 m-0 mt-2 leading-relaxed">
            Cần tư vấn giặt đồ đặc biệt, báo giá hợp đồng cho khách sạn/spa hoặc
            phản hồi về đơn giặt? Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ
            trợ bạn mỗi ngày.
          </p>
        </Box>
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info (5 cols) */}
        <Box className="lg:col-span-5 flex flex-col gap-6">
          <Box className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs flex flex-col gap-5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
              <MessageSquare className="w-[18px] h-[18px] text-blue-600" />
              Thông tin liên hệ
            </h4>

            <Box className="flex flex-col gap-3.5">
              <Box className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50/75 transition-colors duration-200">
                <div className={getIconBoxClass("blue")}>
                  <Phone className="w-[18px] h-[18px]" />
                </div>
                <Box className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-slate-500">
                    Tổng đài hỗ trợ
                  </span>
                  <div className="text-sm font-bold text-slate-900 tabular-nums">
                    1900-5454-99
                  </div>
                  <p className="text-xs text-slate-500 m-0">
                    Tiếp nhận từ 07:00 đến 22:00 hằng ngày
                  </p>
                </Box>
              </Box>

              <Box className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50/75 transition-colors duration-200">
                <div className={getIconBoxClass("indigo")}>
                  <Mail className="w-[18px] h-[18px]" />
                </div>
                <Box className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-slate-500">
                    Email chăm sóc khách hàng
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    chamsockhachhang@sachse.vn
                  </div>
                  <p className="text-xs text-slate-500 m-0">
                    Hỗ trợ đơn hàng & hợp đồng giặt là doanh nghiệp, spa, homestay
                  </p>
                </Box>
              </Box>

              <Box className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50/75 transition-colors duration-200">
                <div className={getIconBoxClass("emerald")}>
                  <MapPin className="w-[18px] h-[18px]" />
                </div>
                <Box className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-slate-500">
                    Văn phòng & xưởng trung tâm
                  </span>
                  <div className="text-xs font-semibold text-slate-800 leading-normal">
                    Shophouse SV12, KĐT Vinhomes Ocean Park, Gia Lâm, Hà Nội
                  </div>
                </Box>
              </Box>

              <Box className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50/75 transition-colors duration-200">
                <div className={getIconBoxClass("amber")}>
                  <Clock className="w-[18px] h-[18px]" />
                </div>
                <Box className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-slate-500">
                    Giờ mở cửa
                  </span>
                  <div className="text-sm font-bold text-slate-900 tabular-nums">
                    07:00 – 22:00 (Thứ 2 – Chủ Nhật)
                  </div>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col gap-2.5 shadow-sm">
            <Box className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
              <ShieldCheck className="w-40 h-40 text-white" />
            </Box>
            <div className="text-xs font-semibold text-blue-300">
              Cam kết bảo đảm chất lượng
            </div>
            <p className="text-xs text-slate-300 leading-relaxed m-0 relative z-10">
              Sạch Sẽ bồi thường lên tới{" "}
              <span className="font-bold text-white">20 lần</span> giá cước của
              món đồ nếu xảy ra hư hại hoặc thất lạc do lỗi trong quá trình giặt
              sấy tại cửa hàng.
            </p>
          </Box>
        </Box>

        {/* Contact Form (7 cols) */}
        <Box className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-2xs flex flex-col gap-5"
          >
            <div>
              <h4 className="text-base font-bold text-slate-900 m-0">
                Gửi yêu cầu tư vấn hoặc phản hồi
              </h4>
              <p className="text-xs text-slate-500 m-0 mt-1.5 leading-relaxed">
                Nếu bạn cần giặt rèm cửa cỡ lớn, chăn lông vũ, đồ lụa hoặc cần
                hỗ trợ về đơn hàng, hãy để lại thông tin để nhân viên gọi lại
                sớm nhất.
              </p>
            </div>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputText
                title="Họ và tên"
                required
                placeholder="Ví dụ: Nguyễn Minh Anh"
                inputProps={{
                  value: name,
                  onChange: (e: any) => setName(e.target.value),
                }}
              />

              <InputText
                title="Số điện thoại"
                required
                placeholder="Ví dụ: 0987 654 321"
                inputProps={{
                  type: "tel",
                  value: phone,
                  onChange: (e: any) => setPhone(e.target.value),
                }}
              />
            </Box>

            <InputText
              title="Email (không bắt buộc)"
              placeholder="Ví dụ: tenban@gmail.com"
              inputProps={{
                type: "email",
                value: email,
                onChange: (e: any) => setEmail(e.target.value),
              }}
            />

            <InputArea
              title="Nội dung cần hỗ trợ"
              required
              rows={4}
              placeholder="Ví dụ: Mình cần giặt hấp 3 áo vest dày và 2 bộ rèm cửa phòng khách..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <ButtonCustom
              type="submit"
              loading={isSubmitting}
              iconStart={<Send className="w-4 h-4" />}
              label={isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu hỗ trợ"}
              textClassName="!text-xs !font-bold"
            />
          </form>
        </Box>
      </Box>
    </Box>
  );
};
