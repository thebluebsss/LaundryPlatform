import React from 'react';
import { ChevronRight } from 'lucide-react';
import { LaundryOrder } from '../../../types';
import { Box, Button } from '@mui/material';

interface OrderHistoryListProps {
  orders: LaundryOrder[];
  selectedOrderId: string;
  setSelectedOrderId: (id: string) => void;
  statuses: { value: string; label: string; color: string }[];
}

export const OrderHistoryList: React.FC<OrderHistoryListProps> = ({
  orders,
  selectedOrderId,
  setSelectedOrderId,
  statuses
}) => {
  const formatPrice = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <Box id="tracking-history-sidebar" className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-5">
      <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
        Lịch sử đơn của tôi ({orders.length})
      </div>
      
      <Box className="max-h-[460px] overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
        {orders.map((order) => {
          const isActive = order.id === selectedOrderId;
          const statusDetails = statuses.find(s => s.value === order.status);
          
          return (
            <Button
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              fullWidth
              variant="text"
              sx={{
                textAlign: 'left',
                p: 1.8,
                borderRadius: '16px',
                textTransform: 'none',
                fontFamily: 'var(--font-sans)',
                color: 'text.primary',
                border: '1px solid',
                borderColor: isActive ? '#bfdbfe' : '#e2e8f0',
                bgcolor: isActive ? '#f0f9ff' : '#f8fafc',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: isActive ? '0 1px 2px 0 rgba(0, 0, 0, 0.02)' : 'none',
                '&:hover': {
                  bgcolor: isActive ? '#e0f2fe' : '#f1f5f9',
                  borderColor: isActive ? '#bfdbfe' : '#cbd5e1'
                }
              }}
            >
              <Box className="flex flex-col gap-1.5 flex-1 min-w-0 pr-2">
                <Box className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-450 text-slate-400 uppercase tracking-wide block">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                  </span>
                </Box>
                
                <div className="text-xs font-bold text-slate-800 overflow-hidden text-overflow-ellipsis white-space-nowrap">
                  {order.customerName}
                </div>
                
                <Box className="flex justify-between items-center gap-2">
                  <span className="text-xs font-black text-blue-600 block">
                    {formatPrice(order.totalPrice)}
                  </span>
                  
                  {order.status === 'cancelled' ? (
                    <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded scale-90">
                      Đã hủy
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-flex items-center gap-1 scale-90">
                      {statusDetails?.label}
                    </span>
                  )}
                </Box>
              </Box>
              <ChevronRight style={{ width: '15px', height: '15px', color: '#94a3b8', transition: 'transform 0.2s', transform: isActive ? 'translateX(4px)' : 'none' }} />
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};
