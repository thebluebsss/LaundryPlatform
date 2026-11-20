import React, { useEffect, useRef, useState } from "react";
import { Droplets, Bike, ShieldCheck } from "lucide-react";

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
  durationMs = 900,
}) => {
  const [progress, setProgress] = useState(15);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    setProgress(15);
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
    }, 40);

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
      {/* Top Location Label */}
      <div className="pt-6 flex items-center gap-2 opacity-90">
        <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold">
          {isCustomer ? "Giặt Là Sạch Sẽ · Hà Nội" : "Đối tác Tài xế · Hà Nội"}
        </span>
      </div>

      {/* Center App Logo */}
      <div className="flex flex-col items-center text-center max-w-xs">
        <div className="relative mb-6">
          <div className="absolute -inset-3 rounded-full bg-white/15 blur-xl" />
          <div className="relative w-24 h-24 rounded-3xl bg-white text-slate-900 shadow-2xl flex items-center justify-center border-4 border-white/30">
            {isCustomer ? (
              <Droplets className="w-12 h-12 text-blue-600" />
            ) : (
              <Bike className="w-12 h-12 text-emerald-600" />
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          {isCustomer ? "Giặt Là Sạch Sẽ" : "Sạch Sẽ Tài Xế"}
        </h1>
        <p className="text-xs text-white/80 mt-2.5 leading-relaxed">
          {isCustomer
            ? "Tìm tiệm gần nhà · Giao nhận tận cửa · Cân đo minh bạch"
            : "Nhận chuyến quanh bạn · Theo dõi lộ trình · Cộng cước trực tiếp vào ví"}
        </p>
      </div>

      {/* Bottom Progress */}
      <div className="w-full max-w-xs space-y-2.5 pb-6">
        <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-center text-xs text-white/85 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isLoggedIn ? "Chào mừng bạn quay lại..." : "Đang mở ứng dụng..."}
          </span>
        </div>
      </div>
    </div>
  );
};
