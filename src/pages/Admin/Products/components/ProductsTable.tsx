import React from "react";
import { Edit2, Trash2, Tag } from "lucide-react";
import { Box } from "@mui/material";
import { AdminProduct, CATEGORY_MAP } from "../hook";

interface ProductsTableProps {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
  onDelete: (id: string, name: string) => void;
  onToggleStatus: (product: AdminProduct) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
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
              <th className="py-4 px-6">Ảnh / Tên</th>
              <th className="py-4 px-4">Phân loại</th>
              <th className="py-4 px-4 text-right">Đơn giá bán</th>
              <th className="py-4 px-4 text-center">Tồn kho</th>
              <th className="py-4 px-4 text-center">Trạng thái mua</th>
              <th className="py-4 px-6 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {products.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        p.image ||
                        "https://images.unsplash.com/photo-1610557892470-76d747e49536?w=100&auto=format&fit=crop&q=60"
                      }
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-100"
                    />
                    <div>
                      <span className="font-extrabold text-slate-800 text-sm block">
                        {p.name}
                      </span>
                      {p.brand && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold mr-1">
                          {p.brand}
                        </span>
                      )}
                      {p.weight && (
                        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                          {p.weight}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center w-max gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {CATEGORY_MAP[p.category] || p.category}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-extrabold text-slate-800 block">
                    {(p.price || 0).toLocaleString("vi-VN")}đ
                  </span>
                  {p.originalPrice && (
                    <span className="text-[10px] text-slate-400 line-through">
                      {(p.originalPrice || 0).toLocaleString("vi-VN")}đ
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`font-mono font-bold ${
                      p.stock <= 5
                        ? "text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-black"
                        : "text-slate-700"
                    }`}
                  >
                    {p.stock} {p.unit}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={() => onToggleStatus(p)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                      p.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                        : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        p.isActive ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    {p.isActive ? "Đang Bán" : "Tạm Ngưng"}
                  </button>
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl cursor-pointer border border-slate-100 hover:border-indigo-100 transition-all"
                      title="Sửa sản phẩm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl cursor-pointer border border-slate-100 hover:border-rose-100 transition-all"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
};
