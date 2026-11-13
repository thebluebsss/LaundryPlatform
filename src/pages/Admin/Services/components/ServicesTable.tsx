import React from "react";
import { Edit2, Trash2, Tag, Clock } from "lucide-react";
import { Box } from "@mui/material";
import { LaundryService } from "../../../../types";
import { SERVICE_CATEGORY_MAP } from "../hook";

interface ServicesTableProps {
  services: LaundryService[];
  onEdit: (service: LaundryService) => void;
  onDelete: (id: string, name: string) => void;
  onToggleStatus: (service: LaundryService) => void;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({
  services,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <Box className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
              <th className="py-4 px-6">Dịch vụ giặt ủi</th>
              <th className="py-4 px-4">Nhóm phân loại</th>
              <th className="py-4 px-4">Hình thức tính giá</th>
              <th className="py-4 px-4 text-right">Đơn giá áp dụng</th>
              <th className="py-4 px-4 text-center">Xử lý (Ngày)</th>
              <th className="py-4 px-4 text-center">Đặc trưng</th>
              <th className="py-4 px-4 text-center">Trạng thái nhận</th>
              <th className="py-4 px-6 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {services.map((s) => {
              const isActive =
                (s as any).isActive !== undefined ? (s as any).isActive : true;
              return (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-4 px-6 max-w-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-black uppercase">
                          {s.iconName ? s.iconName.substring(0, 3) : "Gi"}
                        </span>
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 text-sm block">
                          {s.name}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 block">
                          {s.description || "Chưa có văn bản mô tả..."}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center w-max gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {SERVICE_CATEGORY_MAP[s.category] || s.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-600">
                    {s.pricingType === "per_kg"
                      ? "Theo cân ký (KG)"
                      : "Tính theo chiếc/bộ"}
                  </td>
                  <td className="py-4 px-4 text-right font-extrabold text-slate-900 text-sm">
                    {s.unitPrice.toLocaleString("vi-VN")}đ{" "}
                    <span className="text-slate-400 font-medium text-xs">
                      / {s.unitName}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-700">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-lg text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />{" "}
                      {s.durationDays} ngày
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {s.featured ? (
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 rounded-full py-0.5 px-2 font-black inline-block">
                        Nổi bật
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block">
                        Thường
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => onToggleStatus(s)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-all border ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                          : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {isActive ? "Đang phục vụ" : "Tạm đóng"}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit(s)}
                        className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl cursor-pointer border border-slate-100 hover:border-indigo-100 transition-all"
                        title="Sửa thông tin"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(s.id, s.name)}
                        className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl cursor-pointer border border-slate-100 hover:border-rose-100 transition-all"
                        title="Xóa dịch vụ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Box>
  );
};
