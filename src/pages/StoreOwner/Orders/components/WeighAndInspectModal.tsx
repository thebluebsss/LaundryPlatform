import React, { useState, useEffect } from "react";
import {
  X,
  Scale,
  Plus,
  Trash2,
  CheckCircle2,
  Send,
  AlertCircle,
  Clock,
  Coins,
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
      extraFee?: number;
      extraFeeReason?: string;
      paymentStatus?: "pending" | "paid" | "refunded" | "failed";
    }
  ) => void;
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

const EXTRA_FEE_PRESETS = [
  { label: "+20.000đ (Giặt nhanh)", amount: 20000, reason: "Phụ phí ưu tiên giặt nhanh lấy sớm theo yêu cầu" },
  { label: "+30.000đ (Trả gấp trong ngày)", amount: 30000, reason: "Phụ phí giặt sấy hỏa tốc trả đồ trước hẹn" },
  { label: "+50.000đ (Ủi hơi & Treo móc riêng)", amount: 50000, reason: "Phụ phí ủi hơi nước & đóng túi treo móc theo yêu cầu" },
];

export const WeighAndInspectModal: React.FC<WeighAndInspectModalProps> = ({
  order,
  services,
  onClose,
  onSave,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [extraFee, setExtraFee] = useState<number>(0);
  const [extraFeeReason, setExtraFeeReason] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "refunded" | "failed">("pending");

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
        }))
      );
      setNotes(order.notes || "");
      setExtraFee(Number(order.extraFee ?? 0));
      setExtraFeeReason(
        order.extraFeeReason ||
          (order.customerSpecialRequest
            ? `Phụ phí đáp ứng yêu cầu: ${order.customerSpecialRequest}`
            : "")
      );
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
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
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

  const productsTotal = Number(order.productsTotal ?? 0);
  const deliveryFee = Number(order.deliveryFee ?? 20000);
  const discountAmount = Number(order.discountAmount ?? 0);
  const normalizedExtraFee = Math.max(0, Number(extraFee || 0));
  const finalTotal = Math.max(
    0,
    actualSubtotal + productsTotal + deliveryFee + normalizedExtraFee - discountAmount
  );
  const diffAmount = actualSubtotal + normalizedExtraFee - estimatedSubtotal;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl p-6 md:p-8 my-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
              <Scale className="w-4 h-4" />
              <span>Kiểm Tra Đồ Giặt, Cân Thực Tế & Xử Lý Yêu Cầu Khách</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Đơn hàng #{order.id.toUpperCase()} — {order.customerName} (
              {order.phoneNumber})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Địa chỉ: {order.address}, {order.district}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlighted Customer Special Request & Extra Fee Configuration */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3.5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Yêu Cầu Đặc Biệt Của Khách Hàng Khi Đặt Lịch:</span>
              </div>
              {order.customerSpecialRequest ? (
                <div className="text-sm font-bold text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-amber-300 shadow-2xs">
                  “{order.customerSpecialRequest}”
                </div>
              ) : (
                <p className="text-xs text-slate-600">
                  Khách không ghi yêu cầu thời gian đặc biệt (Bạn vẫn có thể thêm phụ phí nếu khách nhắn riêng hoặc phát sinh xử lý vết bẩn khó).
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1.5 rounded-xl">
              <Coins className="w-4 h-4 text-amber-700" />
              <span>Thêm chi phí / Phụ phí yêu cầu</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
            <div className="md:col-span-4">
              <InputText
                title="Chi phí cộng thêm (VNĐ)"
                inputProps={{
                  type: "number",
                  step: "5000",
                  min: "0",
                  placeholder: "VD: 30000",
                  value: String(extraFee || 0),
                  onChange: (e: any) =>
                    setExtraFee(Math.max(0, parseInt(e.target.value, 10) || 0)),
                }}
              />
            </div>
            <div className="md:col-span-8">
              <InputText
                title="Nội dung / Lý do cộng thêm chi phí (Hiển thị cho khách)"
                placeholder="VD: Phụ phí giặt gấp trả đồ trước 17h chiều theo yêu cầu của khách"
                inputProps={{
                  value: extraFeeReason,
                  onChange: (e: any) => setExtraFeeReason(e.target.value),
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-amber-900 mr-1">
              Chọn nhanh phụ phí:
            </span>
            {EXTRA_FEE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setExtraFee(preset.amount);
                  setExtraFeeReason(preset.reason);
                }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 border border-amber-200 text-[11px] font-bold text-amber-900 cursor-pointer transition-colors"
              >
                {preset.label}
              </button>
            ))}
            {extraFee > 0 && (
              <button
                type="button"
                onClick={() => {
                  setExtraFee(0);
                  setExtraFeeReason("");
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold text-rose-700 cursor-pointer transition-colors"
              >
                Xóa phụ phí (0đ)
              </button>
            )}
          </div>
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
                        title="Chất liệu vải"
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
                      title="Mô tả món đồ cụ thể"
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
                      title="Hướng dẫn giặt ủi riêng"
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
            {normalizedExtraFee > 0 && (
              <div className="flex justify-between text-amber-700 font-bold">
                <span>Phụ phí yêu cầu đặc biệt:</span>
                <span className="font-mono tabular-nums">
                  +{normalizedExtraFee.toLocaleString("vi-VN")}đ
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Chênh lệch tổng:</span>
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

            {diffAmount !== 0 ? (
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Có chênh lệch giá ({diffAmount > 0 ? "+" : ""}
                  {diffAmount.toLocaleString("vi-VN")}đ) → Hệ thống sẽ gửi thông báo chờ khách xác nhận trước khi giặt.
                </span>
              </div>
            ) : (
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Khối lượng thực tế khớp với tạm tính → Sẵn sàng đưa vào giặt sấy ngay.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <ButtonOutLine
            type="button"
            label="Đóng"
            onClick={onClose}
            className="sm:!w-28"
          />

          <ButtonCustom
            type="button"
            isSecondary
            iconStart={<Send className="w-4 h-4 text-amber-600" />}
            label="Gửi Khách Duyệt Giá & Cân Nặng"
            onClick={() =>
              onSave(order.id, {
                items,
                weightConfirmStatus: "waiting_customer",
                status: "waiting_confirm",
                notes,
                extraFee: normalizedExtraFee,
                extraFeeReason: extraFeeReason.trim(),
                paymentStatus,
              })
            }
            className="sm:!w-auto"
          />

          <ButtonCustom
            type="button"
            iconStart={<CheckCircle2 className="w-4 h-4" />}
            label={
              diffAmount !== 0
                ? "Lưu Kết Quả Cân & Báo Khách"
                : "Khớp Khối Lượng · Bắt Đầu Giặt Ngay"
            }
            onClick={() =>
              onSave(order.id, {
                items,
                weightConfirmStatus:
                  diffAmount !== 0 ? "waiting_customer" : "accepted",
                status: diffAmount !== 0 ? "waiting_confirm" : "washing",
                notes,
                extraFee: normalizedExtraFee,
                extraFeeReason: extraFeeReason.trim(),
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
