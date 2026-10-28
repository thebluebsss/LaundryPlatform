import React, { useState, useEffect } from "react";
import {
  X,
  Scale,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Send,
  AlertCircle,
} from "lucide-react";
import {
  LaundryOrder,
  LaundryService,
  OrderStatus,
  WeightConfirmStatus,
} from "../../../../types";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";
import { InputText } from "../../../../components/InputText";
import { InputSelect } from "../../../../components/InputSelect";
import { InputArea } from "../../../../components/InputArea";

interface WeighAndInspectModalProps {
  order: LaundryOrder | null;
  services: LaundryService[];
  onClose: () => void;
  onSave: (
    orderId: string,
    payload: {
      items: any[];
      weightConfirmStatus: WeightConfirmStatus;
      status: OrderStatus;
      notes: string;
      paymentStatus?: "pending" | "paid" | "refunded" | "failed";
    }
  ) => void;
  onRunAiInspect: (
    itemName: string,
    declaredService: string,
    imageUrl?: string
  ) => Promise<any>;
}

const FABRIC_OPTIONS = [
  { value: "Cotton / Đồ mặc hàng ngày", label: "Cotton / Đồ mặc hàng ngày" },
  { value: "Đồ trắng (Sơ mi, Áo phông trắng)", label: "Đồ trắng (Cần giặt tách màu)" },
  { value: "Lụa / Tơ tằm / Voan mỏng", label: "Lụa / Tơ tằm / Voan mỏng" },
  { value: "Len / Dạ / Cashmere", label: "Len / Dạ / Cashmere" },
  { value: "Denim / Đồ Jean dày", label: "Denim / Đồ Jean dày" },
  { value: "Lông vũ / Chăn mền lớn", label: "Lông vũ / Chăn mền lớn" },
  { value: "Âu phục / Vest / Áo dài", label: "Âu phục / Vest / Áo dài" },
];

export const WeighAndInspectModal: React.FC<WeighAndInspectModalProps> = ({
  order,
  services,
  onClose,
  onSave,
  onRunAiInspect,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "refunded" | "failed">("pending");
  const [aiLoadingIndex, setAiLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (order) {
      setItems(
        (order.items || []).map((it: any) => ({
          ...it,
          fabricType: it.fabricType || "Cotton / Đồ mặc hàng ngày",
          estimatedQuantity: Number(it.estimatedQuantity ?? it.quantity ?? 1),
          actualQuantity:
            it.actualQuantity !== undefined && it.actualQuantity !== null
              ? Number(it.actualQuantity)
              : Number(it.estimatedQuantity ?? it.quantity ?? 1),
          garmentDescription: it.garmentDescription || "",
          careInstructions: it.careInstructions || "",
          aiInspectionResult: it.aiInspectionResult || "",
        }))
      );
      setNotes(order.notes || "");
      setPaymentStatus(order.paymentStatus || "pending");
    }
  }, [order]);

  if (!order) return null;

  const serviceOptions = services.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.unitPrice.toLocaleString("vi-VN")}đ/${s.unitName})`,
  }));

  const handleUpdateLine = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === "serviceId") {
          const found = services.find((s) => s.id === value);
          if (found) {
            return {
              ...item,
              serviceId: found.id,
              serviceName: found.name,
              unitPrice: found.unitPrice,
              unitName: found.unitName,
              pricingType: found.pricingType,
            };
          }
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleAddLine = () => {
    const defaultService = services[0] || {
      id: "wf-regular",
      name: "Giặt Sấy Thường (Wash & Fold)",
      unitPrice: 20000,
      unitName: "kg",
      pricingType: "per_kg",
    };
    setItems((prev) => [
      ...prev,
      {
        serviceId: defaultService.id,
        serviceName: defaultService.name,
        fabricType: "Cotton / Đồ mặc hàng ngày",
        garmentDescription: "",
        careInstructions: "",
        pricingType: defaultService.pricingType,
        unitName: defaultService.unitName,
        unitPrice: defaultService.unitPrice,
        quantity: 1,
        estimatedQuantity: 0,
        actualQuantity: 1,
        aiInspectionResult: "",
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAiAnalyzeLine = async (index: number) => {
    const target = items[index];
    setAiLoadingIndex(index);
    try {
      const result = await onRunAiInspect(
        target.garmentDescription || target.fabricType || target.serviceName,
        target.serviceId
      );
      const summaryText =
        result?.notes ||
        `AI nhận diện: ${result?.detectedFabric || target.fabricType}. Khuyến nghị: ${(
          result?.careInstructions || []
        ).join(", ")}`;
      handleUpdateLine(index, "aiInspectionResult", summaryText);
      if (result?.careInstructions?.length) {
        handleUpdateLine(
          index,
          "careInstructions",
          result.careInstructions.join(" · ")
        );
      }
    } finally {
      setAiLoadingIndex(null);
    }
  };

  const estimatedSubtotal = items.reduce(
    (sum, it) =>
      sum + Number(it.estimatedQuantity || 0) * Number(it.unitPrice || 0),
    0
  );

  const actualSubtotal = items.reduce(
    (sum, it) =>
      sum + Number(it.actualQuantity || 0) * Number(it.unitPrice || 0),
    0
  );

  const deliveryFee = Number(order.deliveryFee ?? 20000);
  const discountAmount = Number(order.discountAmount ?? 0);
  const finalTotal = Math.max(0, actualSubtotal + deliveryFee - discountAmount);
  const diffAmount = actualSubtotal - estimatedSubtotal;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl p-6 md:p-8 my-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
              <Scale className="w-4 h-4" />
              <span>Bóc Tách Dòng Đồ (Order_Details) & Cân Thực Tế Tại Tiệm</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Đơn hàng #{order.id.toUpperCase()} — {order.customerName} (
              {order.phoneNumber})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Địa chỉ: {order.address}, {order.district} · Hẹn trả:{" "}
              {order.deliveryDate} ({order.deliveryTime})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Fabric Order Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900">
              Danh sách từng dòng đồ giặt ({items.length} dòng)
            </h4>
            <ButtonOutLine
              type="button"
              onClick={handleAddLine}
              iconStart={<Plus className="w-4 h-4" />}
              label="Thêm Dòng Đồ Phát Sinh"
              className="!w-auto !h-9 !px-3.5 !text-xs"
              textClassName="!text-xs"
            />
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => {
              const lineTotal =
                Number(item.actualQuantity || 0) * Number(item.unitPrice || 0);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                    <span className="text-xs font-black text-slate-800">
                      Dòng đồ #{idx + 1} · Thành tiền thực tế:{" "}
                      <strong className="font-mono text-blue-600 tabular-nums">
                        {lineTotal.toLocaleString("vi-VN")}đ
                      </strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAiAnalyzeLine(idx)}
                        disabled={aiLoadingIndex === idx}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {aiLoadingIndex === idx
                          ? "Đang phân tích AI..."
                          : "AI Kiểm Tra Chất Vải & Tem Mác"}
                      </button>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa dòng đồ này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-5">
                      <InputSelect
                        title="Gói dịch vụ giặt"
                        value={item.serviceId}
                        options={serviceOptions}
                        onChange={(e) =>
                          handleUpdateLine(idx, "serviceId", e.target.value)
                        }
                      />
                    </div>

                    <div className="md:col-span-4">
                      <InputSelect
                        title="Phân loại chất liệu vải (fabricType)"
                        value={item.fabricType}
                        options={FABRIC_OPTIONS}
                        onChange={(e) =>
                          handleUpdateLine(idx, "fabricType", e.target.value)
                        }
                      />
                    </div>

                    <div className="md:col-span-3 grid grid-cols-2 gap-2">
                      <InputText
                        title={`Tạm tính (${item.unitName})`}
                        inputProps={{
                          type: "number",
                          value: String(item.estimatedQuantity ?? 0),
                          disabled: true,
                          onChange: () => {},
                        }}
                      />
                      <InputText
                        title={`Cân thực tế (${item.unitName}) *`}
                        required
                        inputProps={{
                          type: "number",
                          step: "0.1",
                          value: String(item.actualQuantity ?? 0),
                          onChange: (e: any) =>
                            handleUpdateLine(
                              idx,
                              "actualQuantity",
                              parseFloat(e.target.value) || 0
                            ),
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InputText
                      title="Mô tả món đồ cụ thể (garmentDescription)"
                      placeholder="VD: 3 áo sơ mi trắng, 2 quần âu..."
                      inputProps={{
                        value: item.garmentDescription || "",
                        onChange: (e: any) =>
                          handleUpdateLine(
                            idx,
                            "garmentDescription",
                            e.target.value
                          ),
                      }}
                    />
                    <InputText
                      title="Hướng dẫn giặt ủi riêng (careInstructions)"
                      placeholder="VD: Giặt lạnh 30°C, không vắt mạnh..."
                      inputProps={{
                        value: item.careInstructions || "",
                        onChange: (e: any) =>
                          handleUpdateLine(
                            idx,
                            "careInstructions",
                            e.target.value
                          ),
                      }}
                    />
                  </div>

                  {item.aiInspectionResult && (
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Kết quả AI Vision: </span>
                        <span>{item.aiInspectionResult}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes & Payment Status */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-7">
            <InputArea
              title="Ghi chú vận hành của cửa hàng / Dặn dò khách hàng"
              placeholder="Nhập ghi chú tình trạng quần áo trước khi giặt..."
              inputProps={{
                value: notes,
                onChange: (e: any) => setNotes(e.target.value),
              }}
            />
          </div>

          <div className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính ban đầu (Khách đặt):</span>
              <span className="font-mono font-bold tabular-nums">
                {estimatedSubtotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="flex justify-between text-slate-800">
              <span>Tiền giặt thực tế (Sau khi cân):</span>
              <span className="font-mono font-black text-blue-600 tabular-nums">
                {actualSubtotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Chênh lệch sau cân:</span>
              <span
                className={`font-mono font-bold tabular-nums ${
                  diffAmount > 0
                    ? "text-amber-600"
                    : diffAmount < 0
                    ? "text-emerald-600"
                    : "text-slate-500"
                }`}
              >
                {diffAmount > 0 ? "+" : ""}
                {diffAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí giao nhận 2 chiều:</span>
              <span className="font-mono tabular-nums">
                {deliveryFee.toLocaleString("vi-VN")}đ
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Khuyến mãi ({order.promoCode || "Voucher"}):</span>
                <span className="font-mono tabular-nums">
                  -{discountAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm">
              <span className="font-black text-slate-900">
                Tổng thanh toán thực tế:
              </span>
              <span className="font-mono font-black text-lg text-blue-600 tabular-nums">
                {finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>

            {diffAmount !== 0 && (
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Có chênh lệch cân nặng: Nên bấm &quot;Gửi Khách Xác Nhận&quot;
                  trước khi giặt.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions matching Sequence Diagram */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <ButtonOutLine
            type="button"
            label="Đóng"
            onClick={onClose}
            className="sm:!w-32"
          />

          <ButtonCustom
            type="button"
            isSecondary
            iconStart={<Send className="w-4 h-4 text-amber-600" />}
            label="Lưu Cân & Gửi Khách Xác Nhận (App)"
            onClick={() =>
              onSave(order.id, {
                items,
                weightConfirmStatus: "waiting_customer",
                status: "waiting_confirm",
                notes,
                paymentStatus,
              })
            }
            className="sm:!w-auto"
          />

          <ButtonCustom
            type="button"
            iconStart={<CheckCircle2 className="w-4 h-4" />}
            label="Xác Nhận Cân & Đưa Vào Giặt Ngay"
            onClick={() =>
              onSave(order.id, {
                items,
                weightConfirmStatus: "accepted",
                status: "washing",
                notes,
                paymentStatus,
              })
            }
            className="sm:!w-auto"
          />
        </div>
      </div>
    </div>
  );
};
