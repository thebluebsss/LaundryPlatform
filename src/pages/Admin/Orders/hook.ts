import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LaundryOrder, OrderStatus } from "../../../types";
import { bookingsAPI } from "../../../services/api";
import { useLoading } from "../../../context/LoadingContext";

export const useAdminOrders = () => {
  const navigate = useNavigate();
  const { setLoading: setGlobalLoading } = useLoading();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoadingState] = useState(true);

  const setLoading = (val: boolean) => {
    setLoadingState(val);
    setGlobalLoading(val);
  };

  const [error, setError] = useState("");

  const normalizeBooking = (booking: any): LaundryOrder => ({
    id: booking._id?.toString() || booking.id,
    userId: booking.userId?._id?.toString() || booking.userId || "",
    customerName: booking.name || booking.customerName || "",
    phoneNumber: booking.phone || booking.phoneNumber || "",
    address: booking.address || booking.customerInfo?.address || "",
    district: booking.district || "",
    items: booking.items || [],
    products: booking.products || [],
    pickupDate: booking.pickupDate
      ? new Date(booking.pickupDate).toISOString().split("T")[0]
      : "",
    pickupTime: booking.pickupTime || "",
    deliveryDate: booking.deliveryDate
      ? new Date(booking.deliveryDate).toISOString().split("T")[0]
      : "",
    deliveryTime: booking.deliveryTime || "",
    notes: booking.notes || "",
    customerSpecialRequest: booking.customerSpecialRequest || "",
    extraFee: booking.extraFee ?? 0,
    extraFeeReason: booking.extraFeeReason || "",
    promoCode: booking.promoCode,
    discountAmount: booking.discountAmount ?? 0,
    subtotal: booking.subtotal ?? 0,
    productsTotal: booking.productsTotal ?? 0,
    deliveryFee: booking.deliveryFee ?? 0,
    totalPrice: booking.totalAmount ?? booking.totalPrice ?? 0,
    status: booking.status || "pending",
    createdAt: booking.createdAt || new Date().toISOString(),
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await bookingsAPI.getAll();
      const ordersData = response.data.data?.bookings || [];
      setOrders(
        Array.isArray(ordersData)
          ? ordersData.map((booking: any) => normalizeBooking(booking))
          : []
      );
    } catch (err: any) {
      console.error("Error loading orders:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách đơn hàng"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    setLoading(true);
    try {
      await bookingsAPI.updateStatus(id, status);
      await loadOrders();
    } catch (err: any) {
      console.error("Error updating order status:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phoneNumber.includes(searchQuery)
  );

  return {
    navigate,
    orders,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    filteredOrders,
    loadOrders,
    handleUpdateStatus,
  };
};
