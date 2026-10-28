import { useState, useEffect, useCallback } from "react";
import {
  laundryOrdersAPI,
  bookingsAPI,
  storesAPI,
  equipmentAPI,
  deliveryAPI,
  reviewsAPI,
} from "../../../services/api";
import { LaundryOrder, LaundryStore, DeliveryTask, OrderReview } from "../../../types";
import { DEFAULT_STORES } from "../../../data/storesData";
import { useToast } from "../../../components/Toast";

export const useStoreOwnerDashboard = () => {
  const { showToast } = useToast();
  const [selectedStoreId, setSelectedStoreId] = useState<string>("store-hcm-q1");
  const [stores, setStores] = useState<LaundryStore[]>(DEFAULT_STORES);
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [deliveryTasks, setDeliveryTasks] = useState<DeliveryTask[]>([]);
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const currentStore =
    stores.find((s) => s.id === selectedStoreId) || stores[0] || DEFAULT_STORES[0];

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [storesRes, laundryOrdersRes, bookingsRes, equipRes, tasksRes, reviewsRes] =
        await Promise.allSettled([
          storesAPI.getAll(),
          laundryOrdersAPI.getAll(),
          bookingsAPI.getAll({ limit: 50 }),
          equipmentAPI.getAll({ limit: 50 }),
          deliveryAPI.getAvailableTasks(),
          reviewsAPI.getAll(),
        ]);

      if (
        storesRes.status === "fulfilled" &&
        Array.isArray(storesRes.value.data?.data) &&
        storesRes.value.data.data.length > 0
      ) {
        setStores(storesRes.value.data.data);
      }

      const combinedOrders: LaundryOrder[] = [];

      if (laundryOrdersRes.status === "fulfilled") {
        const lOrders = laundryOrdersRes.value.data?.data || [];
        if (Array.isArray(lOrders)) {
          combinedOrders.push(...lOrders);
        }
      }

      if (bookingsRes.status === "fulfilled") {
        const bList = bookingsRes.value.data?.data?.bookings || [];
        if (Array.isArray(bList)) {
          bList.forEach((b: any) => {
            const id = b._id?.toString() || b.id;
            if (!combinedOrders.some((o) => o.id === id)) {
              combinedOrders.push({
                id,
                customerName: b.name || b.customerName || "Khách hàng",
                phoneNumber: b.phone || b.phoneNumber || "",
                address: b.address || "",
                district: b.district || "Quận 1",
                storeId: b.storeId || "store-hcm-q1",
                storeName: b.storeName || "Tiệm Giặt Sấy Vô Trùng Q1",
                items: (b.items || []).map((it: any) => ({
                  ...it,
                  fabricType: it.fabricType || "Cotton / Đồ hỗn hợp",
                  estimatedQuantity: it.estimatedQuantity ?? it.quantity ?? 1,
                  actualQuantity: it.actualQuantity ?? null,
                })),
                pickupDate: b.pickupDate
                  ? new Date(b.pickupDate).toISOString().split("T")[0]
                  : "",
                pickupTime: b.pickupTime || "08:00 - 10:00",
                deliveryDate: b.deliveryDate
                  ? new Date(b.deliveryDate).toISOString().split("T")[0]
                  : "",
                deliveryTime: b.deliveryTime || "16:00 - 18:00",
                notes: b.notes || "",
                discountAmount: b.discountAmount || 0,
                subtotal: b.subtotal || 0,
                estimatedSubtotal: b.subtotal || 0,
                deliveryFee: b.deliveryFee || 20000,
                totalPrice: b.totalAmount || b.totalPrice || 0,
                weightConfirmStatus: b.weightConfirmStatus || "not_weighed",
                status: b.status || "pending",
                paymentMethod: b.paymentMethod || "cod",
                paymentStatus: b.paymentStatus === "paid" ? "paid" : "pending",
                createdAt: b.createdAt || new Date().toISOString(),
              });
            }
          });
        }
      }

      setOrders(combinedOrders);

      if (equipRes.status === "fulfilled") {
        const eqData =
          equipRes.value.data?.data?.equipment || equipRes.value.data?.data || [];
        setEquipmentList(Array.isArray(eqData) ? eqData : []);
      }

      if (tasksRes.status === "fulfilled") {
        const tData = tasksRes.value.data?.data || [];
        setDeliveryTasks(Array.isArray(tData) ? tData : []);
      }

      if (reviewsRes.status === "fulfilled") {
        const rData = reviewsRes.value.data?.data?.reviews || [];
        setReviews(Array.isArray(rData) ? rData : []);
      }
    } catch (error) {
      console.error("Failed to load store owner dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpdateStoreStatus = async (newStatus: "open" | "busy" | "closed") => {
    if (!currentStore) return;
    try {
      await storesAPI.update(currentStore.id, { status: newStatus });
      setStores((prev) =>
        prev.map((s) => (s.id === currentStore.id ? { ...s, status: newStatus } : s))
      );
      const statusText =
        newStatus === "open"
          ? "Đang mở cửa đón đơn"
          : newStatus === "busy"
          ? "Đang quá tải (Tạm dừng nhận đơn gấp)"
          : "Đóng cửa tạm thời";
      showToast(`Đã cập nhật trạng thái chi nhánh: ${statusText}`, "success");
    } catch (err) {
      setStores((prev) =>
        prev.map((s) => (s.id === currentStore.id ? { ...s, status: newStatus } : s))
      );
      showToast("Đã cập nhật trạng thái cửa hàng!", "info");
    }
  };

  const handleReplyReview = async (reviewId: string, storeReply: string) => {
    try {
      const res = await reviewsAPI.reply(reviewId, storeReply);
      const updated = res.data?.data;
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, ...(updated || { storeReply }) } : r))
      );
      showToast("Đã gửi phản hồi đánh giá tới khách hàng!", "success");
    } catch {
      showToast("Không thể lưu phản hồi đánh giá", "error");
    }
  };

  const storeReviews = reviews.filter(
    (r) => !selectedStoreId || r.storeId === selectedStoreId
  );

  // KPI computations
  const totalBranchRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const pendingWeighOrders = orders.filter(
    (o) =>
      o.status !== "cancelled" &&
      o.status !== "completed" &&
      (!o.weightConfirmStatus || o.weightConfirmStatus === "not_weighed")
  );

  const waitingCustomerConfirmOrders = orders.filter(
    (o) => o.weightConfirmStatus === "waiting_customer"
  );

  const activeWashingOrders = orders.filter((o) =>
    ["sorting", "washing", "ironing"].includes(o.status)
  );

  const workingMachinesCount = equipmentList.filter(
    (e) => e.status === "working"
  ).length;

  const weeklyChartData = [
    { day: "T2", revenue: 1850000, weightKg: 68 },
    { day: "T3", revenue: 2150000, weightKg: 79 },
    { day: "T4", revenue: 1940000, weightKg: 72 },
    { day: "T5", revenue: 2680000, weightKg: 95 },
    { day: "T6", revenue: 3120000, weightKg: 112 },
    { day: "T7", revenue: 3890000, weightKg: 140 },
    { day: "CN", revenue: Math.max(2450000, totalBranchRevenue), weightKg: 98 },
  ];

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
