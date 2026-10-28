import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Milestone, 
  Clock, 
  Boxes, 
  Sparkles, 
  CheckCircle,
  Truck,
  Flame
} from 'lucide-react';
import { useTracking } from './hook';
import { OrderStatus } from '../../types';
import { EmptyTracking } from './components/EmptyTracking';
import { OrderHistoryList } from './components/OrderHistoryList';
import { OrderDetailPanel } from './components/OrderDetailPanel';
import { Box, Button } from '@mui/material';

export const Tracking: React.FC = () => {
  const navigate = useNavigate();
  const {
    orders,
    selectedOrderId,
    setSelectedOrderId,
    selectedOrder,
    handleUpdateOrderStatus,
    handleCancelOrder,
    handleClearHistory
  } = useTracking();

  const statuses: { value: OrderStatus; label: string; desc: string; icon: any; color: string }[] = [
    { value: 'pending', label: 'Chờ lấy đồ', desc: 'Shipper đang di chuyển tới thu nhận đồ bẩn', icon: Clock, color: 'bg-amber-500 text-white' },
    { value: 'sorting', label: 'Phân loại đồ', desc: 'Kiểm đếm túi đồ, đánh dấu đặc trưng vải', icon: Boxes, color: 'bg-orange-500 text-white' },
    { value: 'washing', label: 'Đang giặt sấy', desc: 'Quần áo giặt nước ấm riêng lồng vô trùng', icon: Sparkles, color: 'bg-blue-500 text-white' },
    { value: 'ironing', label: 'Là ủi, gấp phẳng', desc: 'Ủi hơi nếp gấp ly, đóng túi hút chân không', icon: Flame, color: 'bg-fuchsia-500 text-white' },
    { value: 'delivering', label: 'Đang giao hàng', desc: 'Bàn giao cho shipper mang đồ sạch trả tận cửa', icon: Truck, color: 'bg-violet-500 text-white' },
    { value: 'completed', label: 'Hoàn tất', desc: 'Quý khách kiểm tra quần áo phẳng thơm & nhận hàng', icon: CheckCircle, color: 'bg-emerald-500 text-white' }
  ];

  return (
    <Box id="tracking-page-root" className="flex flex-col gap-8 animate-[fadeIn_0.3s_ease-in-out]">
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
        <Box>
          <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 m-0 leading-tight">
            <Milestone style={{ width: '22px', height: '22px', color: '#2563eb' }} />
            Trải Nghiệm Trợ Lý Giặt Sấy Vô Trùng
          </h2>
          <p className="text-xs text-slate-400 m-0 mt-1 leading-normal">
            Theo dõi từng bước trạng thái đơn hàng hiện tại của bạn.
          </p>
        </Box>
      </Box>

      {orders.length === 0 ? (
        <EmptyTracking onNavigateHome={() => navigate('/')} />
      ) : (
        <Box className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Box className="lg:col-span-4 flex flex-col gap-6">
            <OrderHistoryList
              orders={orders}
              selectedOrderId={selectedOrderId}
              setSelectedOrderId={setSelectedOrderId}
              statuses={statuses}
            />
          </Box>

          <Box className="lg:col-span-8 flex flex-col gap-6">
            {selectedOrder && (
              <OrderDetailPanel
                selectedOrder={selectedOrder}
                statuses={statuses}
                handleCancelOrder={handleCancelOrder}
                handleUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
