import React from 'react';
import { Award, ShieldCheck, Zap, CheckCircle } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section id="home-hero-section" className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl shadow-blue-900/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="max-w-xl relative z-10 space-y-4">
        <span className="bg-blue-500/25 border border-blue-550/30 text-blue-200 text-[10px] md:text-xs font-black uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5 backdrop-blur-sm">
          <Award className="w-3.5 h-3.5 text-blue-400" />
          TIỆM GIẶT THU GOM & GIAO TRẢ ĐỒ SẠCH TẬN NHÀ
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
          Quần Áo Sạch Thơm, <br className="hidden sm:inline" /> Giao Nhận Siêu Tốc Trong 24h
        </h2>
        <p className="text-xs md:text-sm text-slate-350 leading-relaxed max-w-lg">
          Giặt riêng từng máy, sử dụng nước ấm diệt khuẩn cùng công nghệ vắt cực khô ly tâm. Đặt lịch nhanh chóng để biến dọn dẹp nhà cửa trở nên thật nhẹ nhàng!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            Khử trùng bằng Nano Bạc
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
            Giao trả cực nhanh 24h
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            Freeship đơn hàng {`>=`} 200k
          </div>
        </div>
      </div>
    </section>
  );
};
