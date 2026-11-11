import React from 'react';
import { Coins, CircleDot, CheckCircle, Boxes } from 'lucide-react';

interface DashboardKpisProps {
  totalRevenue: number;
  activeOrdersCount: number;
  completedOrdersCount: number;
  garmentsVolumeCount: number;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({
  totalRevenue,
  activeOrdersCount,
  completedOrdersCount,
  garmentsVolumeCount
}) => {
  const formatPrice = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div id="admin-kpis-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Doanh thu đã thu</p>
          <h3 className="text-lg font-black text-slate-800 mt-1 truncate">{formatPrice(totalRevenue)}</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
          <CircleDot className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đơn hàng đang xử lý</p>
          <h3 className="text-lg font-black text-slate-800 mt-1">{activeOrdersCount} Đơn vận</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đơn thành công</p>
          <h3 className="text-lg font-black text-slate-800 mt-1">{completedOrdersCount} Đơn sạch</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl">
          <Boxes className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Khối lượng trong lồng</p>
          <h3 className="text-lg font-black text-slate-800 mt-1">{garmentsVolumeCount} Tiết mục</h3>
        </div>
      </div>

    </div>
  );
};
