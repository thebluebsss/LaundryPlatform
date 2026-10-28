import React from "react";
import { Scale, WashingMachine, Truck, Wallet } from "lucide-react";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Revenue */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            Doanh Thu Chi Nhánh
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {totalRevenue.toLocaleString("vi-VN")}đ
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Đã đối soát VietQR & tiền mặt tại quầy
          </p>
        </div>
      </div>

      {/* KPI 2: Actual Weighing Queue */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            Đơn Cần Cân Thực Tế
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {pendingWeighCount} đơn{" "}
            <span className="text-xs font-semibold text-amber-600">
              · {waitingConfirmCount} chờ khách duyệt
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Đối chiếu từng dòng đồ (Order_Details)
          </p>
        </div>
      </div>

      {/* KPI 3: Machines & Washing Queue */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            Công Suất Máy Giặt / Sấy
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <WashingMachine className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {workingMachinesCount}/{totalMachinesCount || 5} máy
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Đang xử lý {activeWashingCount} mẻ giặt tại xưởng
          </p>
        </div>
      </div>

      {/* KPI 4: Shipper Dispatch */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            Điều Phối Giao Nhận
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {broadcastTasksCount} chuyến
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Đang phát sóng tìm tài xế thu gom / trả đồ
          </p>
        </div>
      </div>
    </div>
  );
};
