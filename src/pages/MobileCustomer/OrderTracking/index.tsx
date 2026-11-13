import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useMobileCustomerTracking } from "./hook";
import { VietQrSheetModal } from "./components/VietQrSheetModal";
import { CustomerOrderCard } from "./components/CustomerOrderCard";
import { OrderReviewModal } from "../../../components/OrderReviewModal";
import { ButtonOutLine } from "../../../components/ButtonCustom";

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
        <ButtonOutLine
          type="button"
          onClick={fetchOrders}
          iconStart={
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          }
          label="Làm mới"
          className="!w-auto !h-9 !px-3"
          textClassName="!text-xs"
        />
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <CustomerOrderCard
            key={order.id}
            order={order}
            existingReview={reviewsMap[order.id]}
            isExpanded={expandedOrderId === order.id}
            onToggleExpand={() =>
              setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
            }
            onOpenQr={(ord) => setQrOrder(ord)}
            onOpenReview={(ord) => setReviewingOrder(ord)}
            onCancelPending={handleCancelPendingOrder}
            onNavigateWeightConfirm={() =>
              navigate("/mobile-customer/weight-confirm")
            }
            onReorder={(storeId) =>
              navigate(
                `/mobile-customer/create-order?storeId=${encodeURIComponent(
                  storeId
                )}`
              )
            }
          />
        ))}
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
