import React from "react";

interface StoreKpisProps {
  totalRevenue: number;
  pendingWeighCount: number;
  waitingConfirmCount: number;
  activeWashingCount: number;
  workingMachinesCount: number;
  totalMachinesCount: number;
  broadcastTasksCount: number;
}

export const StoreKpis: React.FC<StoreKpisProps> = ({
  totalRevenue,
  pendingWeighCount,
  waitingConfirmCount,
  activeWashingCount,
  workingMachinesCount,
  totalMachinesCount,
  broadcastTasksCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
      {/* KPI 1: Revenue */}
      <div className="p-5 space-y-1">
        <span className="text-xs font-medium text-slate-500 block">
          Doanh thu chi nhánh
        </span>
        <p className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
          {totalRevenue.toLocaleString("vi-VN")}đ
        </p>
        <p className="text-xs text-slate-400">
          Tổng đơn đã thanh toán
        </p>
      </div>

      {/* KPI 2: Actual Weighing Queue */}
      <div className="p-5 space-y-1">
        <span className="text-xs font-medium text-slate-500 block">
          Đơn chờ cân thực tế
        </span>
        <p className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
          {pendingWeighCount} đơn
        </p>
        <p className="text-xs text-amber-600 font-medium tabular-nums">
          {waitingConfirmCount} đơn đang chờ khách xác nhận
        </p>
      </div>

      {/* KPI 3: Machines & Washing Queue */}
      <div className="p-5 space-y-1">
        <span className="text-xs font-medium text-slate-500 block">
          Thiết bị đang hoạt động
        </span>
        <p className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
          {workingMachinesCount}/{totalMachinesCount || 5} máy
        </p>
        <p className="text-xs text-slate-400 tabular-nums">
          Đang xử lý {activeWashingCount} đơn tại tiệm
        </p>
      </div>

      {/* KPI 4: Shipper Dispatch */}
      <div className="p-5 space-y-1">
        <span className="text-xs font-medium text-slate-500 block">
          Chuyến giao nhận
        </span>
        <p className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
          {broadcastTasksCount} chuyến
        </p>
        <p className="text-xs text-slate-400">
          Lấy đồ và giao trả tận nơi
        </p>
      </div>
    </div>
  );
};

