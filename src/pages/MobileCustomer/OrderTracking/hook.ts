import { useState, useEffect, useCallback } from "react";
import { laundryOrdersAPI, reviewsAPI } from "../../../services/api";
import { LaundryOrder, OrderReview } from "../../../types";
import { useToast } from "../../../components/Toast";
import { getScopedProfile } from "../../../utils/authStorage";

export const useMobileCustomerTracking = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, OrderReview>>({});
  const [loading, setLoading] = useState(false);
  const [qrOrder, setQrOrder] = useState<LaundryOrder | null>(null);
  const [reviewingOrder, setReviewingOrder] = useState<LaundryOrder | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const parsed = getScopedProfile("customer");
      const currentUserId = parsed?._id || parsed?.id || parsed?.username || "";

      const [ordersRes, reviewsRes] = await Promise.allSettled([
        laundryOrdersAPI.getAll(
          currentUserId ? { userId: currentUserId } : undefined
        ),
        reviewsAPI.getAll(),
      ]);

      if (ordersRes.status === "fulfilled") {
        const rawOrders =
          ordersRes.value.data?.data?.orders ||
          (Array.isArray(ordersRes.value.data?.data)
            ? ordersRes.value.data.data
            : []);
        setOrders(rawOrders);
      }

      if (reviewsRes.status === "fulfilled") {
        const list: OrderReview[] =
          reviewsRes.value.data?.data?.reviews || [];
        const map: Record<string, OrderReview> = {};
        list.forEach((r) => {
          if (r.orderId) map[r.orderId] = r;
        });
        setReviewsMap(map);
      }
    } catch {
      showToast("Không thể tải tiến độ đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleConfirmPaid = async (orderId: string) => {
    setProcessingPayment(true);
    try {
      await laundryOrdersAPI.updateStatus(orderId, {
        paymentStatus: "paid",
      });
      showToast(`Đã xác nhận thanh toán VietQR cho đơn #${orderId}!`, "success");
      setQrOrder(null);
      await fetchOrders();
    } catch {
      showToast("Không thể cập nhật trạng thái thanh toán", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelPendingOrder = async (orderId: string) => {
    try {
      await laundryOrdersAPI.updateStatus(orderId, { status: "cancelled" });
      showToast(
        `Đã hủy đơn hàng #${orderId} & thu hồi sóng gọi Shipper thành công!`,
        "info"
      );
      await fetchOrders();
    } catch {
      showToast("Không thể hủy đơn hàng lúc này", "error");
    }
  };

  const handleReviewSaved = (savedReview: OrderReview) => {
    setReviewsMap((prev) => ({
      ...prev,
      [savedReview.orderId]: savedReview,
    }));
  };

  return {
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
  };
};
