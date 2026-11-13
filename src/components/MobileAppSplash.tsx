import React, { useEffect, useRef, useState } from "react";
import { Droplets, Bike, ShieldCheck, Sparkles } from "lucide-react";

interface MobileAppSplashProps {
  appType: "customer" | "driver";
  isLoggedIn: boolean;
  onFinish: () => void;
  durationMs?: number;
}

export const MobileAppSplash: React.FC<MobileAppSplashProps> = ({
  appType,
  isLoggedIn,
  onFinish,
  durationMs = 2400,
}) => {
  const [progress, setProgress] = useState(8);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    setProgress(8);
    const start = Date.now();
    let finished = false;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);
      if (elapsed >= durationMs && !finished) {
        finished = true;
        clearInterval(interval);
        onFinishRef.current();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [durationMs, appType]);

  const isCustomer = appType === "customer";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between p-8 text-white select-none ${
        isCustomer
          ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-950"
          : "bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-950"
      }`}
    >
      {/* Top Badge */}
      <div className="pt-6 flex items-center gap-2 opacity-90">
        <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-black tracking-wider uppercase">
          {isCustomer ? "vn.sachse.customer" : "vn.sachse.driver"}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-bold">
          TP. Hà Nội
        </span>
      </div>

      {/* Center Animated App Logo */}
      <div className="flex flex-col items-center text-center max-w-xs">
        <div className="relative mb-7">
          <div className="absolute -inset-4 rounded-full bg-white/20 blur-xl animate-pulse" />
          <div className="absolute -inset-2 rounded-[36px] border-2 border-white/30 animate-ping opacity-30" />
          <div className="relative w-28 h-28 rounded-[32px] bg-white text-slate-900 shadow-2xl flex items-center justify-center border-4 border-white/40">
            {isCustomer ? (
              <Droplets className="w-14 h-14 text-blue-600" />
            ) : (
              <Bike className="w-14 h-14 text-emerald-600" />
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-extrabold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {isCustomer
              ? "Ứng Dụng Đặt Giặt Sấy Thông Minh"
              : "Ứng Dụng Đối Tác Tài Xế Giao Nhận"}
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-tight">
          {isCustomer ? "Giặt Là Sạch Sẽ" : "Sạch Sẽ Tài Xế"}
        </h1>
        <p className="text-xs text-white/80 mt-2 leading-relaxed">
          {isCustomer
            ? "Định vị tiệm giặt GPS · Đặt lịch thu gom tận nhà · Duyệt cân thực tế minh bạch tại Hà Nội"
            : "Sàn nhận chuyến Radar GPS · Điều hướng Google Maps · Ví thu nhập tự động 80%"}
        </p>
      </div>

      {/* Bottom Progress & Redirect Status */}
      <div className="w-full max-w-xs space-y-3 pb-6">
        <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-white/85 font-bold">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isLoggedIn
              ? "Đã nhận diện phiên đăng nhập, đang vào Trang chủ..."
              : "Đang khởi động màn hình Đăng nhập..."}
          </span>
          <span className="font-mono">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
