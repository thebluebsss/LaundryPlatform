import { useState, useEffect } from "react";
import { LaundryOrder, OrderStatus } from "../../types";
import { bookingsAPI, laundryOrdersAPI } from "../../services/api";
import { useLoading } from "../../context/LoadingContext";

export const useTracking = () => {
  const { setLoading: setGlobalLoading } = useLoading();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [loading, setLoadingState] = useState(false);
  
  const setLoading = (val: boolean) => {
    setLoadingState(val);
    setGlobalLoading(val);
  };
  
  const [error, setError] = useState("");

  const loadOrders = async () => {
    const cachedProfile = localStorage.getItem("sachse_user_profile");
    let currentUserId = "";
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        currentUserId = parsed.id || parsed._id || parsed.username || "";
      } catch (e) {}
    }

    setLoading(true);
    setError("");

    const adminToken = localStorage.getItem("sachse_admin_token");
    const userToken = localStorage.getItem("sachse_user_token");
    let token = adminToken || userToken;
    if (token && (token === "activated" || !token.includes(".") || token.length < 15)) {
      token = null;
    }

    try {
      const [bookingsRes, laundryRes] = await Promise.allSettled([
        token ? bookingsAPI.getMyBookings({ limit: 1000 }) : Promise.resolve({ data: { data: { bookings: [] } } }),
        laundryOrdersAPI.getAll(),
      ]);

      const rawBookings =
        bookingsRes.status === "fulfilled"
          ? bookingsRes.value.data?.data?.bookings ||
            (Array.isArray(bookingsRes.value.data?.data)
              ? bookingsRes.value.data.data
              : [])
          : [];

      const rawLaundryOrders =
        laundryRes.status === "fulfilled"
          ? laundryRes.value.data?.data?.orders ||
            (Array.isArray(laundryRes.value.data?.data)
              ? laundryRes.value.data.data
              : [])
          : [];

      // Map backend schema to UI LaundryOrder schema
      const mappedOrders: LaundryOrder[] = Array.isArray(rawBookings)
        ? rawBookings.map((o: any) => ({
            id: o._id || o.id,
            userId: o.userId?._id || o.userId || currentUserId,
            storeId: o.storeId || "store-hcm-q1",
            storeName: o.storeName || "Tiệm Giặt Sấy Vô Trùng Q1",
            shipperId: o.shipperId || "drv-1",
            shipperName: o.shipperName || "Nguyễn Văn Hùng",
            customerName: o.name || o.customerName,
            phoneNumber: o.phone || o.phoneNumber,
            address: o.address,
            district: o.district,
            items: Array.isArray(o.items)
              ? o.items.map((item: any) => ({
                  serviceId: item.serviceId,
                  serviceName: item.serviceName,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  pricingType: item.pricingType,
                  unitName: item.unitName,
                }))
              : [],
            products: Array.isArray(o.products)
              ? o.products.map((p: any) => ({
                  productId: p.productId,
                  productName: p.productName,
                  quantity: p.quantity,
                  unitPrice: p.unitPrice,
                  unit: p.unit,
                }))
              : [],
            pickupDate: o.pickupDate,
            pickupTime: o.pickupTime,
            deliveryDate: o.deliveryDate,
            deliveryTime: o.deliveryTime,
            notes: o.notes || "",
            promoCode: o.promoCode,
            discountAmount: o.discountAmount || 0,
            subtotal: o.subtotal || 0,
            productsTotal: o.productsTotal || 0,
            deliveryFee: o.deliveryFee || 0,
            totalPrice: o.totalPrice || o.totalAmount || 0,
            status: o.status || "pending",
            createdAt: o.createdAt,
          }))
        : [];

      if (Array.isArray(rawLaundryOrders)) {
        rawLaundryOrders.forEach((lo: any) => {
          const id = lo.id || lo._id;
          if (!mappedOrders.some((m) => m.id === id)) {
            mappedOrders.push({
              ...lo,
              id,
              storeId: lo.storeId || "store-hcm-q1",
              storeName: lo.storeName || "Tiệm Giặt Sấy Vô Trùng Q1",
              shipperId: lo.shipperId || "drv-1",
              shipperName: lo.shipperName || "Nguyễn Văn Hùng",
            });
          }
        });
      }

      setOrders(mappedOrders);

      if (mappedOrders.length > 0) {
        if (
          !selectedOrderId ||
          !mappedOrders.some((f) => f.id === selectedOrderId)
        ) {
          setSelectedOrderId(mappedOrders[0].id);
        }
      } else {
        setSelectedOrderId("");
      }
    } catch (e) {
      console.error("Failed to load laundry orders from DB:", e);
      if (currentUserId) {
        loadOrdersFromLocalStorage(currentUserId);
      } else {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersFromLocalStorage = (currentUserId: string) => {
    const cached = localStorage.getItem("sachse_laundry_orders");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as LaundryOrder[];
        // Only show orders that belong strictly to this user
        const filtered = parsed.filter((o) => {
          if (currentUserId) {
            return o.userId === currentUserId;
          } else {
            return !o.userId; // Guest orders have no userId
          }
        });
        setOrders(filtered);
        if (
          filtered.length > 0 &&
          (!selectedOrderId || !filtered.some((f) => f.id === selectedOrderId))
        ) {
          setSelectedOrderId(filtered[0].id);
        }
      } catch (e) {
        setOrders([]);
      }
    } else {
      setOrders([]);
    }
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener("storage", loadOrders);
    return () => {
      window.removeEventListener("storage", loadOrders);
    };
  }, [selectedOrderId]);

  const saveOrdersToLocalStorage = (updatedList: LaundryOrder[]) => {
    const cached = localStorage.getItem("sachse_laundry_orders");
    let masterList: LaundryOrder[] = [];
    if (cached) {
      try {
        masterList = JSON.parse(cached) as LaundryOrder[];
      } catch (e) {}
    }

    const cachedProfile = localStorage.getItem("sachse_user_profile");
    let currentUserId = "";
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        currentUserId = parsed.id || parsed._id || parsed.username || "";
      } catch (e) {}
    }

    let finalMaster: LaundryOrder[] = [];
    if (updatedList.length === 0) {
      finalMaster = masterList.filter((item) => item.userId !== currentUserId);
    } else {
      const otherUsersOrders = masterList.filter(
        (item) => item.userId !== currentUserId,
      );
      finalMaster = [...updatedList, ...otherUsersOrders];
    }

    localStorage.setItem("sachse_laundry_orders", JSON.stringify(finalMaster));
    window.dispatchEvent(new Event("storage"));
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
  ) => {
    // Only admins modify statuses directly, but let's keep local status update for nice UI reactions
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status };
      }
      return o;
    });
    setOrders(updated);
    saveOrdersToLocalStorage(updated);
  };

  const handleCancelOrder = async (orderId: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: "cancelled" as OrderStatus };
      }
      return o;
    });
    setOrders(updated);
    saveOrdersToLocalStorage(updated);

    try {
      await bookingsAPI.cancel(orderId);
      loadOrders(); // Refresh status from DB
    } catch (err) {
      console.error("Failed to cancel order on server:", err);
      alert("Hệ thống không thể hủy đơn hẹn này. Thao tác thất bại.");
    }
  };

  const handleClearHistory = () => {
    if (
      window.confirm(
        "Quý khách có thực sự muốn dọn sạch lịch sử giặt là đã hiển thị trên trình duyệt này?",
      )
    ) {
      saveOrdersToLocalStorage([]);
      setOrders([]);
      setSelectedOrderId("");
    }
  };

  const selectedOrder =
    orders.find((o) => o.id === selectedOrderId) ||
    (orders.length > 0 ? orders[0] : undefined);

  return {
    orders,
    selectedOrderId,
    setSelectedOrderId,
    selectedOrder,
    loading,
    error,
    handleUpdateOrderStatus,
    handleCancelOrder,
    handleClearHistory,
    refreshOrders: loadOrders,
  };
};
