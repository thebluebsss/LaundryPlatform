import React, { useState } from "react";
import {
  QrCode,
  Phone,
  Scale,
  Truck,
  CheckCircle2,
  Clock,
  Star,
  MessageSquareReply,
  MessageSquare,
  Navigation,
  Bike,
  RotateCcw,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LaundryOrder, OrderReview, OrderStatus } from "../../../../types";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";
import { OrderLiveGpsMap } from "../../../../components/OrderLiveGpsMap";
import {
  CUSTOMER_ORDER_STAGES,
  ORDER_STATUS_LABELS,
} from "../../../../utils/orderStatusLabels";

const ORDER_STAGES = CUSTOMER_ORDER_STAGES;

interface CustomerOrderCardProps {
  order: LaundryOrder;
  existingReview?: OrderReview;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenQr: (order: LaundryOrder) => void;
  onOpenChat: (order: LaundryOrder) => void;
  onOpenReview: (order: LaundryOrder) => void;
  onCancelPending: (orderId: string) => void;
  onNavigateWeightConfirm: () => void;
  onReorder: (storeId: string) => void;
}

export const CustomerOrderCard: React.FC<CustomerOrderCardProps> = ({
  order,
  existingReview,
  isExpanded,
  onToggleExpand,
  onOpenQr,
  onOpenChat,
  onOpenReview,
  onCancelPending,
  onNavigateWeightConfirm,
  onReorder,
}) => {
  const hasDriverAssigned = Boolean(
    (order.shipperId && order.shipperId.trim()) ||
      (order.shipperName && order.shipperName.trim())
  );

  const isDriverOnRoad =
    hasDriverAssigned &&
    (order.status === "picking_up" ||
      order.status === "delivering" ||
      order.status === "returning");

  const [showLiveMap, setShowLiveMap] = useState<boolean>(isDriverOnRoad);

  const getStageIndex = (status: OrderStatus) => {
    if (status === "returning") return 3;
    const idx = ORDER_STAGES.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStepIdx = getStageIndex(order.status);
  const isWaitingWeight =
    order.weightConfirmStatus === "waiting_customer" ||
    order.status === "waiting_confirm";
  const messageCount = Array.isArray(order.messages)
    ? order.messages.length
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span className="font-mono font-black text-blue-600">
              #{order.id}
            </span>
            <span aria-hidden="true">·</span>
            <span>{order.storeName || "Tiệm Giặt Sạch Sẽ"}</span>
            <span aria-hidden="true">·</span>
            <span
              className={`font-bold ${
                order.paymentStatus === "paid"
                  ? "text-emerald-600"
                  : "text-amber-600"
              }`}
            >
              {order.paymentStatus === "paid"
                ? `Đã thanh toán${
                    order.paymentTransactionId
                      ? ` (${order.paymentTransactionId})`
                      : ""
                  }`
                : "Chưa thanh toán"}
            </span>
          </div>
          <h4 className="font-black text-slate-900 text-sm mt-0.5">
            {order.items.map((i) => i.serviceName).join(" + ")}
          </h4>
        </div>
        <div className="text-right font-mono shrink-0">
          <div className="text-sm font-black text-blue-600 tabular-nums">
            {order.totalPrice.toLocaleString("vi-VN")}đ
          </div>
          <button
            type="button"
            onClick={onToggleExpand}
            className="text-[11px] font-sans font-bold text-blue-600 flex items-center gap-0.5 ml-auto mt-0.5 cursor-pointer"
          >
            <span>Chi tiết ({order.items.length} món)</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Xem chi tiết hóa đơn và từng món đồ giặt */}
      {order.customerSpecialRequest && (
        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
          <span className="font-black">Yêu cầu của bạn: </span>
          <span>“{order.customerSpecialRequest}”</span>
        </div>
      )}

      {Number(order.extraFee || 0) > 0 && (
        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between gap-2">
          <span className="text-slate-700 font-semibold">
            Phụ phí yêu cầu ({order.extraFeeReason || "Xử lý theo yêu cầu riêng"}):
          </span>
          <span className="font-mono font-black text-blue-700 shrink-0 tabular-nums">
            +{Number(order.extraFee).toLocaleString("vi-VN")}đ
          </span>
        </div>
      )}

      {isExpanded && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <div className="font-black text-slate-800 uppercase tracking-wider text-[10px]">
            Chi tiết các món đồ trong đơn
          </div>
          {order.items.map((it, iIdx) => {
            const qty = it.actualQuantity ?? it.estimatedQuantity ?? it.quantity;
            return (
              <div
                key={iIdx}
                className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1.5 last:border-0 last:pb-0"
              >
                <div>
                  <div className="font-bold text-slate-800">
                    {it.serviceName} ({qty} {it.unitName})
                  </div>
                  {it.fabricType && (
                    <div className="text-[11px] text-slate-500">
                      Chất vải: {it.fabricType}
                      {it.careInstructions ? ` · ${it.careInstructions}` : ""}
                    </div>
                  )}
                </div>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {(qty * it.unitPrice).toLocaleString("vi-VN")}đ
                </span>
              </div>
            );
          })}
          {Number(order.extraFee || 0) > 0 && (
            <div className="pt-1 flex items-center justify-between text-[11px] text-amber-800 font-semibold border-t border-slate-200">
              <span>
                Phụ phí ({order.extraFeeReason || "Yêu cầu đặc biệt"}):
              </span>
              <span className="font-mono tabular-nums">
                +{Number(order.extraFee).toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
            <span>Phí giao nhận 2 chiều:</span>
            <span className="font-mono tabular-nums">
              {(order.deliveryFee || 20000).toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>
      )}

      {/* 8-Step Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Tiến độ:{" "}
              <strong
                className={
                  order.status === "cancelled" || order.status === "returning"
                    ? "text-rose-600"
                    : "text-blue-600"
                }
              >
                {ORDER_STATUS_LABELS[order.status] ||
                  ORDER_STAGES[currentStepIdx]?.label ||
                  order.status}
              </strong>
            </span>
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            {order.status === "cancelled"
              ? "Đã hủy"
              : `Bước ${currentStepIdx + 1}/${ORDER_STAGES.length}`}
          </span>
        </div>

        <div className="grid grid-cols-8 gap-1">
          {ORDER_STAGES.map((stage, idx) => (
            <div
              key={stage.key}
              className={`h-2 rounded-full transition-colors ${
                order.status === "cancelled" || order.status === "returning"
                  ? "bg-rose-200"
                  : idx <= currentStepIdx
                    ? "bg-blue-600"
                    : "bg-slate-100"
              }`}
              title={stage.label}
            />
          ))}
        </div>
      </div>

      {/* Shipper Info if Assigned */}
      {order.shipperName && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-slate-500">Shipper phụ trách: </span>
              <strong className="text-slate-900">{order.shipperName}</strong>
            </div>
          </div>
          {order.shipperPhone && (
            <a
              href={`tel:${order.shipperPhone}`}
              className="font-mono font-bold text-blue-600 flex items-center gap-1 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              {order.shipperPhone}
            </a>
          )}
        </div>
      )}

      {/* Live GPS Tracking Map Section */}
      {showLiveMap && hasDriverAssigned && order.status !== "cancelled" && (
        <OrderLiveGpsMap order={order} heightClassName="h-[230px]" compact />
      )}

      {/* Display Existing Review & Store Reply if already reviewed */}
      {existingReview && (
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-black text-amber-900 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Đánh giá của bạn ({existingReview.id})
            </span>
            <button
              type="button"
              onClick={() => onOpenReview(order)}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Chỉnh sửa
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-white border border-amber-100">
              <div className="text-slate-500">Chất lượng Tiệm:</div>
              <div className="font-black text-amber-600 mt-0.5">
                {existingReview.storeRating} ★ / 5
              </div>
              {existingReview.storeComment && (
                <p className="text-slate-700 mt-1 line-clamp-2">
                  “{existingReview.storeComment}”
                </p>
              )}
            </div>
            <div className="p-2 rounded-xl bg-white border border-emerald-100">
              <div className="text-slate-500 flex items-center gap-1">
                <Bike className="w-3 h-3 text-emerald-600" />
                <span>Shipper:</span>
              </div>
              <div className="font-black text-emerald-600 mt-0.5">
                {existingReview.shipperRating} ★ / 5
              </div>
              {existingReview.shipperComment && (
                <p className="text-slate-700 mt-1 line-clamp-2">
                  “{existingReview.shipperComment}”
                </p>
              )}
            </div>
          </div>

          {existingReview.storeReply && (
            <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/70 text-[11px] text-slate-700">
              <div className="font-black text-blue-700 flex items-center gap-1 mb-0.5">
                <MessageSquareReply className="w-3.5 h-3.5" />
                <span>Phản hồi từ Chủ tiệm giặt:</span>
              </div>
              <p>{existingReview.storeReply}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {isWaitingWeight && (
            <ButtonCustom
              type="button"
              onClick={onNavigateWeightConfirm}
              iconStart={<Scale className="w-4 h-4" />}
              label="Duyệt Khối Lượng Thực Tế Ngay"
              className="!w-auto !h-10 !text-xs"
              textClassName="!text-xs"
            />
          )}

          {order.paymentStatus !== "paid" && order.status !== "cancelled" && (
            <ButtonOutLine
              type="button"
              onClick={() => onOpenQr(order)}
              iconStart={<QrCode className="w-4 h-4" />}
              label="Thanh Toán & Đối Soát Tự Động"
              className="!w-auto !h-10 !text-xs"
              textClassName="!text-xs"
            />
          )}

          {hasDriverAssigned && order.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => setShowLiveMap(!showLiveMap)}
              className={`h-10 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                showLiveMap
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{showLiveMap ? "Ẩn Live GPS" : "Live GPS Tài Xế"}</span>
            </button>
          )}

          <button
            type="button"
            disabled={!hasDriverAssigned}
            onClick={() => hasDriverAssigned && onOpenChat(order)}
            title={
              hasDriverAssigned
                ? "Mở kênh Chat nội bộ đơn hàng"
                : "Chưa có tài xế nhận chuyến nên chưa thể nhắn tin"
            }
            className={`h-10 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              hasDriverAssigned
                ? "bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200 cursor-pointer"
                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            }`}
          >
            <MessageSquare
              className={`w-3.5 h-3.5 ${
                hasDriverAssigned ? "text-teal-600" : "text-slate-400"
              }`}
            />
            <span>
              {hasDriverAssigned
                ? "Chat đơn hàng"
                : "Chat (Chờ tài xế nhận chuyến)"}
            </span>
            {hasDriverAssigned && messageCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-teal-600 text-white font-mono text-[10px] font-black">
                {messageCount}
              </span>
            )}
          </button>

          {order.status === "pending" && (
            <ButtonOutLine
              type="button"
              onClick={() => onCancelPending(order.id)}
              iconStart={<XCircle className="w-4 h-4" />}
              label="Hủy Đơn"
              className="!w-auto !h-10 !px-3 !border-rose-200 !bg-rose-50 hover:!bg-rose-100 !text-rose-600"
              textClassName="!text-xs"
            />
          )}

          {order.paymentStatus === "paid" && !isWaitingWeight && (
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã thanh toán</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ButtonOutLine
            type="button"
            onClick={() => onReorder(order.storeId || "store-q1")}
            iconStart={<RotateCcw className="w-3.5 h-3.5" />}
            label="Đặt Lại Đơn Này"
            className="!w-auto !h-9 !px-3"
            textClassName="!text-xs"
          />

          {order.status === "completed" && !existingReview && (
            <ButtonCustom
              type="button"
              onClick={() => onOpenReview(order)}
              iconStart={<Star className="w-3.5 h-3.5 fill-current" />}
              label="Đánh Giá Cửa Hàng & Tài Xế"
              className="!w-auto !h-9 !px-3.5 !bg-amber-500 hover:!bg-amber-400 !text-slate-950"
              textClassName="!text-xs !font-black"
            />
          )}
        </div>
      </div>
    </div>
  );
};
