import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Smartphone,
  Download,
  Check,
  X,
  Shield,
  QrCode,
  Copy,
  Bike,
  Droplets,
  ExternalLink,
} from "lucide-react";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<"qr" | "guide">("qr");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [manualInstallHint, setManualInstallHint] = useState(false);

  const activeOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  const customerAppUrl = `${activeOrigin}/?standalone=customer#/mobile-customer/home`;
  const driverAppUrl = `${activeOrigin}/?standalone=driver#/mobile-driver/radar`;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setManualInstallHint(true);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openAppInCurrentTab = (role: "customer" | "driver") => {
    sessionStorage.setItem("sachse_standalone_app", role);
    onClose();
    if (role === "customer") {
      window.location.hash = "#/mobile-customer/home";
    } else {
      window.location.hash = "#/mobile-driver/radar";
    }
    window.location.reload();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="absolute top-4 right-4 text-white/75 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Tải ứng dụng Giặt Là Sạch Sẽ
              </h3>
              <p className="text-slate-300 text-xs mt-0.5">
                Quét mã QR bằng điện thoại để mở nhanh hoặc lưu ra màn hình chính
              </p>
            </div>
          </div>
        </div>

        {/* Clean 2-tab switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "qr"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Quét mã QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "guide"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Cài ra màn hình chính</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {activeTab === "qr" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer App Card */}
              <div className="border border-slate-200 bg-slate-50/60 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Sạch Sẽ — Khách hàng
                      </h4>
                      <p className="text-xs text-slate-500">
                        Đặt giặt, duyệt cân & theo dõi đơn
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col items-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(
                        customerAppUrl,
                      )}`}
                      alt="Mã QR ứng dụng khách hàng Sạch Sẽ"
                      className="w-36 h-36 object-contain"
                    />
                    <span className="text-[11px] font-medium text-slate-500 mt-1.5">
                      Quét bằng camera điện thoại
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAppInCurrentTab("customer")}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở ngay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(customerAppUrl, "customer")}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedKey === "customer" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Chép link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Driver App Card */}
              <div className="border border-slate-200 bg-slate-50/60 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Sạch Sẽ — Tài xế
                      </h4>
                      <p className="text-xs text-slate-500">
                        Nhận chuyến giao nhận & xem ví thu nhập
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col items-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(
                        driverAppUrl,
                      )}`}
                      alt="Mã QR ứng dụng tài xế Sạch Sẽ"
                      className="w-36 h-36 object-contain"
                    />
                    <span className="text-[11px] font-medium text-slate-500 mt-1.5">
                      Dành cho đối tác tài xế Sạch Sẽ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAppInCurrentTab("driver")}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở ngay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(driverAppUrl, "driver")}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedKey === "driver" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Chép link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                {isInstalled ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 font-semibold flex items-center justify-center gap-2 text-sm">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span>Ứng dụng đã được cài trên thiết bị này</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleInstallPWA}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Cài ứng dụng vào thiết bị này</span>
                  </button>
                )}
                {manualInstallHint && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-left">
                    Trình duyệt hiện tại cần cài thủ công: chọn biểu tượng{" "}
                    <strong>Chia sẻ</strong> (Safari) hoặc{" "}
                    <strong>Menu (⋮)</strong> (Chrome) rồi bấm{" "}
                    <strong>Thêm vào màn hình chính</strong>.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>Trên iPhone / iPad (Safari)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    1. Quét mã QR và mở bằng trình duyệt <strong>Safari</strong>.
                    <br />
                    2. Chạm nút <strong>Chia sẻ</strong> ở thanh dưới cùng.
                    <br />
                    3. Chọn <strong>Thêm vào màn hình chính</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Trên Android (Chrome)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    1. Quét mã QR và mở bằng trình duyệt <strong>Chrome</strong>.
                    <br />
                    2. Chạm biểu tượng <strong>Menu (⋮)</strong> ở góc trên phải.
                    <br />
                    3. Chọn <strong>Cài đặt ứng dụng</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mở nhanh như ứng dụng gốc, không tốn bộ nhớ máy</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
