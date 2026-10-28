import React from "react";
import { Scale, CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { LaundryOrder } from "../../../../types";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";

interface WeightComparisonCardProps {
  order: LaundryOrder;
  processingId: string | null;
  onAcceptWeight: (orderId: string) => void;
  onRejectWeight: (orderId: string) => void;
}

export const WeightComparisonCard: React.FC<WeightComparisonCardProps> = ({
  order,
  processingId,
  onAcceptWeight,
  onRejectWeight,
}) => {
  const isWaiting =
    order.weightConfirmStatus === "waiting_customer" ||
    order.status === "waiting_confirm";

  const estimatedSub =
    order.estimatedSubtotal ??
    order.items.reduce(
      (s, i) =>
        s +
        (i.estimatedLineTotal ??
          (i.estimatedQuantity || i.quantity) * i.unitPrice),
      0
    );

  const actualSub = order.actualSubtotal ?? order.subtotal;
  const deltaSub = actualSub - estimatedSub;

  return (
    <div
      className={`bg-white rounded-2xl border p-4 space-y-3.5 ${
        isWaiting ? "border-amber-300" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-mono font-black text-blue-600">
              #{order.id}
            </span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span
              className={`font-bold ${
                isWaiting
                  ? "text-amber-600"
                  : order.weightConfirmStatus === "accepted"
                    ? "text-emerald-600"
                    : "text-slate-500"
              }`}
            >
              {isWaiting
                ? "Chờ bạn duyệt cân thực tế"
                : order.weightConfirmStatus === "accepted"
                  ? "Đã đồng ý khối lượng thực tế"
                  : order.weightConfirmStatus === "rejected_return"
                    ? "Đã từ chối — Đang hoàn trả"
                    : "Chưa cân tại tiệm"}
            </span>
          </div>
          <h4 className="font-black text-slate-900 text-sm mt-0.5">
            {order.storeName || "Tiệm Giặt Sạch Sẽ"}
          </h4>
        </div>

        <div className="text-right font-mono">
          <div className="text-xs text-slate-400">Tổng sau cân</div>
          <div className="text-base font-black text-blue-600">
            {order.totalPrice.toLocaleString("vi-VN")}đ
          </div>
        </div>
      </div>

      {/* Line-by-line Estimated vs Actual Weight Comparison */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-amber-600" />
          <span>Bảng đối chiếu từng dòng đồ (Order_Details):</span>
        </div>

        <div className="space-y-2">
          {order.items.map((item, idx) => {
            const estQty = item.estimatedQuantity ?? item.quantity;
            const actQty = item.actualQuantity ?? item.quantity;
            const estTotal =
              item.estimatedLineTotal ?? estQty * item.unitPrice;
            const actTotal = item.actualLineTotal ?? actQty * item.unitPrice;

            return (
              <div
                key={`${item.serviceId}-${idx}`}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>
                    Dòng #{idx + 1}: {item.serviceName}
                  </span>
                  <span className="text-slate-500 font-normal">
                    {item.fabricType || "Cotton tiêu chuẩn"}
                  </span>
                </div>

                <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-200/60">
                  <div className="text-slate-500">
                    Tạm tính: {estQty} {item.unitName} (
                    {estTotal.toLocaleString("vi-VN")}đ)
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="font-black text-slate-900">
                    Thực tế: {actQty} {item.unitName} (
                    <span className="text-blue-600">
                      {actTotal.toLocaleString("vi-VN")}đ
                    </span>
                    )
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Difference */}
      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs">
        <span className="text-slate-700 font-semibold">
          Chênh lệch sau khi chủ tiệm cân thực tế:
        </span>
        <span
          className={`font-mono font-black ${
            deltaSub > 0
              ? "text-amber-700"
              : deltaSub < 0
                ? "text-emerald-700"
                : "text-slate-700"
          }`}
        >
          {deltaSub > 0 ? "+" : ""}
          {deltaSub.toLocaleString("vi-VN")}đ
        </span>
      </div>

      {isWaiting && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <ButtonCustom
            type="button"
            loading={processingId === order.id}
            onClick={() => onAcceptWeight(order.id)}
            iconStart={<CheckCircle2 className="w-4 h-4" />}
            label="Đồng Ý Giá Thực Tế & Giặt Ngay"
            className="!h-11 !text-xs"
            textClassName="!text-xs"
          />
          <ButtonOutLine
            type="button"
            disabled={processingId === order.id}
            onClick={() => onRejectWeight(order.id)}
            iconStart={<RotateCcw className="w-4 h-4" />}
            label="Từ Chối & Yêu Cầu Hoàn Trả Đồ"
            className="!h-11 !text-xs"
            textClassName="!text-xs"
          />
        </div>
      )}
    </div>
  );
};
