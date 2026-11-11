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
import { ORDER_STATUS_LABELS } from '../../utils/orderStatusLabels';
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
    { value: 'pending', label: ORDER_STATUS_LABELS.pending, desc: 'Đơn mới đặt — Đang chờ cửa hàng điều phối tài xế đến lấy đồ', icon: Clock, color: 'bg-amber-500 text-white' },
    { value: 'picking_up', label: ORDER_STATUS_LABELS.picking_up, desc: 'Tài xế đã nhận chuyến và đang di chuyển đến thu gom đồ tận nhà', icon: Truck, color: 'bg-sky-500 text-white' },
    { value: 'sorting', label: ORDER_STATUS_LABELS.sorting, desc: 'Tài xế đã bàn giao cho tiệm — Chủ tiệm kiểm đếm & cân thực tế từng dòng vải', icon: Boxes, color: 'bg-orange-500 text-white' },
    { value: 'waiting_confirm', label: ORDER_STATUS_LABELS.waiting_confirm, desc: 'Khối lượng thực tế có chênh lệch — Chờ quý khách xác nhận trên ứng dụng', icon: Clock, color: 'bg-amber-600 text-white' },
    { value: 'washing', label: ORDER_STATUS_LABELS.washing, desc: 'Quần áo đang được giặt sấy riêng lồng vô trùng theo từng chất liệu vải', icon: Sparkles, color: 'bg-blue-500 text-white' },
    { value: 'ironing', label: ORDER_STATUS_LABELS.ironing, desc: 'Ủi hơi nước phẳng phiu, gấp gọn và đóng túi bảo quản sạch thơm', icon: Flame, color: 'bg-fuchsia-500 text-white' },
    { value: 'delivering', label: ORDER_STATUS_LABELS.delivering, desc: 'Tài xế đang mang đồ sạch phẳng thơm giao trả tận nhà quý khách', icon: Truck, color: 'bg-violet-500 text-white' },
    { value: 'returning', label: ORDER_STATUS_LABELS.returning, desc: 'Đang hoàn trả giỏ đồ về nhà theo yêu cầu từ chối khối lượng thực tế', icon: Truck, color: 'bg-rose-500 text-white' },
    { value: 'completed', label: ORDER_STATUS_LABELS.completed, desc: 'Đã hoàn thành giao trả — Quý khách kiểm tra quần áo, thanh toán & đánh giá dịch vụ', icon: CheckCircle, color: 'bg-emerald-500 text-white' }
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
