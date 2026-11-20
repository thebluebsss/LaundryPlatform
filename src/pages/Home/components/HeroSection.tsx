import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      id="home-hero-section"
      className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-lg"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-3xl relative z-10 space-y-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200 bg-white/10 border border-white/15 px-3 py-1 rounded-full">
          <MapPin className="w-3.5 h-3.5 text-blue-300" />
          <span>Giao nhận giặt sấy tận nhà tại Hà Nội</span>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">
          Giặt sạch, gấp gọn và{" "}
          <span className="text-blue-400">giao tận cửa</span>
          <br className="hidden sm:inline" />
          {" "}— cân đo minh bạch trước khi giặt
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          Chọn chi nhánh gần nhà, đặt lịch để tài xế đến tận cửa lấy đồ. Tiệm
          phân loại riêng từng mẻ, cân thực tế để bạn xác nhận giá rồi mới bắt
          đầu giặt sấy và giao trả đúng hẹn.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate("/mobile-customer/home")}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span>Đặt giặt ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/stores-map")}
            className="px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-blue-300" />
            <span>Tìm chi nhánh gần bạn</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Mỗi đơn giặt riêng 1 máy
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-300" />
            Miễn phí giao nhận đơn từ 200.000đ
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Báo giá rõ ràng trước khi giặt
          </span>
        </div>
      </div>
    </section>
  );
};
