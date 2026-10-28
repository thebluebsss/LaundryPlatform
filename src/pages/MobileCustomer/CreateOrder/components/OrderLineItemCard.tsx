import React from "react";
import { Trash2, Sparkles, Minus, Plus } from "lucide-react";
import { CartItem, LaundryService } from "../../../../types";
import { InputSelect } from "../../../../components/InputSelect";
import { InputText } from "../../../../components/InputText";

interface OrderLineItemCardProps {
  index: number;
  item: CartItem;
  services: LaundryService[];
  canRemove: boolean;
  onUpdateItem: (index: number, patch: Partial<CartItem>) => void;
  onRemoveItem: (index: number) => void;
  onOpenAiScanner: (index: number) => void;
}

const FABRIC_OPTIONS = [
  { value: "Cotton / Đồ mặc hàng ngày", label: "Cotton / Đồ mặc hàng ngày" },
  { value: "Đồ trắng (Áo sơ mi / Phông trắng)", label: "Đồ trắng (Cần giặt riêng)" },
  { value: "Lụa / Voan / Satin mỏng", label: "Lụa / Voan / Satin mỏng (Nhạy cảm)" },
  { value: "Len / Dạ / Cashmere", label: "Len / Dạ / Cashmere (Giặt khô)" },
  { value: "Denim / Đồ Jeans dày", label: "Denim / Đồ Jeans dày" },
  { value: "Chăn lông / Ga giường / Rèm cửa", label: "Chăn lông / Ga giường / Rèm cửa" },
  { value: "Vest / Áo khoác phao", label: "Vest / Áo khoác phao" },
];

export const OrderLineItemCard: React.FC<OrderLineItemCardProps> = ({
  index,
  item,
  services,
  canRemove,
  onUpdateItem,
  onRemoveItem,
  onOpenAiScanner,
}) => {
  const serviceOptions = services.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.unitPrice.toLocaleString("vi-VN")}đ/${s.unitName})`,
  }));

  const handleServiceChange = (serviceId: string) => {
    const found = services.find((s) => s.id === serviceId);
    if (!found) return;
    const qty = item.estimatedQuantity || item.quantity || 1;
    onUpdateItem(index, {
      serviceId: found.id,
      serviceName: found.name,
      unitPrice: found.unitPrice,
      pricingType: found.pricingType,
      unitName: found.unitName,
      estimatedLineTotal: qty * found.unitPrice,
    });
  };

  const handleQuantityDelta = (delta: number) => {
    const step = item.pricingType === "per_kg" ? 0.5 : 1;
    const current = item.estimatedQuantity || item.quantity || 1;
    const next = Math.max(step, Number((current + delta * step).toFixed(1)));
    onUpdateItem(index, {
      quantity: next,
      estimatedQuantity: next,
      estimatedLineTotal: Math.round(next * item.unitPrice),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-black text-blue-600">
            Dòng #{index + 1}
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="font-bold text-slate-800 truncate">
            {item.serviceName}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenAiScanner(index)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Quét Vải</span>
          </button>
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemoveItem(index)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
              title="Xóa dòng đồ này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InputSelect
          title="Gói dịch vụ giặt"
          value={item.serviceId}
          options={serviceOptions}
          onChange={(e) => handleServiceChange(e.target.value)}
        />

        <InputSelect
          title="Phân loại chất liệu vải (fabric_type)"
          value={item.fabricType || "Cotton / Đồ mặc hàng ngày"}
          options={FABRIC_OPTIONS}
          onChange={(e) => onUpdateItem(index, { fabricType: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
        <div>
          <label className="text-xs font-bold block text-slate-700 mb-1.5">
            Khối lượng / Số lượng tạm tính ({item.unitName})
          </label>
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <button
              type="button"
              onClick={() => handleQuantityDelta(-1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="text-center font-mono">
              <span className="text-sm font-black text-slate-900">
                {item.estimatedQuantity ?? item.quantity}
              </span>
              <span className="text-xs text-slate-500 ml-1">
                {item.unitName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleQuantityDelta(1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <InputText
          title="Ghi chú riêng cho dòng đồ này"
          placeholder="VD: Không vắt mạnh, nước ấm 30°C..."
          inputProps={{
            value: item.careInstructions || "",
            onChange: (e) =>
              onUpdateItem(index, { careInstructions: e.target.value }),
          }}
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <span className="text-slate-500">
          Đơn giá:{" "}
          <span className="font-mono font-semibold text-slate-700">
            {item.unitPrice.toLocaleString("vi-VN")}đ/{item.unitName}
          </span>
        </span>
        <span className="font-mono font-black text-blue-600 text-sm">
          Tạm tính:{" "}
          {(
            item.estimatedLineTotal ??
            (item.estimatedQuantity || item.quantity) * item.unitPrice
          ).toLocaleString("vi-VN")}
          đ
        </span>
      </div>
    </div>
  );
};
