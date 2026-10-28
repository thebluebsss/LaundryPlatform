import { useState, useEffect, useCallback } from "react";
import { laundryOrdersAPI, reviewsAPI } from "../../../services/api";
import { LaundryOrder, OrderReview } from "../../../types";
import { useToast } from "../../../components/Toast";

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
      const [ordersRes, reviewsRes] = await Promise.allSettled([
        laundryOrdersAPI.getAll(),
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
    handleReviewSaved,
  };
};
