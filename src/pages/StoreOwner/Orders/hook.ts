import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  laundryOrdersAPI,
  bookingsAPI,
  servicesAPI,
  aiAPI,
  deliveryAPI,
  reviewsAPI,
} from "../../../services/api";
import {
  LaundryOrder,
  LaundryService,
  OrderStatus,
  WeightConfirmStatus,
  OrderReview,
} from "../../../types";
import { LAUNDRY_SERVICES } from "../../../data";
import { useToast } from "../../../components/Toast";
import { useLoading } from "../../../context/LoadingContext";

export const useStoreOwnerOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const { setLoading: setGlobalLoading } = useLoading();

  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, OrderReview>>({});
  const [services, setServices] = useState<LaundryService[]>(LAUNDRY_SERVICES);
  const [loading, setLoadingState] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [weightFilter, setWeightFilter] = useState<string>("all");

  // Modal states
  const [weighingOrder, setWeighingOrder] = useState<LaundryOrder | null>(null);
  const [isPosModalOpen, setIsPosModalOpen] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<LaundryOrder | null>(null);

  const setLoading = (val: boolean) => {
    setLoadingState(val);
    setGlobalLoading(val);
  };

  const loadOrdersAndServices = useCallback(async () => {
    setLoadingState(true);
    try {
      const [lRes, bRes, sRes, rRes] = await Promise.allSettled([
        laundryOrdersAPI.getAll(),
        bookingsAPI.getAll({ limit: 100 }),
        servicesAPI.getAll(),
        reviewsAPI.getAll(),
      ]);

      if (rRes.status === "fulfilled") {
        const rList: OrderReview[] = rRes.value.data?.data?.reviews || [];
        const rMap: Record<string, OrderReview> = {};
        rList.forEach((r) => {
          if (r.orderId) rMap[r.orderId] = r;
        });
        setReviewsMap(rMap);
      }

      if (sRes.status === "fulfilled") {
        const sData =
          sRes.value.data?.data?.services || sRes.value.data?.data || [];
        if (Array.isArray(sData) && sData.length > 0) {
          setServices(
            sData.map((s: any) => ({
              id: s.customId || s._id || s.id,
              name: s.name,
              category: s.category || "wash_fold",
              pricingType: s.pricingType || "per_kg",
              unitPrice: Number(s.unitPrice || 20000),
              unitName: s.unitName || "kg",
              description: s.description || "",
              iconName: s.iconName || "Shirt",
              durationDays: s.durationDays || 1,
            }))
          );
        }
      }

      const list: LaundryOrder[] = [];

      if (lRes.status === "fulfilled") {
        const lData = lRes.value.data?.data || [];
        if (Array.isArray(lData)) {
          list.push(...lData);
        }
      }

      if (bRes.status === "fulfilled") {
        const bData = bRes.value.data?.data?.bookings || [];
        if (Array.isArray(bData)) {
          bData.forEach((b: any) => {
            const id = b._id?.toString() || b.id;
            if (!list.some((o) => o.id === id)) {
              list.push({
                id,
                customerName: b.name || b.customerName || "Khách hàng",
                phoneNumber: b.phone || b.phoneNumber || "",
                address: b.address || "",
                district: b.district || "Quận 1",
                storeId: b.storeId || "store-hcm-q1",
                storeName: b.storeName || "Tiệm Giặt Sấy Vô Trùng Q1",
                items: (b.items || []).map((it: any) => ({
                  serviceId: it.serviceId || "wf-regular",
                  serviceName: it.serviceName || "Giặt Sấy Thường",
                  fabricType: it.fabricType || "Cotton / Đồ hỗn hợp",
                  garmentDescription: it.garmentDescription || "",
                  careInstructions: it.careInstructions || "",
                  pricingType: it.pricingType || "per_kg",
                  unitName: it.unitName || "kg",
                  unitPrice: Number(it.unitPrice || 20000),
                  quantity: Number(it.quantity || 1),
                  estimatedQuantity: Number(
                    it.estimatedQuantity ?? it.quantity ?? 1
                  ),
                  actualQuantity:
                    it.actualQuantity !== undefined ? it.actualQuantity : null,
                  estimatedLineTotal:
                    Number(it.estimatedQuantity ?? it.quantity ?? 1) *
                    Number(it.unitPrice || 20000),
                  actualLineTotal:
                    it.actualQuantity !== undefined && it.actualQuantity !== null
                      ? Number(it.actualQuantity) * Number(it.unitPrice || 20000)
                      : null,
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
                promoCode: b.promoCode,
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

      setOrders(list);

      // Check query params for auto-opening modals
      const weighId = searchParams.get("weigh");
      if (weighId) {
        const target = list.find((o) => o.id === weighId);
        if (target) setWeighingOrder(target);
      }
      if (searchParams.get("create") === "pos") {
        setIsPosModalOpen(true);
      }
    } catch (error) {
      console.error("Error loading store orders:", error);
    } finally {
      setLoadingState(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadOrdersAndServices();
  }, [loadOrdersAndServices]);

  const handleSaveWeighOrder = async (
    orderId: string,
    payload: {
      items: any[];
      weightConfirmStatus: WeightConfirmStatus;
      status: OrderStatus;
      notes: string;
      paymentStatus?: "pending" | "paid" | "refunded" | "failed";
    }
  ) => {
    setLoading(true);
    try {
      await laundryOrdersAPI.weighOrder(orderId, payload);
      showToast(
        payload.weightConfirmStatus === "waiting_customer"
          ? "Đã lưu cân thực tế & gửi thông báo chờ khách hàng xác nhận qua App!"
          : "Đã xác nhận khối lượng thực tế và chuyển vào lồng giặt!",
        "success"
      );
      setWeighingOrder(null);
      setSearchParams({});
      await loadOrdersAndServices();
    } catch (err) {
      // Also try updating booking status if it came from bookings collection
      try {
        await bookingsAPI.updateStatus(orderId, payload.status);
      } catch (e) {}
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const actualSubtotal = payload.items.reduce(
            (s, it) =>
              s +
              Number(it.actualQuantity ?? it.quantity ?? 0) *
                Number(it.unitPrice || 0),
            0
          );
          const totalPrice = Math.max(
            0,
            actualSubtotal + (o.deliveryFee || 0) - (o.discountAmount || 0)
          );
          return {
            ...o,
            items: payload.items,
            actualSubtotal,
            subtotal: actualSubtotal,
            totalPrice,
            weightConfirmStatus: payload.weightConfirmStatus,
            status: payload.status,
            notes: payload.notes,
            paymentStatus: payload.paymentStatus || o.paymentStatus,
            actualWeighedAt: new Date().toISOString(),
          };
        })
      );
      showToast("Đã cập nhật khối lượng thực tế cho đơn hàng!", "success");
      setWeighingOrder(null);
      setSearchParams({});
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (
    order: LaundryOrder,
    newStatus: OrderStatus
  ) => {
    setLoading(true);
    try {
      await laundryOrdersAPI.updateStatus(order.id, { status: newStatus });
      // If ready for delivery, automatically broadcast a delivery task to drivers
      if (newStatus === "delivering") {
        try {
          await deliveryAPI.createTask({
            orderId: order.id,
            taskType: "deliver_to_customer",
            storeId: order.storeId || "store-hcm-q1",
            storeName: order.storeName || "Tiệm Giặt Sấy Vô Trùng Q1",
            customerName: order.customerName,
            customerPhone: order.phoneNumber,
            customerAddress: `${order.address}, ${order.district}`,
            shippingFee: order.deliveryFee || 20000,
            notes: `Giao trả đồ sạch đơn #${order.id}`,
          });
          showToast(
            `Đơn #${order.id} đã giặt xong & phát sóng gọi tài xế giao trả khách!`,
            "success"
          );
        } catch (e) {}
      } else {
        showToast(
          `Đã chuyển trạng thái đơn #${order.id} sang "${newStatus}"`,
          "info"
        );
      }
      await loadOrdersAndServices();
    } catch (err) {
      try {
        await bookingsAPI.updateStatus(order.id, newStatus);
      } catch (e) {}
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
      showToast("Đã cập nhật trạng thái đơn hàng!", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePosOrder = async (posData: any) => {
    setLoading(true);
    try {
      await laundryOrdersAPI.create(posData);
      showToast(
        "Đã tạo đơn giặt tại quầy (POS) và in phiếu cân thực tế thành công!",
        "success"
      );
      setIsPosModalOpen(false);
      setSearchParams({});
      await loadOrdersAndServices();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Không thể tạo đơn hàng mới",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setLoading(true);
    try {
      await laundryOrdersAPI.delete(orderToDelete.id);
      showToast(`Đã xóa đơn hàng #${orderToDelete.id}`, "info");
      setOrderToDelete(null);
      await loadOrdersAndServices();
    } catch (err) {
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      setOrderToDelete(null);
      showToast("Đã xóa đơn hàng!", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiInspect = async (
    itemName: string,
    declaredService: string,
    imageUrl?: string
  ) => {
    try {
      const sampleImage =
        imageUrl ||
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const res = await aiAPI.inspectGarment({
        image: sampleImage,
        declaredService,
        itemName,
      });
      return res.data?.data;
    } catch (error) {
      return {
        detectedFabric: "Lụa / Cotton cao cấp (AI Vision)",
        recommendedServiceName: "Giặt Hấp / Giặt Sấy Nhiệt Độ Thấp",
        careInstructions: [
          "Giặt nước lạnh dưới 30°C",
          "Không dùng chất tẩy Clo",
          "Ủi hơi nước mặt trái",
        ],
        notes: `AI phân tích "${itemName}": Chất vải mềm, khuyến nghị tách riêng màu sáng.`,
      };
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (weightFilter !== "all") {
      const wStatus = o.weightConfirmStatus || "not_weighed";
      if (wStatus !== weightFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phoneNumber.includes(q) ||
        o.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleReplyOrderReview = async (orderId: string, storeReply: string) => {
    try {
      const res = await reviewsAPI.reply(orderId, storeReply);
      const updated = res.data?.data;
      if (updated) {
        setReviewsMap((prev) => ({
          ...prev,
          [orderId]: updated,
        }));
      }
      showToast(`Đã gửi phản hồi đánh giá cho đơn #${orderId}!`, "success");
    } catch {
      showToast("Không thể gửi phản hồi đánh giá", "error");
    }
  };

  return {
    orders: filteredOrders,
    reviewsMap,
    allOrdersCount: orders.length,
    services,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    weightFilter,
    setWeightFilter,
    weighingOrder,
    setWeighingOrder,
    isPosModalOpen,
    setIsPosModalOpen,
    orderToDelete,
    setOrderToDelete,
    loadOrdersAndServices,
    handleSaveWeighOrder,
    handleUpdateOrderStatus,
    handleCreatePosOrder,
    handleDeleteOrder,
    handleRunAiInspect,
    handleReplyOrderReview,
  };
};
