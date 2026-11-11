import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  QrCode,
  Phone,
  Scale,
  Truck,
  CheckCircle2,
  Clock,
  Star,
  MessageSquareReply,
  Bike,
  RotateCcw,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMobileCustomerTracking } from "./hook";
import { VietQrSheetModal } from "./components/VietQrSheetModal";
import { OrderReviewModal } from "../../../components/OrderReviewModal";
import { OrderStatus } from "../../../types";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";
import {
  CUSTOMER_ORDER_STAGES,
  ORDER_STATUS_LABELS,
} from "../../../utils/orderStatusLabels";

const ORDER_STAGES = CUSTOMER_ORDER_STAGES;

export const MobileCustomerTracking: React.FC = () => {
  const navigate = useNavigate();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const {
    orders,
    reviewsMap,
    loading,
    qrOrder,
    setQrOrder,
    reviewingOrder,
    setReviewingOrder,
    processingPayment,
    fetchOrders,
    handleConfirmPaid,
    handleCancelPendingOrder,
    handleReviewSaved,
  } = useMobileCustomerTracking();

  const getStageIndex = (status: OrderStatus) => {
    if (status === "returning") return 3;
    const idx = ORDER_STAGES.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-slate-900">
            Theo Dõi & Lịch Sử Đơn Giặt ({orders.length})
          </h2>
          <p className="text-xs text-slate-500">
            Xem tiến độ giặt sấy, chi tiết hóa đơn & đánh giá cửa hàng, tài xế
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const currentStepIdx = getStageIndex(order.status);
          const isWaitingWeight =
            order.weightConfirmStatus === "waiting_customer" ||
            order.status === "waiting_confirm";
          const existingReview = reviewsMap[order.id];
          const isExpanded = expandedOrderId === order.id;

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5"
            >
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
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm mt-0.5">
                    {order.items.map((i) => i.serviceName).join(" + ")}
                  </h4>
                </div>
                <div className="text-right font-mono shrink-0">
                  <div className="text-sm font-black text-blue-600">
                    {order.totalPrice.toLocaleString("vi-VN")}đ
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedOrderId(isExpanded ? null : order.id)
                    }
                    className="text-[11px] font-sans font-bold text-blue-600 flex items-center gap-0.5 ml-auto mt-0.5 cursor-pointer"
                  >
                    <span>Chi tiết ({order.items.length} dòng)</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* KH-UC7.2: Xem chi tiết hóa đơn và từng dòng đồ giặt */}
              {isExpanded && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="font-black text-slate-800 uppercase tracking-wider text-[10px]">
                    Chi tiết từng dòng đồ giặt (Order_Details)
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
                        <span className="font-mono font-bold text-slate-900">
                          {(qty * it.unitPrice).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    );
                  })}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                    <span>Phí giao nhận 2 chiều:</span>
                    <span className="font-mono">
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
                          order.status === "cancelled" ||
                          order.status === "returning"
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
                        order.status === "cancelled" ||
                        order.status === "returning"
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
                      <strong className="text-slate-900">
                        {order.shipperName}
                      </strong>
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
                      onClick={() => setReviewingOrder(order)}
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
                      onClick={() => navigate("/mobile-customer/weight-confirm")}
                      iconStart={<Scale className="w-4 h-4" />}
                      label="Duyệt Khối Lượng Thực Tế Ngay"
                      className="!h-10 !text-xs"
                      textClassName="!text-xs"
                    />
                  )}

                  {order.paymentStatus !== "paid" &&
                    order.status !== "cancelled" && (
                      <ButtonOutLine
                        type="button"
                        onClick={() => setQrOrder(order)}
                        iconStart={<QrCode className="w-4 h-4" />}
                        label="Thanh Toán Mã VietQR"
                        className="!h-10 !text-xs"
                        textClassName="!text-xs"
                      />
                    )}

                  {/* KH-UC6.4: Hủy đơn hàng (Khi đơn đang chờ xác nhận) */}
                  {order.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleCancelPendingOrder(order.id)}
                      className="h-10 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Hủy Đơn</span>
                    </button>
                  )}

                  {order.paymentStatus === "paid" && !isWaitingWeight && (
                    <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã thanh toán</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* KH-UC7.4: Đặt lại đơn giặt tương tự */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/mobile-customer/create-order?storeId=${encodeURIComponent(
                          order.storeId || "store-q1"
                        )}`
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt Lại Đơn Này</span>
                  </button>

                  {order.status === "completed" && !existingReview && (
                    <button
                      type="button"
                      onClick={() => setReviewingOrder(order)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Đánh Giá Cửa Hàng & Tài Xế</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <VietQrSheetModal
        order={qrOrder}
        processing={processingPayment}
        onClose={() => setQrOrder(null)}
        onConfirmPaid={handleConfirmPaid}
      />

      <OrderReviewModal
        order={reviewingOrder}
        existingReview={reviewingOrder ? reviewsMap[reviewingOrder.id] : null}
        onClose={() => setReviewingOrder(null)}
        onSaved={handleReviewSaved}
      />
    </div>
  );
};
