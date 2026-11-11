import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Smartphone,
  ArrowLeft,
  Camera,
  Scale,
  CheckCircle2,
  Bike,
  MapPin,
  Layers,
  Sparkles,
  Plus,
  QrCode,
} from "lucide-react";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";

export const StoreOwnerMobilePlan: React.FC = () => {
  const navigate = useNavigate();
  const [activeAppTab, setActiveAppTab] = useState<"customer" | "driver">(
    "customer"
  );
  const [customerSimStep, setCustomerSimStep] = useState<1 | 2 | 3>(1);
  const [driverSimStep, setDriverSimStep] = useState<1 | 2 | 3>(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-600 font-bold">
            <Smartphone className="w-4 h-4" />
            <span>Kế Hoạch Phát Triển & Kiến Trúc Mobile App (Customer App & Driver App)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            Quy Hoạch Mobile App Người Dùng & Tài Xế
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tái sử dụng 100% REST API hiện tại (`/api/laundry-orders`, `/api/delivery`, `/api/ai`, `/api/payments`) và hệ thống Types/Hooks.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ButtonCustom
            onClick={() => navigate("/mobile-customer/home")}
            label="Mở App Khách Hàng (Mobile)"
            className="!w-auto !h-10 !px-4 whitespace-nowrap shrink-0"
            textClassName="!text-xs"
          />
          <ButtonCustom
            onClick={() => navigate("/mobile-driver/radar")}
            label="Mở App Tài Xế / Shipper (Mobile)"
            className="!w-auto !h-10 !px-4 !bg-emerald-600 hover:!bg-emerald-700 whitespace-nowrap shrink-0"
            textClassName="!text-xs"
          />
          <ButtonOutLine
            onClick={() => navigate("/store-owner/dashboard")}
            iconStart={<ArrowLeft className="w-4 h-4" />}
            label="Tổng Quan Tiệm"
            className="!w-auto !h-10 !px-4 whitespace-nowrap shrink-0"
            textClassName="!text-xs"
          />
        </div>
      </div>

      {/* Interactive Switcher: Customer App Plan vs Driver App Plan */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveAppTab("customer")}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeAppTab === "customer"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          1. Mobile App Khách Hàng (Customer App)
        </button>
        <button
          type="button"
          onClick={() => setActiveAppTab("driver")}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeAppTab === "driver"
              ? "bg-white text-emerald-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          2. Mobile App Tài Xế (Driver / Shipper App)
        </button>
      </div>

      {/* Main Split: Detailed Architecture Plan (Left 7 cols) + Interactive Mobile Simulator (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Screen Breakdown, Folder Structure, & API Mapping */}
        <div className="lg:col-span-7 space-y-6">
          {activeAppTab === "customer" ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">
                  Kiến Trúc & Lộ Trình Code: Mobile App Khách Hàng
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Thiết kế chuẩn theo Sequence Diagram Đặt đơn (Hỗ trợ thêm nhiều dòng đồ + AI Vision tự chọn + Xác nhận cân thực tế)
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 text-sm">
                    Cấu trúc thư mục phân tách theo nhóm Vai trò (`src/pages/MobileCustomer/`)
                  </h4>
                  <pre className="font-mono text-[11px] text-slate-700 bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto leading-relaxed">
{`src/pages/MobileCustomer/
├── HomeMap/          (index.tsx, hook.ts, components/NearbyStoreCard.tsx)
├── CreateOrder/      (index.tsx, hook.ts, components/OrderLineItemCard.tsx, AiFabricScannerModal.tsx)
├── WeightConfirm/    (index.tsx, hook.ts, components/WeightComparisonCard.tsx)
├── OrderTracking/    (index.tsx, hook.ts, components/VietQrSheetModal.tsx)
└── index.ts`}
                  </pre>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm">
                    Chi tiết 4 Màn Hình Cốt Lõi & Tích Hợp API
                  </h4>

                  <div className="p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="font-black text-blue-600">
                      Màn hình 1: Tìm Cửa Hàng Gần Nhất & Chọn Dịch Vụ (`HomeMap`)
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      • Định vị GPS người dùng, gọi `GET /api/stores/nearby` hiển thị các tiệm giặt đang `open` trong bán kính 3km.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      • Hiển thị bảng giá `GET /api/services` theo kg (`per_kg`) và theo món (`per_item`).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="font-black text-blue-600">
                      Màn hình 2: Tạo Đơn Giặt Đa Dòng Đồ & Quét AI (`OrderCreate`)
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      • <strong>Loop [Thêm từng dòng đồ giặt]</strong>: Khách nhấn &quot;+ Thêm dòng đồ&quot; cho từng nhóm vải (`Cotton`, `Đồ trắng`, `Lụa`, `Chăn mền`).
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      • <strong>Opt [Sử dụng AI Kiểm tra món đồ / tem mác]</strong>: Khách chụp ảnh món đồ khó phân loại hoặc tem mác $\rightarrow$ Gọi `POST /api/ai/inspect-garment` $\rightarrow$ AI tự động điền `fabricType`, gói giặt khuyến nghị & `careInstructions`.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      • Chọn khung giờ lấy/trả đồ, áp mã `promoCode` và gọi `POST /api/laundry-orders`.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="font-black text-blue-600">
                      Màn hình 3: Duyệt Khối Lượng Thực Tế (`WeightApproval`)
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      • Khi Chủ cửa hàng cân đồ xong (`weightConfirmStatus = &apos;waiting_customer&apos;`), App nhận thông báo hiển thị bảng so sánh: <strong>Tạm tính vs. Thực tế từng dòng đồ</strong>.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      • Khách bấm <strong>&quot;Đồng ý giá thực tế&quot;</strong> (`PATCH /api/laundry-orders/:id/status` với `weightConfirmStatus: &apos;accepted&apos;`) hoặc yêu cầu hoàn trả đồ.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="font-black text-blue-600">
                      Màn hình 4: Theo Dõi Tiến Độ & Thanh Toán VietQR (`OrderTracking`)
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      • Theo dõi tiến độ lồng giặt (`sorting` $\rightarrow$ `washing` $\rightarrow$ `ironing` $\rightarrow$ `delivering`) và quét mã QR thanh toán qua `POST /api/payments/create-payos-link`.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">
                  Kiến Trúc & Lộ Trình Code: Mobile App Tài Xế (Driver App)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tối ưu thao tác một chạm trên đường: Nhận chuyến phát sóng · Điều hướng bản đồ · Bàn giao giỏ đồ cho tiệm & khách
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 text-sm">
                    Cấu trúc thư mục phân tách theo nhóm Vai trò (`src/pages/MobileDriver/`)
                  </h4>
                  <pre className="font-mono text-[11px] text-slate-700 bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto leading-relaxed">
{`src/pages/MobileDriver/
├── BroadcastRadar/   (index.tsx, hook.ts, components/BroadcastTaskCard.tsx)
├── ActiveTask/       (index.tsx, hook.ts, components/DriverStepControl.tsx)
├── DriverWallet/     (index.tsx, hook.ts)
└── index.ts`}
                  </pre>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm">
                    Chi tiết 4 Màn Hình Cốt Lõi & Tích Hợp API
                  </h4>

                  <div className="p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="font-black text-emerald-600">
                      Màn hình 1: Sàn Nhận Chuyến Phát Sóng (`RadarBroadcast`)
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      • Bật trạng thái trực tuyến (`isAvailable: true`), cập nhật GPS qua `POST /api/delivery/update-location`.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      • Lấy danh sách chuyến đang `broadcasting` từ `GET /api/delivery/available-tasks` (gồm cả chiều đi lấy đồ bẩn `pickup_from_customer` và chiều đi giao đồ sạch `deliver_to_customer`).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="font-black text-emerald-600">
                      Màn hình 2: Nhận Đơn & Điều Hướng Điểm Lấy/Giao (`ActiveDelivery`)
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      • Tài xế nhấn <strong>&quot;Nhận chuyến&quot;</strong> $\rightarrow$ Gọi `POST /api/delivery/accept-task`, khóa chuyến cho tài xế và hiển thị lộ trình Leaflet Map từ vị trí hiện tại tới nhà khách hoặc tiệm giặt.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="font-black text-emerald-600">
                      Màn hình 3: Cập Nhật Trạng Thái & Bàn Giao Giỏ Đồ (`HandoverConfirm`)
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      • Chuyển trạng thái tuần tự qua `PATCH /api/delivery/task-status`: `arrived_pickup` (Đã tới nhà khách) $\rightarrow$ `picked_up` (Đã nhận giỏ đồ) $\rightarrow$ `in_transit` (Đang mang về tiệm) $\rightarrow$ `completed` (Đã bàn giao cho Chủ cửa hàng cân đo).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="font-black text-emerald-600">
                      Màn hình 4: Ví Thu Nhập & Lịch Sử Chuyến (`EarningsWallet`)
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      • Thống kê tổng phí giao nhận (`shippingFee` + `tipAmount`) trong ngày/tuần qua `GET /api/delivery/my-tasks`.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Interactive Mobile Screen Prototype */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Mô Phỏng Tương Tác Giao Diện Mobile
              </h3>
              <p className="text-xs text-slate-500">
                Bấm chuyển từng bước để kiểm thử UX trước khi đóng gói Mobile
              </p>
            </div>
            <Layers className="w-5 h-5 text-slate-400" />
          </div>

          {activeAppTab === "customer" ? (
            <div className="space-y-4">
              {/* Step selector */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCustomerSimStep(1)}
                  className={`py-2 rounded-lg cursor-pointer ${
                    customerSimStep === 1
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  B1: Thêm Dòng Đồ
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerSimStep(2)}
                  className={`py-2 rounded-lg cursor-pointer ${
                    customerSimStep === 2
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  B2: Duyệt Cân Tiệm
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerSimStep(3)}
                  className={`py-2 rounded-lg cursor-pointer ${
                    customerSimStep === 3
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  B3: VietQR & Ship
                </button>
              </div>

              {/* Mobile Viewport Card */}
              <div className="rounded-3xl border-2 border-slate-800 bg-slate-50 p-4 space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-200 pb-2">
                  <span>ProLaundry Customer App</span>
                  <span className="font-mono">9:41 AM · 5G</span>
                </div>

                {customerSimStep === 1 && (
                  <div className="space-y-3 text-xs">
                    <div className="font-black text-slate-900 text-sm">
                      Tạo Đơn Giặt (Hỗ trợ nhiều dòng đồ)
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Dòng #1: Giặt Sấy Thường</span>
                        <span className="font-mono text-blue-600">
                          ~3.0 kg · 60.000đ
                        </span>
                      </div>
                      <div className="text-slate-500">
                        Loại vải: Cotton / Đồ mặc hàng ngày
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-indigo-200 space-y-2">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Dòng #2: Giặt Khô Cao Cấp</span>
                        <span className="font-mono text-blue-600">
                          1 cái · 70.000đ
                        </span>
                      </div>
                      <div className="text-indigo-600 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          Đã dùng AI quét tem áo: Lụa 100% (Giặt khô)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm dòng đồ
                      </button>
                      <button
                        type="button"
                        className="py-2.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200 font-bold text-indigo-700 flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" /> Quét AI món đồ
                      </button>
                    </div>

                    <ButtonCustom
                      onClick={() => setCustomerSimStep(2)}
                      label="Đặt Lịch Thu Gom (Tạm tính: 150.000đ)"
                      className="!h-10 !text-xs"
                      textClassName="!text-xs"
                    />
                  </div>
                )}

                {customerSimStep === 2 && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-600 font-black">
                      <Scale className="w-4 h-4" />
                      <span>Tiệm Đã Cân Thực Tế — Chờ Bạn Xác Nhận</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dòng #1 (Cotton):</span>
                        <span className="font-mono font-bold">
                          Tạm 3.0kg → Thực tế 3.5kg (70.000đ)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dòng #2 (Lụa):</span>
                        <span className="font-mono font-bold">
                          1 cái → Thực tế 1 cái (70.000đ)
                        </span>
                      </div>
                      <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-slate-900">
                        <span>Tổng thanh toán sau cân (+Ship 20k):</span>
                        <span className="font-mono text-blue-600">160.000đ</span>
                      </div>
                    </div>

                    <ButtonCustom
                      onClick={() => setCustomerSimStep(3)}
                      iconStart={<CheckCircle2 className="w-4 h-4" />}
                      label="Đồng Ý Cân Nặng Thực Tế & Giặt Ngay"
                      className="!h-10 !text-xs"
                      textClassName="!text-xs"
                    />
                  </div>
                )}

                {customerSimStep === 3 && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-black">
                      <QrCode className="w-4 h-4" />
                      <span>Đang Giặt Sấy · Thanh Toán VietQR</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                      <div className="w-28 h-28 mx-auto rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-slate-700" />
                      </div>
                      <p className="font-mono font-black text-slate-900">
                        160.000 VNĐ · Nội dung: ORD-8821
                      </p>
                      <p className="text-slate-500">
                        Tài xế Nguyễn Văn Hùng sẽ giao đồ sạch lúc 16:00 - 18:00
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Driver Step selector */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDriverSimStep(1)}
                  className={`py-2 rounded-lg cursor-pointer ${
                    driverSimStep === 1
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  B1: Nổ Đơn Mới
                </button>
                <button
                  type="button"
                  onClick={() => setDriverSimStep(2)}
                  className={`py-2 rounded-lg cursor-pointer ${
                    driverSimStep === 2
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  B2: Lấy Giỏ Đồ
                </button>
                <button
                  type="button"
                  onClick={() => setDriverSimStep(3)}
                  className={`py-2 rounded-lg cursor-pointer ${
                    driverSimStep === 3
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  B3: Giao Về Tiệm
                </button>
              </div>

              <div className="rounded-3xl border-2 border-slate-800 bg-slate-50 p-4 space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-200 pb-2">
                  <span>ProLaundry Driver App</span>
                  <span className="text-emerald-600">Trực tuyến · GPS Bật</span>
                </div>

                {driverSimStep === 1 && (
                  <div className="space-y-3 text-xs">
                    <div className="font-black text-slate-900 text-sm">
                      Chuyến Mới Gần Bạn (Cách 1.2 km)
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Lấy đồ bẩn: #ORD-8821</span>
                        <span className="font-mono text-emerald-600">
                          +25.000đ
                        </span>
                      </div>
                      <div className="text-slate-600 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>
                          Lấy tại: 45 Lê Thánh Tôn, Quận 1 → Giao về: Tiệm Giặt Q1 (185 Nguyễn Trãi)
                        </span>
                      </div>
                    </div>
                    <ButtonCustom
                      onClick={() => setDriverSimStep(2)}
                      label="Nhận Chuyến Ngay (Accept Task)"
                      className="!h-10 !text-xs"
                      textClassName="!text-xs"
                    />
                  </div>
                )}

                {driverSimStep === 2 && (
                  <div className="space-y-3 text-xs">
                    <div className="font-black text-blue-600 flex items-center gap-1.5">
                      <Bike className="w-4 h-4" />
                      <span>Đã Tới Điểm Lấy Hàng (45 Lê Thánh Tôn)</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900">
                        Khách hàng: Nguyễn Minh Tâm (0908 112 233)
                      </div>
                      <p className="text-slate-500">
                        Kiểm tra giỏ đồ niêm phong gồm 2 túi phân loại trước khi nhận.
                      </p>
                    </div>
                    <ButtonCustom
                      onClick={() => setDriverSimStep(3)}
                      label="Xác Nhận Đã Nhận Giỏ Đồ (Picked Up)"
                      className="!h-10 !text-xs"
                      textClassName="!text-xs"
                    />
                  </div>
                )}

                {driverSimStep === 3 && (
                  <div className="space-y-3 text-xs">
                    <div className="font-black text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Bàn Giao Cho Chủ Tiệm Cân Thực Tế</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                      <p className="text-slate-700 font-semibold">
                        Đã bàn giao giỏ đồ #ORD-8821 tại Tiệm Giặt Sấy Vô Trùng Q1.
                      </p>
                      <p className="text-slate-500">
                        Đơn hàng tự động chuyển sang màn hình &quot;Đơn Giặt & Cân Đo&quot; trên Web của Chủ cửa hàng.
                      </p>
                    </div>
                    <ButtonOutLine
                      onClick={() => navigate("/store-owner/orders")}
                      label="Mở Màn Hình Cân Đo Của Chủ Tiệm →"
                      className="!h-10 !text-xs"
                      textClassName="!text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
