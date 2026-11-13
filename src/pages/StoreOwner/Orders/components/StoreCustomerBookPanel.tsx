import React from "react";
import { Users, Phone } from "lucide-react";

export interface StoreCustomerSummary {
  name: string;
  phone: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  lastOrderId: string;
}

interface StoreCustomerBookPanelProps {
  customers: StoreCustomerSummary[];
  customerCareNotes: Record<string, string>;
  onSaveCustomerCareNote: (phone: string, note: string) => void;
  onFilterByPhone: (phone: string) => void;
  onClose: () => void;
}

export const StoreCustomerBookPanel: React.FC<StoreCustomerBookPanelProps> = ({
  customers,
  customerCareNotes,
  onSaveCustomerCareNote,
  onFilterByPhone,
  onClose,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-blue-200 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>
              Quản Lý Thông Tin Khách Của Tiệm & Lưu Ý Chăm Sóc Vải Riêng
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Tra cứu thông tin liên hệ, tổng số đơn lịch sử tại tiệm và ghi chú
            chế độ giặt riêng cho từng khách quen
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          Thu gọn
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {customers.map((c) => (
          <div
            key={c.phone}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-black text-slate-900 text-sm">{c.name}</div>
                <div className="text-slate-500 flex items-center gap-2 mt-0.5">
                  <a
                    href={`tel:${c.phone}`}
                    className="font-mono font-bold text-blue-600 flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    {c.phone}
                  </a>
                  <span>·</span>
                  <span className="truncate max-w-[180px]">{c.address}</span>
                </div>
              </div>
              <div className="text-right font-mono shrink-0">
                <div className="font-black text-emerald-600">
                  {c.orderCount} đơn giặt
                </div>
                <div className="text-[11px] text-slate-500">
                  {c.totalSpent.toLocaleString("vi-VN")}đ
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                defaultValue={customerCareNotes[c.phone] || ""}
                placeholder="Ghi chú lưu ý chăm sóc vải riêng cho khách quen này..."
                onBlur={(e) => onSaveCustomerCareNote(c.phone, e.target.value)}
                className="flex-1 h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={() => onFilterByPhone(c.phone)}
                className="h-8 px-2.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px] whitespace-nowrap cursor-pointer"
              >
                Lọc lịch sử
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
