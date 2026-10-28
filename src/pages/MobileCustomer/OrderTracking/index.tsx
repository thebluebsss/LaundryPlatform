import React from "react";
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
} from "lucide-react";
import { useMobileCustomerTracking } from "./hook";
import { VietQrSheetModal } from "./components/VietQrSheetModal";
import { OrderReviewModal } from "../../../components/OrderReviewModal";
import { OrderStatus } from "../../../types";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";

const ORDER_STAGES: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "1. Đã đặt đơn" },
  { key: "picking_up", label: "2. Shipper lấy đồ" },
  { key: "sorting", label: "3. Tiệm đang phân loại" },
  { key: "waiting_confirm", label: "4. Chờ bạn duyệt cân" },
  { key: "washing", label: "5. Đang giặt sấy" },
  { key: "ironing", label: "6. Là ủi & Đóng gói" },
  { key: "delivering", label: "7. Đang giao trả" },
  { key: "completed", label: "8. Hoàn tất" },
];

export const MobileCustomerTracking: React.FC = () => {
  const navigate = useNavigate();
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
    handleReviewSaved,
  } = useMobileCustomerTracking();

  const getStageIndex = (status: OrderStatus) => {
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
            Xem tiến độ giặt sấy & đánh giá cửa hàng, tài xế khi đơn hoàn tất
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
                  <div className="text-[11px] text-slate-400">
                    {order.items.length} dòng đồ
                  </div>
                </div>
              </div>

              {/* 8-Step Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      Trạng thái:{" "}
                      <strong className="text-blue-600">
                        {ORDER_STAGES[currentStepIdx]?.label || order.status}
                      </strong>
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    Bước {currentStepIdx + 1}/{ORDER_STAGES.length}
                  </span>
                </div>

                <div className="grid grid-cols-8 gap-1">
                  {ORDER_STAGES.map((stage, idx) => (
                    <div
                      key={stage.key}
                      className={`h-2 rounded-full transition-colors ${
                        idx <= currentStepIdx ? "bg-blue-600" : "bg-slate-100"
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
                <div className="flex items-center gap-2">
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

                  {order.paymentStatus !== "paid" && (
                    <ButtonOutLine
                      type="button"
                      onClick={() => setQrOrder(order)}
                      iconStart={<QrCode className="w-4 h-4" />}
                      label="Thanh Toán Mã VietQR"
                      className="!h-10 !text-xs"
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
