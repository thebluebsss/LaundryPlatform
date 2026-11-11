import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  MapPin,
  Phone,
  Clock,
  Star,
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
    label: `${s.name} (${s.district})`,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Branch Selector & Operational Status Bar */}
      {stores.length === 0 ? (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              Bạn chưa thiết lập thông tin cửa hàng
            </h2>
            <p className="text-xs text-slate-500">
              Hãy cập nhật tên tiệm, địa chỉ và vị trí trên bản đồ để khách hàng có thể đặt lịch giặt sấy.
            </p>
          </div>
          <ButtonCustom
            onClick={() => navigate("/store-owner/settings")}
            label="Thiết lập cửa hàng"
            className="!w-auto !px-5 !h-10 shrink-0"
          />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentStore?.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {currentStore?.address}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {currentStore?.phone}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {currentStore?.openHours}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            {stores.length > 1 && (
              <div className="min-w-[240px]">
                <InputSelect
                  title="Chi nhánh"
                  value={selectedStoreId}
                  options={storeOptions}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                />
              </div>
            )}

            {/* Segmented Store Status Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 h-[42px]">
              <button
                type="button"
                onClick={() => handleUpdateStoreStatus("open")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentStore?.status === "open"
                    ? "bg-white text-emerald-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Mở cửa
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStoreStatus("busy")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentStore?.status === "busy"
                    ? "bg-white text-amber-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Đang bận
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStoreStatus("closed")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentStore?.status === "closed"
                    ? "bg-white text-rose-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tạm nghỉ
              </button>
            </div>

            <ButtonOutLine
              onClick={fetchDashboardData}
              iconStart={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              label="Làm mới"
              className="!w-auto !h-[42px] !px-3.5 whitespace-nowrap shrink-0"
              textClassName="!text-xs"
            />
          </div>
        </div>
      )}

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

      {/* Main Split: Weighing Queue (Left 7 cols) + Revenue Chart (Right 5 cols) */}
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
          <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Doanh thu trong tuần
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thống kê doanh thu theo ngày tại cửa hàng
              </p>
            </div>
            <ButtonCustom
              onClick={() => navigate("/store-owner/orders?create=pos")}
              label="+ Tạo đơn tại quầy"
              className="!w-auto !h-8 !px-3 !text-xs whitespace-nowrap shrink-0"
              textClassName="!text-xs"
            />
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyChartData}>
                <defs>
                  <linearGradient id="storeRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
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
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}tr`}
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
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#storeRevGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Store Customer Reviews & Manager Reply Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Đánh giá từ khách hàng ({storeReviews.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Xem nhận xét thực tế và gửi phản hồi trực tiếp cho khách hàng
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 tabular-nums">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-slate-900 text-sm">
              {currentStore?.rating?.toFixed(1) || "4.9"} / 5.0
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentStore?.reviewCount || storeReviews.length} đánh giá</span>
          </div>
        </div>

        {storeReviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có đánh giá nào cho chi nhánh này.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {storeReviews.map((rev) => {
              const draftVal =
                replyDrafts[rev.id] !== undefined
                  ? replyDrafts[rev.id]
                  : rev.storeReply || "";
              return (
                <div
                  key={rev.id}
                  className="py-4 first:pt-1 last:pb-0 flex flex-col lg:flex-row lg:items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">
                        {rev.customerName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        Đơn #{rev.orderId}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-slate-400 tabular-nums">
                        {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-400 ml-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.storeRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                      “{rev.storeComment || "Dịch vụ giặt sạch sẽ, thơm tho."}”
                    </p>

                    {rev.shipperName && (
                      <p className="text-slate-500">
                        Tài xế giao nhận: <strong className="font-medium text-slate-700">{rev.shipperName}</strong> ({rev.shipperRating} sao)
                      </p>
                    )}
                  </div>

                  {/* Store Manager Reply Input */}
                  <div className="w-full lg:w-96 flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={draftVal}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [rev.id]: e.target.value,
                        }))
                      }
                      placeholder="Nhập phản hồi của cửa hàng..."
                      className="flex-1 h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleReplyReview(rev.id, draftVal)}
                      className="h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs whitespace-nowrap cursor-pointer transition-colors"
                    >
                      Gửi phản hồi
                    </button>
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


