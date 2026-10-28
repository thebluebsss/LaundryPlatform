import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Scale,
  WashingMachine,
  Truck,
  Settings,
  Smartphone,
  RefreshCw,
  MapPin,
  Phone,
  Clock,
  Star,
  Bike,
  MessageSquareReply,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useStoreOwnerDashboard } from "./hook";
import { StoreKpis } from "./components/StoreKpis";
import { WeighingQueueWidget } from "./components/WeighingQueueWidget";
import { InputSelect } from "../../../components/InputSelect";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";

export const StoreOwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    currentStore,
    orders,
    equipmentList,
    deliveryTasks,
    storeReviews,
    loading,
    totalBranchRevenue,
    pendingWeighOrders,
    waitingCustomerConfirmOrders,
    activeWashingOrders,
    workingMachinesCount,
    weeklyChartData,
    fetchDashboardData,
    handleUpdateStoreStatus,
    handleReplyReview,
  } = useStoreOwnerDashboard();

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const storeOptions = stores.map((s) => ({
    value: s.id,
    label: `${s.code} - ${s.name}`,
    extra: `(${s.district})`,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Branch Selector & Operational Status Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Store className="w-4 h-4 text-blue-600" />
            <span>Không gian làm việc Chủ Cửa Hàng (Store Manager Portal)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-bold text-slate-700">
              {currentStore?.code}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {currentStore?.name || "Tiệm Giặt Sấy Vô Trùng Q1"}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {currentStore?.address}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {currentStore?.phone}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {currentStore?.openHours}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 min-w-[320px]">
          <div className="flex-1 min-w-[220px]">
            <InputSelect
              title="Chi nhánh đang quản lý"
              value={selectedStoreId}
              options={storeOptions}
              onChange={(e) => setSelectedStoreId(e.target.value)}
            />
          </div>

          {/* Segmented Store Status Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 h-[46px]">
            <button
              type="button"
              onClick={() => handleUpdateStoreStatus("open")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentStore?.status === "open"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Mở Cửa
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStoreStatus("busy")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentStore?.status === "busy"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Quá Tải
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStoreStatus("closed")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentStore?.status === "closed"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Đóng Cửa
            </button>
          </div>

          <ButtonOutLine
            onClick={fetchDashboardData}
            iconStart={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
            label="Làm mới"
            className="!w-auto !h-[46px] !px-4 whitespace-nowrap shrink-0"
            textClassName="!text-xs"
          />
        </div>
      </div>

      {/* Store KPIs */}
      <StoreKpis
        totalRevenue={totalBranchRevenue}
        pendingWeighCount={pendingWeighOrders.length}
        waitingConfirmCount={waitingCustomerConfirmOrders.length}
        activeWashingCount={activeWashingOrders.length}
        workingMachinesCount={workingMachinesCount}
        totalMachinesCount={equipmentList.length}
        broadcastTasksCount={deliveryTasks.length}
      />

      {/* Quick Navigation Modules for Store Owner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          onClick={() => navigate("/store-owner/orders")}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 transition-colors flex items-center gap-3.5 text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Đơn Giặt & Cân Đo
            </h4>
            <p className="text-xs text-slate-500">
              Nhập số kg thực tế & AI vải
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/store-owner/equipment")}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 transition-colors flex items-center gap-3.5 text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <WashingMachine className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Lồng Giặt & Thiết Bị
            </h4>
            <p className="text-xs text-slate-500">
              Trạng thái máy giặt, sấy, ủi
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/store-owner/deliveries")}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 transition-colors flex items-center gap-3.5 text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Điều Phối Shipper
            </h4>
            <p className="text-xs text-slate-500">
              Gọi tài xế lấy & trả đồ
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/store-owner/settings")}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-500 transition-colors flex items-center gap-3.5 text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Cấu Hình & Bảng Giá
            </h4>
            <p className="text-xs text-slate-500">
              Giờ mở cửa, dịch vụ & vật tư
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/store-owner/mobile-plan")}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-purple-500 transition-colors flex items-center gap-3.5 text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Kế Hoạch Mobile App
            </h4>
            <p className="text-xs text-slate-500">
              App Khách hàng & Tài xế
            </p>
          </div>
        </button>
      </div>

      {/* Main Split: Weighing Queue (Left 7 cols) + Revenue & Machine Status (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <WeighingQueueWidget
            orders={orders}
            onGoToOrders={(orderId) =>
              navigate(
                orderId
                  ? `/store-owner/orders?weigh=${encodeURIComponent(orderId)}`
                  : "/store-owner/orders"
              )
            }
          />
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Biểu Đồ Sản Lượng & Doanh Thu Tuần
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thống kê doanh thu thực thu (VNĐ) theo ca vận hành
              </p>
            </div>
            <ButtonCustom
              onClick={() => navigate("/store-owner/orders?create=pos")}
              label="+ Tạo Đơn Tại Quầy"
              className="!w-auto !h-9 !px-3.5 !text-xs whitespace-nowrap shrink-0"
              textClassName="!text-xs"
            />
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyChartData}>
                <defs>
                  <linearGradient id="storeRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `${Number(value).toLocaleString("vi-VN")}đ`,
                    "Doanh thu",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#storeRevGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Store Customer Reviews & Manager Reply Section (Bảng `reviews`) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Bảng `reviews` · Đánh Giá Của Khách Hàng Tại Chi Nhánh</span>
            </div>
            <h3 className="text-base md:text-lg font-black text-slate-900 mt-0.5">
              Phản Hồi Đánh Giá Chất Lượng Cửa Hàng & Shipper ({storeReviews.length})
            </h3>
            <p className="text-xs text-slate-500">
              Chủ tiệm xem điểm đánh giá từng đơn giặt hoàn tất và gửi lời cảm ơn / giải trình trực tiếp tới khách hàng.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl shrink-0">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <div>
              <div className="text-sm font-black text-slate-900 font-mono">
                {currentStore?.rating?.toFixed(1) || "4.9"} / 5.0 Sao
              </div>
              <div className="text-[11px] text-slate-500">
                {currentStore?.reviewCount || 100} lượt đánh giá tích lũy
              </div>
            </div>
          </div>
        </div>

        {storeReviews.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
            Chưa có đánh giá nào cho chi nhánh này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeReviews.map((rev) => {
              const draftVal =
                replyDrafts[rev.id] !== undefined
                  ? replyDrafts[rev.id]
                  : rev.storeReply || "";
              return (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3 text-xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">
                            {rev.customerName}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                            #{rev.orderId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Mã đánh giá: {rev.id} ·{" "}
                          {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.storeRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
                      “{rev.storeComment || "Khách hàng đánh giá 5 sao chất lượng giặt sấy."}”
                    </p>

                    {rev.shipperName && (
                      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-[11px] text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            Shipper: <strong>{rev.shipperName}</strong>
                          </span>
                        </span>
                        <span className="font-black">
                          {rev.shipperRating} ★{" "}
                          {rev.shipperComment ? `(${rev.shipperComment})` : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Store Manager Reply Input */}
                  <div className="pt-2 border-t border-slate-200/70 space-y-2">
                    <label className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                      <MessageSquareReply className="w-3.5 h-3.5" />
                      <span>Phản hồi của Chủ tiệm giặt (`storeReply`):</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={draftVal}
                        onChange={(e) =>
                          setReplyDrafts((prev) => ({
                            ...prev,
                            [rev.id]: e.target.value,
                          }))
                        }
                        placeholder="Nhập lời cảm ơn hoặc phản hồi cho khách hàng..."
                        className="flex-1 h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleReplyReview(rev.id, draftVal)}
                        className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs whitespace-nowrap cursor-pointer"
                      >
                        Lưu Phản Hồi
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

