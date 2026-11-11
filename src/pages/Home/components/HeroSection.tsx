import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  ShieldCheck,
  Zap,
  CheckCircle,
  Smartphone,
  Bike,
  Store,
  MapPin,
  ArrowRight,
} from "lucide-react";

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      id="home-hero-section"
      className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-xl shadow-blue-900/10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent pointer-events-none"></div>
      <div className="max-w-3xl relative z-10 space-y-5">
        <span className="bg-blue-500/25 border border-blue-400/30 text-blue-200 text-[10px] md:text-xs font-black uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5 backdrop-blur-sm">
          <Award className="w-3.5 h-3.5 text-blue-400" />
          CỔNG THÔNG TIN HỆ THỐNG GIẶT SẤY HÀ NỘI · 2 APP DI ĐỘNG & 2 WEB QUẢN TRỊ
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
          Đặt Giặt Sấy & Chụp Ảnh Đồ Qua{" "}
          <span className="text-blue-400">App Điện Thoại</span>,{" "}
          <br className="hidden sm:inline" />
          Quản Trị Vận Hành Trên{" "}
          <span className="text-emerald-400">Web Chuyên Dụng</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
          Khách hàng và Tài xế Shipper sử dụng 2 Ứng dụng Di động riêng biệt trên
          điện thoại để chụp ảnh nhãn mác AI, định vị GPS Hà Nội và nhận chuyến.
          Chủ tiệm giặt và Quản trị viên Platform điều hành trên 2 Cổng Web màn
          hình lớn độc lập.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate("/mobile-customer/home")}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mở App Khách Hàng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/mobile-driver/radar")}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Bike className="w-4 h-4" />
            <span>Mở App Tài Xế</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/store-owner/login")}
            className="px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Store className="w-4 h-4 text-blue-300" />
            <span>Web Chủ Tiệm Giặt</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/stores-map")}
            className="px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-amber-300" />
            <span>Bản Đồ Tiệm Hà Nội</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            2 App Mobile có Intro Splash 3.5s riêng
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
            Phiên đăng nhập tách biệt từng Actor
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            100% chi nhánh & GPS tại TP. Hà Nội
          </div>
        </div>
      </div>
    </section>
  );
};
