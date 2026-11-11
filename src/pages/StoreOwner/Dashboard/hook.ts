import { useState, useEffect, useCallback, useMemo } from "react";
import {
  storesAPI,
  laundryOrdersAPI,
  equipmentAPI,
  deliveryAPI,
  reviewsAPI,
} from "../../../services/api";
import {
  LaundryStore,
  LaundryOrder,
  LaundryEquipment,
  DeliveryTask,
  OrderReview,
} from "../../../types";
import { useToast } from "../../../components/Toast";

export const useStoreOwnerDashboard = () => {
  const { showToast } = useToast();

  const [stores, setStores] = useState<LaundryStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [equipmentList, setEquipmentList] = useState<LaundryEquipment[]>([]);
  const [deliveryTasks, setDeliveryTasks] = useState<DeliveryTask[]>([]);
  const [storeReviews, setStoreReviews] = useState<OrderReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const currentStore = useMemo(
    () => stores.find((s) => s.id === selectedStoreId) || stores[0] || null,
    [stores, selectedStoreId]
  );

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [storesRes, ordersRes, eqRes, tasksRes, revRes] =
        await Promise.allSettled([
          storesAPI.getAll(),
          laundryOrdersAPI.getAll(),
          equipmentAPI.getAll(
            selectedStoreId ? { storeId: selectedStoreId } : undefined
          ),
          deliveryAPI.getAvailableTasks(),
          reviewsAPI.getAll(
            selectedStoreId ? { storeId: selectedStoreId } : undefined
          ),
        ]);

      if (storesRes.status === "fulfilled") {
        const sData = storesRes.value.data?.data;
        const list: LaundryStore[] = Array.isArray(sData)
          ? sData
          : sData?.stores || [];
        setStores(list);
        if (list.length > 0 && !selectedStoreId) {
          setSelectedStoreId(list[0].id);
        }
      }

      if (ordersRes.status === "fulfilled") {
        const oData =
          ordersRes.value.data?.data?.orders ||
          ordersRes.value.data?.data ||
          [];
        if (Array.isArray(oData)) {
          setOrders(oData);
        }
      }

      if (eqRes.status === "fulfilled") {
        const eData = eqRes.value.data?.data || [];
        if (Array.isArray(eData)) {
          setEquipmentList(eData);
        }
      }

      if (tasksRes.status === "fulfilled") {
        const tData = tasksRes.value.data?.data || [];
        if (Array.isArray(tData)) {
          setDeliveryTasks(tData);
        }
      }

      if (revRes.status === "fulfilled") {
        const rData = revRes.value.data?.data?.reviews || [];
        if (Array.isArray(rData)) {
          setStoreReviews(rData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch store owner dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleReplyReview = async (reviewId: string, replyText: string) => {
    if (!replyText.trim()) {
      showToast("Vui lòng nhập nội dung phản hồi khách hàng", "warning");
      return;
    }
    try {
      const res = await reviewsAPI.reply(reviewId, replyText.trim());
      const updated = res.data?.data;
      setStoreReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId || r.orderId === reviewId
            ? { ...r, storeReply: updated?.storeReply || replyText.trim() }
            : r
        )
      );
      showToast("Đã gửi phản hồi của cửa hàng tới đánh giá khách hàng!", "success");
    } catch {
      showToast("Không thể gửi phản hồi lúc này", "error");
    }
  };

  const handleUpdateStoreStatus = async (
    nextStatus: "open" | "busy" | "closed"
  ) => {
    if (!currentStore) return;
    try {
      await storesAPI.update(currentStore.id, { status: nextStatus });
      setStores((prev) =>
        prev.map((s) =>
          s.id === currentStore.id ? { ...s, status: nextStatus } : s
        )
      );
      showToast(
        `Đã chuyển trạng thái cửa hàng "${currentStore.name}" sang ${
          nextStatus === "open"
            ? "Đang mở cửa"
            : nextStatus === "busy"
            ? "Đang quá tải"
            : "Đóng cửa tạm thời"
        }`,
        "success"
      );
    } catch {
      showToast("Không thể cập nhật trạng thái cửa hàng", "error");
    }
  };

  // Computed KPIs
  const totalBranchRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  }, [orders]);

  const pendingWeighOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status !== "cancelled" &&
        o.status !== "completed" &&
        (!o.weightConfirmStatus || o.weightConfirmStatus === "not_weighed")
    );
  }, [orders]);

  const waitingCustomerConfirmOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.weightConfirmStatus === "waiting_customer" ||
        o.status === "waiting_confirm"
    );
  }, [orders]);

  const activeWashingOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === "washing" ||
        o.status === "ironing" ||
        o.status === "sorting"
    );
  }, [orders]);

  const workingMachinesCount = useMemo(() => {
    return equipmentList.filter((e) => e.status === "working").length;
  }, [equipmentList]);

  const weeklyChartData = useMemo(() => {
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    return days.map((day) => ({
      day,
      orders: orders.length,
      revenue: totalBranchRevenue > 0 ? Math.round(totalBranchRevenue / 7) : 0,
    }));
  }, [orders.length, totalBranchRevenue]);

  return {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    currentStore,
    orders,
    equipmentList,
    deliveryTasks,
    storeReviews,
    loading,
    totalBranchRevenue,
    pendingWeighOrders,
    waitingCustomerConfirmOrders,
    activeWashingOrders,
    workingMachinesCount,
    weeklyChartData,
    fetchDashboardData,
    handleUpdateStoreStatus,
    handleReplyReview,
  };
};
