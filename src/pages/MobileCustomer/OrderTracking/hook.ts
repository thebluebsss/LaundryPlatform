import { useState, useEffect, useCallback } from "react";
import { laundryOrdersAPI, reviewsAPI } from "../../../services/api";
import { LaundryOrder, OrderReview, OrderChatMessage } from "../../../types";
import { useToast } from "../../../components/Toast";
import { getScopedProfile } from "../../../utils/authStorage";
import { useRealtimeOrders } from "../../../utils/realtimeClient";

export const useMobileCustomerTracking = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, OrderReview>>({});
  const [loading, setLoading] = useState(false);
  const [qrOrder, setQrOrder] = useState<LaundryOrder | null>(null);
  const [chatOrder, setChatOrder] = useState<LaundryOrder | null>(null);
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

  // Real-time SSE updates for Live GPS, Chat, Payment Webhook, and Order Status
  useRealtimeOrders(
    useCallback((event) => {
      if (event.type === "DRIVER_GPS_UPDATED" && event.data?.orderId) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === event.data.orderId
              ? { ...o, driverLocation: event.data.driverLocation }
              : o
          )
        );
      } else if (event.type === "ORDER_CHAT_MESSAGE" && event.data?.orderId) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === event.data.orderId
              ? { ...o, messages: event.data.messages }
              : o
          )
        );
      } else if (
        event.type === "ORDER_PAYMENT_RECONCILED" &&
        event.data?.order
      ) {
        const updated = event.data.order;
        setOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
        );
      } else if (event.type === "ORDER_UPDATED" && event.data?.id) {
        const updated = event.data;
        if (updated.deleted) {
          setOrders((prev) => prev.filter((o) => o.id !== updated.id));
        } else {
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
          );
        }
      }
    }, [])
  );

  const handleConfirmPaid = async (orderId: string) => {
    setProcessingPayment(true);
    try {
      await laundryOrdersAPI.updateStatus(orderId, {
        paymentStatus: "paid",
      });
      showToast(`Đã xác nhận thanh toán cho đơn #${orderId}!`, "success");
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

  const handleMessagesChanged = useCallback(
    (orderId: string, messages: OrderChatMessage[]) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, messages } : o))
      );
    },
    []
  );

  return {
    orders,
    reviewsMap,
    loading,
    qrOrder,
    setQrOrder,
    chatOrder,
    setChatOrder,
    reviewingOrder,
    setReviewingOrder,
    processingPayment,
    fetchOrders,
    handleConfirmPaid,
    handleCancelPendingOrder,
    handleReviewSaved,
    handleMessagesChanged,
  };
};
