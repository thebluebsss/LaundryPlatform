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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600 w-7 h-7" />
            Cổng Điều Hành Lồng Giặt Vô Trùng
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật đơn hàng giặt sấy của khách hàng toàn cơ sở theo thời gian
            thực.
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
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex items-center gap-4 group cursor-pointer w-full text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <Building className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-slate-800 text-sm mb-0.5">
              Quản Lý Chi Nhánh
            </h4>
            <p className="text-xs text-slate-500">Bản đồ & Cửa hàng</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin/orders")}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex items-center gap-4 group cursor-pointer w-full text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-slate-800 text-sm mb-0.5">
              Quản Lý Đơn Hàng
            </h4>
            <p className="text-xs text-slate-500">
              Xem và quản lý tất cả đơn hàng
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin/services")}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 flex items-center gap-4 group cursor-pointer w-full text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-slate-800 text-sm mb-0.5">
              Quản Lý Dịch Vụ
            </h4>
            <p className="text-xs text-slate-500">Bảng giá giặt sấy/hấp sấy</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin/products")}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex items-center gap-4 group cursor-pointer w-full text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-slate-800 text-sm mb-0.5">
              Quản Lý Sản Phẩm
            </h4>
            <p className="text-xs text-slate-500">Thêm, sửa, xóa sản phẩm</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin/users")}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 flex items-center gap-4 group cursor-pointer w-full text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-slate-800 text-sm mb-0.5">
              Quản Lý Người Dùng
            </h4>
            <p className="text-xs text-slate-500">
              Quản lý tài khoản người dùng
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
