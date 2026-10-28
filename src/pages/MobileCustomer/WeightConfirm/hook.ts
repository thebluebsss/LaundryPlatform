import { useState, useEffect, useCallback, useMemo } from "react";
import { laundryOrdersAPI } from "../../../services/api";
import { LaundryOrder } from "../../../types";
import { useToast } from "../../../components/Toast";

export const useMobileCustomerWeightConfirm = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"waiting" | "all">("waiting");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await laundryOrdersAPI.getAll();
      setOrders(res.data?.data?.orders || []);
    } catch {
      showToast("Không thể tải danh sách đơn cần duyệt cân", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAcceptWeight = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await laundryOrdersAPI.updateStatus(orderId, {
        weightConfirmStatus: "accepted",
        status: "washing",
      });
      showToast(
        `Đã xác nhận khối lượng thực tế đơn #${orderId}! Cửa hàng bắt đầu giặt sấy ngay.`,
        "success"
      );
      await fetchOrders();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Lỗi khi xác nhận khối lượng",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectWeight = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await laundryOrdersAPI.updateStatus(orderId, {
        weightConfirmStatus: "rejected_return",
        status: "returning",
      });
      showToast(
        `Đã yêu cầu hoàn trả giỏ đồ đơn #${orderId}. Shipper sẽ nhận lại đồ trả về nhà bạn.`,
        "info"
      );
      await fetchOrders();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Lỗi khi gửi yêu cầu hoàn trả",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const waitingOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.weightConfirmStatus === "waiting_customer" ||
          o.status === "waiting_confirm"
      ),
    [orders]
  );

  const displayedOrders = filterMode === "waiting" ? waitingOrders : orders;

  return {
    orders: displayedOrders,
    waitingCount: waitingOrders.length,
    loading,
    processingId,
    filterMode,
    setFilterMode,
    fetchOrders,
    handleAcceptWeight,
    handleRejectWeight,
  };
};
