import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LaundryOrder, OrderStatus } from '../../../types';
import { bookingsAPI } from '../../../services/api';
import { LAUNDRY_SERVICES } from '../../../data';

export const useAdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<LaundryOrder | undefined>(undefined);

  const checkToken = () => {
    const token = localStorage.getItem('sachse_admin_token');
    if (!token) {
      navigate('/admin');
    }
  };

  const loadDashboardOrders = async () => {
    try {
      const response = await bookingsAPI.getAll({ limit: 1000 });
      const bookings = response.data?.data?.bookings || response.data?.data || [];
      
      if (Array.isArray(bookings)) {
        const normalized = bookings.map((booking: any) => ({
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
        }));
        setOrders(normalized);
      } else {
        loadDashboardOrdersFromLocalStorage();
      }
    } catch (e) {
      console.error('Failed to load dashboard orders from DB:', e);
      loadDashboardOrdersFromLocalStorage();
    }
  };

  const loadDashboardOrdersFromLocalStorage = () => {
    const cached = localStorage.getItem('sachse_laundry_orders');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as LaundryOrder[];
        setOrders(parsed);
      } catch (e) {
        setOrders([]);
      }
    }
  };

  useEffect(() => {
    checkToken();
    loadDashboardOrders();
  }, [navigate]);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: nextStatus };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('sachse_laundry_orders', JSON.stringify(updated));
    if (selectedOrderDetails?.id === orderId) {
      setSelectedOrderDetails(updated.find(o => o.id === orderId));
    }

    try {
      await bookingsAPI.updateStatus(orderId, nextStatus);
    } catch (err) {
      console.error('Failed to update status on server:', err);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('sachse_admin_token');
    navigate('/admin');
  };

  // Filter application
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.phoneNumber.includes(searchQuery) ||
                          order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate high-level metrics
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const activeOrdersCount = orders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;

  const completedOrdersCount = orders
    .filter(o => o.status === 'completed').length;

  const garmentsVolumeCount = orders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.items.reduce((acc, item) => acc + item.quantity, 0), 0);

  // Recharts metric generation for visual insights
  const serviceStatsMap: Record<string, number> = {
    'wash_fold': 0,
    'dry_clean': 0,
    'heavy_items': 0,
    'special_care': 0
  };

  orders.filter(o => o.status === 'completed').forEach(o => {
    o.items?.forEach(item => {
      const match = LAUNDRY_SERVICES.find(s => s.id === item.serviceId);
      const category = match ? match.category : null;
      
      if (category === 'wash_fold' || item.serviceId.startsWith('wf-') || item.serviceId.includes('wash')) {
        serviceStatsMap.wash_fold += (item.unitPrice ?? 0) * (item.quantity ?? 0);
      } else if (category === 'dry_clean' || item.serviceId.startsWith('dc-') || item.serviceId.includes('dry') || item.serviceId.includes('suit') || item.serviceId.includes('dress')) {
        serviceStatsMap.dry_clean += (item.unitPrice ?? 0) * (item.quantity ?? 0);
      } else if (category === 'heavy_items' || item.serviceId.startsWith('hv-') || item.serviceId.includes('bed') || item.serviceId.includes('blanket') || item.serviceId.includes('heavy') || item.serviceId.includes('curtain')) {
        serviceStatsMap.heavy_items += (item.unitPrice ?? 0) * (item.quantity ?? 0);
      } else {
        serviceStatsMap.special_care += (item.unitPrice ?? 0) * (item.quantity ?? 0);
      }
    });
  });

  const chartData = [
    { name: 'Giặt Sấy Phổ Thông', revenue: serviceStatsMap.wash_fold },
    { name: 'Giặt Hấp Thượng Hạng', revenue: serviceStatsMap.dry_clean },
    { name: 'Chăn Mền / Ga Giường', revenue: serviceStatsMap.heavy_items },
    { name: 'Vệ Sinh Giày Hiệu', revenue: serviceStatsMap.special_care }
  ];

  return {
    orders,
    filteredOrders,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedOrderDetails,
    setSelectedOrderDetails,
    handleUpdateStatus,
    handleAdminLogout,
    totalRevenue,
    activeOrdersCount,
    completedOrdersCount,
    garmentsVolumeCount,
    chartData
  };
};
