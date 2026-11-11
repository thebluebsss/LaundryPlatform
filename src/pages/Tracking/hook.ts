import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { LaundryOrder, OrderStatus } from "../../types";
import { useToast } from "../../components/Toast";
import { useLoading } from "../../context/LoadingContext";
import { bookingsAPI, laundryOrdersAPI } from "../../services/api";

export const useTracking = () => {
  const { showToast } = useToast();
  const { setLoading: setGlobalLoading } = useLoading();
  const location = useLocation();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LaundryOrder | null>(null);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoadingState] = useState(true);

  const setLoading = (val: boolean) => {
    setLoadingState(val);
    setGlobalLoading(val);
  };

  const fetchMyOrders = useCallback(async () => {
    const token = localStorage.getItem("sachse_user_token");
    if (!token) {
      setOrders([]);
      setSelectedOrder(null);
      setLoading(false);
      return;
    }

    let currentUserId = "";
    try {
      const cached = localStorage.getItem("sachse_user_profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        currentUserId = parsed._id || parsed.id || parsed.username || "";
      }
    } catch {}

    setLoading(true);
    try {
      const [laundryRes, bookingsRes] = await Promise.allSettled([
        laundryOrdersAPI.getAll(
          currentUserId ? { userId: currentUserId } : undefined
        ),
        bookingsAPI.getMyBookings({ limit: 100 }),
      ]);

      const mergedOrders: LaundryOrder[] = [];

      if (laundryRes.status === "fulfilled") {
        const rawList =
          laundryRes.value.data?.data?.orders ||
          (Array.isArray(laundryRes.value.data?.data)
            ? laundryRes.value.data.data
            : []);

        rawList.forEach((b: any) => {
          const orderId = b.id || b._id;
          // Only include orders belonging to the current customer
          if (
            currentUserId &&
            b.userId &&
            String(b.userId) !== String(currentUserId)
          ) {
            return;
          }
          mergedOrders.push({
            id: orderId,
            userId: b.userId?._id || b.userId || currentUserId,
            storeId: b.storeId,
            storeName: b.storeName,
            customerName: b.customerName || b.name || "",
            phoneNumber: b.phoneNumber || b.phone || "",
            address: b.address || "",
            district: b.district || "",
            pickupDate: b.pickupDate || "",
            pickupTime: b.pickupTime || "",
            deliveryDate: b.deliveryDate || "",
            deliveryTime: b.deliveryTime || "",
            items: b.items || [],
            products: b.products || [],
            subtotal: Number(b.subtotal || 0),
            estimatedSubtotal: Number(b.estimatedSubtotal || b.subtotal || 0),
            actualSubtotal:
              b.actualSubtotal !== undefined
                ? Number(b.actualSubtotal)
                : undefined,
            productsTotal: Number(b.productsTotal || 0),
            deliveryFee: Number(b.deliveryFee ?? 25000),
            discountAmount: Number(b.discountAmount || 0),
            promoCode: b.promoCode,
            totalPrice: Number(b.totalPrice || 0),
            status: (b.status as OrderStatus) || "pending",
            paymentStatus: b.paymentStatus || "unpaid",
            paymentMethod: b.paymentMethod || "vietqr",
            weightConfirmStatus: b.weightConfirmStatus || "not_weighed",
            actualWeighedAt: b.actualWeighedAt,
            shipperId: b.shipperId,
            shipperName: b.shipperName,
            shipperPhone: b.shipperPhone,
            createdAt: b.createdAt || new Date().toISOString(),
            completedAt: b.completedAt,
            notes: b.notes || "",
          });
        });
      }

      if (bookingsRes.status === "fulfilled") {
        const bookings = bookingsRes.value.data?.data?.bookings || [];
        bookings.forEach((b: any) => {
          const bId = b._id || b.id;
          const alreadyExists = mergedOrders.some(
            (o) =>
              o.id === bId ||
              (o.phoneNumber === (b.phone || b.phoneNumber) &&
                Math.abs(
                  new Date(o.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                ) < 15000)
          );
          if (!alreadyExists) {
            mergedOrders.push({
              id: bId,
              userId: b.userId?._id || b.userId || currentUserId,
              customerName: b.name || b.customerName || "",
              phoneNumber: b.phone || b.phoneNumber || "",
              address: b.address || "",
              district: b.district || "",
              pickupDate: b.pickupDate
                ? new Date(b.pickupDate).toISOString().split("T")[0]
                : "",
              pickupTime: b.pickupTime || "",
              deliveryDate: b.deliveryDate
                ? new Date(b.deliveryDate).toISOString().split("T")[0]
                : "",
              deliveryTime: b.deliveryTime || "",
              items:
                b.items && b.items.length > 0
                  ? b.items
                  : [
                      {
                        serviceId: b.service?._id || b.service || "wash-fold",
                        serviceName: b.service?.name || "Giặt Sấy Tiêu Chuẩn",
                        pricingType: "per_kg",
                        quantity: 3,
                        unitPrice: b.service?.unitPrice || 15000,
                        unitName: "kg",
                      },
                    ],
              products: b.products || [],
              subtotal:
                b.subtotal || Math.max(0, (b.totalPrice || 0) - 25000),
              productsTotal: b.productsTotal || 0,
              deliveryFee: b.deliveryFee ?? 25000,
              discountAmount: b.discountAmount || 0,
              promoCode: b.promoCode,
              totalPrice: b.totalPrice || 0,
              status: (b.status as OrderStatus) || "pending",
              paymentStatus: b.paymentStatus || "unpaid",
              weightConfirmStatus: b.weightConfirmStatus || "not_weighed",
              createdAt: b.createdAt || new Date().toISOString(),
              notes: b.notes || "",
            });
          }
        });
      }

      setOrders(mergedOrders);
      setSelectedOrder((prev) => {
        if (!prev) return mergedOrders[0] || null;
        return mergedOrders.find((o) => o.id === prev.id) || mergedOrders[0] || null;
      });
    } catch (error) {
      console.error("Failed to fetch user bookings:", error);
      setOrders([]);
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyOrders();
    const handleStorageChange = () => fetchMyOrders();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchMyOrders, location.pathname]);

  const handleCancelOrder = async (orderId: string) => {
    setLoading(true);
    try {
      await Promise.allSettled([
        laundryOrdersAPI.updateStatus(orderId, { status: "cancelled" }),
        bookingsAPI.cancel(orderId),
      ]);
      const updated = orders.map((o) =>
        o.id === orderId ? { ...o, status: "cancelled" as OrderStatus } : o
      );
      setOrders(updated);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "cancelled" });
      }
      showToast(
        `Đã hủy đơn đặt lịch mã #${orderId.slice(-6).toUpperCase()} thành công!`,
        "info"
      );
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Không thể hủy đơn lúc này!",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (orderId: string) => {
    setLoading(true);
    try {
      await Promise.allSettled([
        laundryOrdersAPI.updateStatus(orderId, { paymentStatus: "paid" }),
        bookingsAPI.updatePaymentStatus(orderId, "paid"),
      ]);
      const updated = orders.map((o) =>
        o.id === orderId ? { ...o, paymentStatus: "paid" as const } : o
      );
      setOrders(updated);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: "paid" });
      }
      showToast(
        `Thanh toán đơn hàng #${orderId.slice(-6).toUpperCase()} hoàn tất!`,
        "success"
      );
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
          "Cập nhật trạng thái thanh toán thất bại!",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(searchId.toLowerCase()) ||
      o.phoneNumber.includes(searchId) ||
      o.customerName.toLowerCase().includes(searchId.toLowerCase())
  );

  const selectedOrderId = selectedOrder?.id || "";
  const setSelectedOrderId = (id: string) => {
    const found = orders.find((o) => o.id === id) || null;
    setSelectedOrder(found);
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
  ) => {
    if (status === "cancelled") {
      await handleCancelOrder(orderId);
    }
  };

  const handleClearHistory = () => {
    setOrders([]);
    setSelectedOrder(null);
  };

  return {
    orders,
    selectedOrder,
    setSelectedOrder,
    selectedOrderId,
    setSelectedOrderId,
    searchId,
    setSearchId,
    filteredOrders,
    loading,
    fetchMyOrders,
    handleCancelOrder,
    handleUpdateOrderStatus,
    handleClearHistory,
    handlePaymentSuccess,
  };
};
