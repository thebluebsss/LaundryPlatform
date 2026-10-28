import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Download,
  Check,
  X,
  Shield,
  Cpu,
  ExternalLink,
  Sparkles,
  QrCode,
  Copy,
  Bike,
  AlertTriangle,
  Share2,
  Droplets,
  PackageCheck,
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
  const [activeTab, setActiveTab] = useState<
    "two-apps" | "stores" | "pwa" | "electron"
  >("two-apps");
  const [urlMode, setUrlMode] = useState<"dev" | "public">("dev");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [manualInstallHint, setManualInstallHint] = useState(false);

  const rawOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const devOrigin = rawOrigin.replace("https://ais-pre-", "https://ais-dev-");
  const publicOrigin = rawOrigin.replace(
    "https://ais-dev-",
    "https://ais-pre-",
  );

  const activeOrigin = urlMode === "dev" ? devOrigin : publicOrigin;

  // Use ?standalone=customer and ?standalone=driver so each QR / Store package launches as a 100% isolated standalone app
  const customerStandaloneUrl = `${activeOrigin}/?standalone=customer#/mobile-customer/home`;
  const driverStandaloneUrl = `${activeOrigin}/?standalone=driver#/mobile-driver/radar`;

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

  const launchStandaloneInCurrentTab = (role: "customer" | "driver") => {
    sessionStorage.setItem("sachse_standalone_app", role);
    onClose();
    if (role === "customer") {
      window.location.hash = "#/mobile-customer/home";
      window.location.reload();
    } else {
      window.location.hash = "#/mobile-driver/radar";
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden relative my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 inline-block mb-1">
                Kiến Trúc 2 Ứng Dụng Độc Lập (App Store & CH Play)
              </span>
              <h3 className="text-xl font-black text-white">
                App Khách Hàng Riêng & App Tài Xế Riêng
              </h3>
            </div>
          </div>
          <p className="text-blue-50 text-xs sm:text-sm mt-1 leading-relaxed">
            Hệ thống đã được tách thành{" "}
            <strong>2 gói ứng dụng hoàn toàn độc lập</strong> với mã định danh
            (Bundle ID / Package Name), Manifest và cấu hình Capacitor riêng để
            đưa lên <strong>Apple App Store</strong> và{" "}
            <strong>Google Play (CH Play)</strong>.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("two-apps")}
            className={`flex-1 min-w-[155px] py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "two-apps"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <QrCode className="w-4 h-4" />
            1. 2 App Riêng (QR & Demo)
          </button>
          <button
            onClick={() => setActiveTab("stores")}
            className={`flex-1 min-w-[165px] py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "stores"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            2. Xuất APK / AAB (CH Play & iOS)
          </button>
          <button
            onClick={() => setActiveTab("pwa")}
            className={`flex-1 min-w-[140px] py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "pwa"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            3. Cài Ra Màn Hình ĐT
          </button>
          <button
            onClick={() => setActiveTab("electron")}
            className={`flex-1 min-w-[125px] py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "electron"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Cpu className="w-4 h-4" />
            4. Desktop App
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {activeTab === "two-apps" ? (
            <div className="space-y-4">
              {/* Two Independent Store Apps Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* APP 1: CUSTOMER APP */}
                <div className="border-2 border-blue-200 bg-gradient-to-b from-blue-50/70 to-white rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                          <Droplets className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            APP 1 · DÀNH CHO KHÁCH HÀNG
                          </span>
                          <h4 className="text-base font-black text-slate-900 mt-0.5">
                            Sạch Sẽ — Đặt Giặt Sấy
                          </h4>
                          <p className="text-[11px] font-mono text-slate-500">
                            Package ID: <strong>vn.sachse.customer</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                        App Store (iOS)
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-700 text-white px-2.5 py-1 rounded-lg">
                        Google Play / CH Play
                      </span>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg">
                        Ẩn 100% Web & Tài Xế
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      Khách hàng tải về chỉ thấy duy nhất 4 màn hình đặt giặt:
                      Tìm tiệm quanh đây, Tạo đơn & AI nhận diện vải, Xác nhận
                      cân nặng thực tế và Thanh toán VietQR.
                    </p>

                    <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 mb-3 flex flex-col items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(
                          customerStandaloneUrl,
                        )}`}
                        alt="QR App Khách Hàng Độc Lập"
                        className="w-32 h-32 object-contain"
                      />
                      <span className="text-[10px] font-bold text-blue-600 mt-1">
                        Quét mở App Khách Hàng Độc Lập
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => launchStandaloneInCurrentTab("customer")}
                      className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      Mở Chế Độ App Khách Hàng Độc Lập
                    </button>

                    <div className="w-full flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={customerStandaloneUrl}
                        className="flex-1 text-[10px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600 font-mono truncate"
                      />
                      <button
                        onClick={() =>
                          handleCopy(customerStandaloneUrl, "customer")
                        }
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKey === "customer" ? (
                          <>
                            <Check className="w-3 h-3" /> Đã chép
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* APP 2: DRIVER APP */}
                <div className="border-2 border-emerald-200 bg-gradient-to-b from-emerald-50/70 to-white rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                          <Bike className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            APP 2 · DÀNH CHO TÀI XẾ / SHIPPER
                          </span>
                          <h4 className="text-base font-black text-slate-900 mt-0.5">
                            Sạch Sẽ Tài Xế (Driver)
                          </h4>
                          <p className="text-[11px] font-mono text-slate-500">
                            Package ID: <strong>vn.sachse.driver</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                        App Store (iOS)
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-700 text-white px-2.5 py-1 rounded-lg">
                        Google Play / CH Play
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg">
                        Ẩn 100% Web & Khách
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      Tài xế tải về chỉ thấy duy nhất 3 màn hình giao nhận: Sàn
                      Radar nhận cuốc 2 chiều (Lấy đồ bẩn / Giao đồ sạch),
                      Chuyến đang giao (chụp POD) và Ví thu nhập.
                    </p>

                    <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 mb-3 flex flex-col items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(
                          driverStandaloneUrl,
                        )}`}
                        alt="QR App Tài Xế Độc Lập"
                        className="w-32 h-32 object-contain"
                      />
                      <span className="text-[10px] font-bold text-emerald-600 mt-1">
                        Quét mở App Tài Xế Độc Lập
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => launchStandaloneInCurrentTab("driver")}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Bike className="w-4 h-4" />
                      Mở Chế Độ App Tài Xế Độc Lập
                    </button>

                    <div className="w-full flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={driverStandaloneUrl}
                        className="flex-1 text-[10px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600 font-mono truncate"
                      />
                      <button
                        onClick={() =>
                          handleCopy(driverStandaloneUrl, "driver")
                        }
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKey === "driver" ? (
                          <>
                            <Check className="w-3 h-3" /> Đã chép
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Link Mode Switcher (ais-dev vs ais-pre) */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 space-y-2">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Lưu ý khi quét QR bằng điện thoại để không bị lỗi "Page not
                  found":
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  • Nếu dùng <strong>Link Dev (ais-dev)</strong>: Hãy mở bằng{" "}
                  <strong>Chrome / Safari</strong> đã đăng nhập Google (không
                  quét bằng trình duyệt ẩn trong Zalo).
                  <br />• Nếu muốn quét trên{" "}
                  <strong>bất kỳ điện thoại nào không cần đăng nhập</strong>:
                  Hãy bấm nút{" "}
                  <strong className="inline-flex items-center gap-0.5 text-blue-700">
                    <Share2 className="w-3 h-3 inline" /> Share
                  </strong>{" "}
                  ở góc trên bên phải AI Studio để bật Public, rồi chọn nút{" "}
                  <strong>Link Public (ais-pre)</strong> bên dưới.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setUrlMode("dev")}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                      urlMode === "dev"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    1. Link Dev Trực Tiếp (ais-dev)
                  </button>
                  <button
                    onClick={() => setUrlMode("public")}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                      urlMode === "public"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    2. Link Public (ais-pre — Sau khi bật Share)
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === "stores" ? (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4">
                <h4 className="font-black text-indigo-950 text-sm mb-1 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-indigo-600" />
                  Đóng Gói 2 App Riêng Biệt Lên Google Play (CH Play) & Apple
                  App Store
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Dự án đã được cấu hình sẵn 2 file{" "}
                  <code className="font-bold text-indigo-700">
                    capacitor.customer.config.ts
                  </code>{" "}
                  và{" "}
                  <code className="font-bold text-emerald-700">
                    capacitor.driver.config.ts
                  </code>{" "}
                  cùng 2 lệnh build độc lập trong{" "}
                  <code className="font-bold">package.json</code>. Khi build,
                  mỗi App sẽ khoá cứng vào đúng giao diện của vai trò đó!
                </p>
              </div>

              {/* Build Package 1: Customer App */}
              <div className="p-4 bg-white border-2 border-blue-100 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-black text-blue-950 text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    Build Gói App 1: "Sạch Sẽ - Giặt Sấy" (Khách Hàng)
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                    App ID: vn.sachse.customer
                  </span>
                </div>
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] space-y-1.5 overflow-x-auto">
                  <div className="text-slate-400">
                    # Bước 1: Build bản độc lập dành riêng cho Khách Hàng (ra
                    thư mục dist-customer)
                  </div>
                  <div className="text-emerald-400 font-bold">
                    npm run build:app-customer
                  </div>
                  <div className="text-slate-400 pt-1">
                    # Bước 2: Đồng bộ sang Android Studio (xuất .AAB/.APK lên CH
                    Play) & Xcode (xuất .IPA lên App Store)
                  </div>
                  <div className="text-cyan-300">
                    npx cap copy --config capacitor.customer.config.ts
                  </div>
                  <div className="text-amber-300">
                    npx cap open android --config capacitor.customer.config.ts
                  </div>
                  <div className="text-amber-300">
                    npx cap open ios --config capacitor.customer.config.ts
                  </div>
                </div>
              </div>

              {/* Build Package 2: Driver App */}
              <div className="p-4 bg-white border-2 border-emerald-100 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-black text-emerald-950 text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Build Gói App 2: "Sạch Sẽ Tài Xế" (Shipper / Driver)
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
                    App ID: vn.sachse.driver
                  </span>
                </div>
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] space-y-1.5 overflow-x-auto">
                  <div className="text-slate-400">
                    # Bước 1: Build bản độc lập dành riêng cho Tài Xế (ra thư
                    mục dist-driver)
                  </div>
                  <div className="text-emerald-400 font-bold">
                    npm run build:app-driver
                  </div>
                  <div className="text-slate-400 pt-1">
                    # Bước 2: Đồng bộ sang Android Studio (xuất .AAB/.APK lên CH
                    Play) & Xcode (xuất .IPA lên App Store)
                  </div>
                  <div className="text-cyan-300">
                    npx cap copy --config capacitor.driver.config.ts
                  </div>
                  <div className="text-amber-300">
                    npx cap open android --config capacitor.driver.config.ts
                  </div>
                  <div className="text-amber-300">
                    npx cap open ios --config capacitor.driver.config.ts
                  </div>
                </div>
              </div>

              {/* Fast Cloud APK Export via PWABuilder */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-xs sm:text-sm">
                    Cách Nhanh Không Cần Cài Android Studio: Xuất 2 file .APK
                    qua PWABuilder
                  </span>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200"
                  >
                    Mở PWABuilder <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vì hệ thống đã có 2 file Manifest riêng (
                  <code>/manifest-customer.json</code> và{" "}
                  <code>/manifest-driver.json</code>), bạn chỉ cần dán lần lượt
                  2 link{" "}
                  <code className="bg-white px-1 py-0.5 rounded border text-blue-700">
                    {publicOrigin}/?standalone=customer
                  </code>{" "}
                  và{" "}
                  <code className="bg-white px-1 py-0.5 rounded border text-emerald-700">
                    {publicOrigin}/?standalone=driver
                  </code>{" "}
                  vào PWABuilder để tải về 2 file <strong>.APK / .AAB</strong>{" "}
                  hoàn toàn tách biệt!
                </p>
              </div>
            </div>
          ) : activeTab === "pwa" ? (
            <div className="space-y-5">
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <p className="font-bold text-sm text-blue-950 mb-1">
                    Cài 2 Biểu Tượng App Riêng Ra Màn Hình Chính Điện Thoại
                  </p>
                  Khi bạn mở link <strong>App Khách Hàng</strong> (
                  <code>?standalone=customer</code>), điện thoại sẽ tự nạp{" "}
                  <code>manifest-customer.json</code> với tên{" "}
                  <strong>"Sạch Sẽ"</strong>. Khi mở link{" "}
                  <strong>App Tài Xế</strong> (<code>?standalone=driver</code>),
                  điện thoại sẽ tự nạp <code>manifest-driver.json</code> với tên{" "}
                  <strong>"Sạch Sẽ Tài Xế"</strong>.
                </div>
              </div>

              {/* Install Button Callout */}
              <div className="text-center py-1">
                {isInstalled ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 font-bold flex items-center justify-center gap-2 text-sm">
                    <Check className="w-5 h-5 text-emerald-600" />
                    Ứng dụng đã được cài đặt trên thiết bị của bạn!
                  </div>
                ) : (
                  <button
                    onClick={handleInstallPWA}
                    className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    Cài Đặt App Hiện Tại Vào Máy (1-Click)
                  </button>
                )}
                {manualInstallHint && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-left">
                    Trình duyệt hiện tại yêu cầu cài thủ công: Nhấn vào biểu
                    tượng <strong>Cài đặt (⬇)</strong> trên thanh địa chỉ hoặc
                    mở{" "}
                    <strong>
                      Menu (⋮ / Chia sẻ) → Thêm vào màn hình chính
                    </strong>
                    .
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <Smartphone className="w-4 h-4 text-blue-600" /> iPhone /
                    iPad (Safari)
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    1. Quét mã QR của App Khách Hàng hoặc App Tài Xế bằng{" "}
                    <strong>Safari</strong>.<br />
                    2. Bấm nút <strong>Chia sẻ (Share)</strong> ở dưới cùng.
                    <br />
                    3. Chọn{" "}
                    <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" /> Android
                    (Chrome)
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    1. Quét mã QR của App Khách Hàng hoặc App Tài Xế bằng{" "}
                    <strong>Chrome</strong>.<br />
                    2. Bấm biểu tượng <strong>Menu (⋮)</strong> góc trên bên
                    phải.<br />
                    3. Chọn{" "}
                    <strong>
                      "Cài đặt ứng dụng" (Install App / Add to Home screen)
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900">
                <p className="font-bold mb-1">
                  Dành cho Chủ Cửa Hàng / Thu Ngân: Phần mềm Desktop (.EXE)
                </p>
                Dự án tích hợp sẵn <strong>Electron.js</strong> để đóng gói phân
                hệ Web Chủ Cửa Hàng thành phần mềm chạy trên Windows (.exe) hoặc
                macOS (.dmg).
              </div>

              <div className="space-y-3 bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto">
                <div className="text-slate-400 text-[11px]">
                  // 1. Tải Mã Nguồn về máy:
                </div>
                <div className="text-emerald-400">
                  Export ZIP / Github từ Menu góc phải màn hình
                </div>

                <div className="text-slate-400 text-[11px] mt-2">
                  // 2. Mở terminal tại thư mục dự án và cài thư viện:
                </div>
                <div className="text-amber-300">npm install</div>

                <div className="text-slate-400 text-[11px] mt-2">
                  // 3. Chạy ứng dụng dưới dạng Desktop App bằng Electron:
                </div>
                <div className="text-cyan-300">npm run electron:start</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>
              2 App Độc Lập (`vn.sachse.customer` & `vn.sachse.driver`) đồng bộ
              thời gian thực
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
