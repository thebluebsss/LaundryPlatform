import React from "react";
import { ShieldCheck, ShoppingCart, Package, Users, Sparkles, Building } from "lucide-react";
import { useAdminDashboard } from "./hook";
import { DashboardKpis } from "./components/DashboardKpis";
import { RevenueChart } from "./components/RevenueChart";
import { useNavigate } from "react-router-dom";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    totalRevenue,
    activeOrdersCount,
    completedOrdersCount,
    garmentsVolumeCount,
    chartData,
  } = useAdminDashboard();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section admin controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <ShieldCheck className="text-indigo-600 w-6 h-6" />
            Tổng quan vận hành hệ thống
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi doanh thu, tiến độ đơn hàng và hoạt động của toàn bộ chi
            nhánh tại Hà Nội.
          </p>
        </div>
      </div>

      {/* KPI Stats cards */}
      <DashboardKpis
        totalRevenue={totalRevenue}
        activeOrdersCount={activeOrdersCount}
        completedOrdersCount={completedOrdersCount}
        garmentsVolumeCount={garmentsVolumeCount}
      />

      {/* Admin management module quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          onClick={() => navigate("/admin/stores")}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all duration-200 flex items-center gap-4 group cursor-pointer w-full text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors shrink-0">
            <Building className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-slate-900 text-sm mb-0.5">
              Quản lý chi nhánh
            </h4>
            <p className="text-xs text-slate-500">Bản đồ & cửa hàng</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin/orders")}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all duration-200 flex items-center gap-4 group cursor-pointer w-full text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-slate-900 text-sm mb-0.5">
              Quản lý đơn hàng
            </h4>
            <p className="text-xs text-slate-500">
              Theo dõi tất cả đơn giặt
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin/services")}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-amber-300 transition-all duration-200 flex items-center gap-4 group cursor-pointer w-full text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors shrink-0">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-slate-900 text-sm mb-0.5">
              Quản lý dịch vụ
            </h4>
            <p className="text-xs text-slate-500">Bảng giá giặt sấy & giặt hấp</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin/products")}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all duration-200 flex items-center gap-4 group cursor-pointer w-full text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors shrink-0">
            <Package className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-slate-900 text-sm mb-0.5">
              Quản lý sản phẩm
            </h4>
            <p className="text-xs text-slate-500">Sản phẩm chăm sóc đồ</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin/users")}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-purple-300 transition-all duration-200 flex items-center gap-4 group cursor-pointer w-full text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors shrink-0">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-slate-900 text-sm mb-0.5">
              Quản lý tài khoản
            </h4>
            <p className="text-xs text-slate-500">
              Khách hàng, chủ tiệm & tài xế
            </p>
          </div>
        </button>
      </div>

      {/* Analytics Chart */}
      <div className="w-full col-span-3">
        <RevenueChart chartData={chartData} />
      </div>
    </div>
  );
};
