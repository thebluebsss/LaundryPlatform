import React from "react";
import { Scale, RefreshCw, CheckCircle2 } from "lucide-react";
import { useMobileCustomerWeightConfirm } from "./hook";
import { WeightComparisonCard } from "./components/WeightComparisonCard";

export const MobileCustomerWeightConfirm: React.FC = () => {
  const {
    orders,
    waitingCount,
    loading,
    processingId,
    filterMode,
    setFilterMode,
    fetchOrders,
    handleAcceptWeight,
    handleRejectWeight,
  } = useMobileCustomerWeightConfirm();

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <Scale className="w-4 h-4" />
              <span>Xác nhận khối lượng thực tế</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Duyệt cân nặng & chi phí từ tiệm giặt
            </h2>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterMode("waiting")}
            className={`py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterMode === "waiting"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Chờ bạn duyệt ({waitingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterMode === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả đơn đối chiếu
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <WeightComparisonCard
            key={order.id}
            order={order}
            processingId={processingId}
            onAcceptWeight={handleAcceptWeight}
            onRejectWeight={handleRejectWeight}
          />
        ))}

        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-900">
              Hiện không có đơn nào cần duyệt cân
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Khi tiệm giặt cân thực tế xong, bảng đối chiếu số kg tạm tính và thực tế sẽ hiển thị ngay tại đây để bạn xác nhận.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
