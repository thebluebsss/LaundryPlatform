import { useState, useEffect } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Package, Search } from "lucide-react";
import { LaundryOrder, OrderStatus } from "../../../types";
import { OrdersTable } from "./components/OrdersTable";
import { useNavigate } from "react-router-dom";
import { bookingsAPI } from "../../../services/api";
import { useLoading } from "../../../context/LoadingContext";

export const AdminOrders = () => {
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

  useEffect(() => {
    loadOrders();
  }, []);

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
      // Ensure we always set an array
      setOrders(
        Array.isArray(ordersData)
          ? ordersData.map((booking: any) => normalizeBooking(booking))
          : [],
      );
    } catch (err: any) {
      console.error("Error loading orders:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách đơn hàng",
      );
      // Set empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

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
      order.phoneNumber.includes(searchQuery),
  );

  return (
    <Box className="p-6 space-y-6">
      {/* Header */}
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Box>
          <Typography
            variant="h4"
            sx={{ fontSize: "24px", fontWeight: "bold", color: "slate.900" }}
          >
            <Package className="w-6 h-6 inline mr-2 text-blue-600" />
            Quản Lý Đơn Hàng
          </Typography>
          <Typography variant="body2" className="text-slate-500 mt-1">
            Theo dõi và quản lý tất cả đơn hàng giặt là
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            onClick={() => navigate("/admin/dashboard")}
            variant="outlined"
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            ← Về Dashboard
          </Button>
        </Stack>
      </Box>

      {/* Search */}
      <Box className="bg-white p-4 rounded-2xl border border-slate-100">
        <Box className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng, mã đơn, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </Box>
      </Box>

      {/* Loading/Error States */}
      {loading && (
        <Box className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
          <Typography className="text-slate-500">
            Đang tải dữ liệu...
          </Typography>
        </Box>
      )}

      {error && (
        <Box className="bg-red-50 p-4 rounded-2xl border border-red-200 text-center">
          <Typography className="text-red-600 text-sm font-medium">
            {error}
          </Typography>
          <Button
            onClick={loadOrders}
            size="small"
            sx={{ mt: 2, textTransform: "none" }}
          >
            Thử lại
          </Button>
        </Box>
      )}

      {/* Orders Table */}
      {!loading && !error && (
        <OrdersTable
          orders={filteredOrders}
          onOrdersChange={loadOrders}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </Box>
  );
};
