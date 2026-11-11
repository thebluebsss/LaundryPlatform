import React from 'react';
import { TrendingUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface RevenueChartProps {
  chartData: { name: string; revenue: number }[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ chartData }) => {
  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div id="admin-revenue-chart" className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-5">
      <div className="border-b border-slate-50 pb-3">
        <h4 className="font-extrabold text-xs md:text-sm flex items-center gap-1.5 uppercase tracking-wider text-slate-400">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Tỷ lệ doanh thu theo mảng
        </h4>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="105%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip 
              formatter={(value: any) => [`${value.toLocaleString('vi-VN')} đ`, 'Tổng thu']} 
              contentStyle={{ fontSize: 12, borderRadius: 12 }} 
            />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]}>
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
