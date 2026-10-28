import React from 'react';
import { X, Users, Phone, MapPin } from 'lucide-react';
import { LaundryOrder, OrderStatus } from '../../../../types';
import { Stack, Box, Typography, Button } from '@mui/material';

interface AdminOrderModalProps {
  orderDetails: LaundryOrder;
  onClose: () => void;
  statuses: { value: OrderStatus; label: string; color: string }[];
  handleUpdateStatus: (id: string, status: OrderStatus) => void;
}

export const AdminOrderModal: React.FC<AdminOrderModalProps> = ({
  orderDetails,
  onClose,
  statuses,
  handleUpdateStatus
}) => {
  const formatPrice = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <Box id="admin-order-dialog" className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
      <Box className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 relative">
        <Stack spacing={3}>
          <Box>
            <Button
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                minWidth: 'auto',
                p: 1,
                borderRadius: '50%',
                color: 'slate.500',
                '&:hover': {
                  bgcolor: 'slate.100'
                }
              }}
              className="cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </Box>

          <Box className="space-y-1">
            <Box 
              component="span" 
              className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block"
            >
              Đốc Công Vận Chuyển Đơn
            </Box>
            <Typography variant="h6" className="text-base md:text-lg font-black text-slate-900 mt-2 flex items-center gap-1 font-sans" sx={{ fontWeight: 900 }}>
              Chi Tiết Mã: #{orderDetails.id.toUpperCase()}
            </Typography>
          </Box>

          {/* Quick action buttons block */}
          <Box className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <Typography className="text-[11px] font-black text-slate-400 uppercase tracking-widest block" variant="caption">
              Thay đổi trạng thái quy trình dệt dập:
            </Typography>
            
            <Box className="flex flex-wrap gap-1.5">
              {statuses.map((s) => {
                const isCurrent = s.value === orderDetails.status;
                return (
                  <Button
                    key={s.value}
                    onClick={() => handleUpdateStatus(orderDetails.id, s.value)}
                    variant={isCurrent ? 'contained' : 'outlined'}
                    sx={{
                      px: 1.8,
                      py: 0.6,
                      fontSize: '11px',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      textTransform: 'none',
                      boxShadow: 'none',
                      bgcolor: isCurrent ? 'primary.main' : '#ffffff',
                      color: isCurrent ? '#ffffff' : 'slate.700',
                      border: '1px solid',
                      borderColor: isCurrent ? 'primary.main' : 'slate.200',
                      '&:hover': {
                        bgcolor: isCurrent ? 'primary.dark' : 'slate.100',
                        boxShadow: 'none',
                        borderColor: isCurrent ? 'primary.main' : 'slate.300'
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {s.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* Details breakdown scroll block */}
          <Box 
            sx={{ maxHeight: 250, overflowY: 'auto' }} 
            className="space-y-3.5 pr-1 text-xs md:text-sm text-slate-600 custom-scrollbar"
          >
            <Box className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
              <Box>
                <Typography variant="caption" className="font-extrabold text-slate-700 uppercase text-[10px] tracking-wide mb-1 flex items-center gap-1 block">
                  <Users className="w-3.5 h-3.5 text-blue-500" /> Khách hàng
                </Typography>
                <Typography variant="body2" className="font-bold text-slate-808" sx={{ fontWeight: 'bold' }}>
                  {orderDetails.customerName}
                </Typography>
                <Typography variant="caption" className="text-slate-500 flex items-center gap-1 mt-0.5 block">
                  <Phone className="w-3 h-3 text-slate-400" /> {orderDetails.phoneNumber}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" className="font-extrabold text-slate-700 uppercase text-[10px] tracking-wide mb-1 flex items-center gap-1 block">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Giao nhận tại địa chỉ
                </Typography>
                <Typography variant="body2" className="font-bold text-slate-808 leading-normal" sx={{ fontWeight: 'bold' }}>
                  {orderDetails.address}
                </Typography>
                <Typography variant="caption" className="text-slate-500 mt-0.5 block">
                  {orderDetails.district}
                </Typography>
              </Box>
            </Box>

            <Box className="pb-3 border-b border-slate-100 grid grid-cols-2 gap-4">
              <Box>
                <Typography variant="subtitle2" className="font-extrabold text-[10px] text-slate-705 uppercase mb-1 block">Hẹn Thu Gom</Typography>
                <Typography variant="caption" className="font-semibold text-slate-800 block">Giờ: {orderDetails.pickupTime}</Typography>
                <Typography variant="caption" className="text-slate-500 block">Ngày: {new Date(orderDetails.pickupDate).toLocaleDateString('vi-VN')}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" className="font-extrabold text-[10px] text-slate-705 uppercase mb-1 block">Hẹn Trả Sạch</Typography>
                <Typography variant="caption" className="font-semibold text-slate-805 block">Giờ: {orderDetails.deliveryTime}</Typography>
                <Typography variant="caption" className="text-slate-500 block">Ngày: {new Date(orderDetails.deliveryDate).toLocaleDateString('vi-VN')}</Typography>
              </Box>
            </Box>

            {orderDetails.notes && (
              <Box className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[11px] text-amber-800 leading-normal block">
                <strong>Ghi chú đơn hàng:</strong> &ldquo;{orderDetails.notes}&rdquo;
              </Box>
            )}

            {/* Items lists inside modal */}
            <Box className="space-y-3 border border-slate-100 p-4 rounded-3xl bg-slate-50/50">
              <Box>
                <Typography variant="subtitle2" className="font-extrabold text-[11px] text-slate-500 uppercase tracking-wider block mb-1.5">
                  Dịch vụ dệt giặt ({orderDetails.items?.length || 0})
                </Typography>
                <Box className="space-y-1.5">
                  {orderDetails.items && orderDetails.items.length > 0 ? (
                    orderDetails.items.map((item) => (
                      <Box key={item.serviceId} className="flex justify-between items-center text-xs pb-1.5 border-b border-dashed border-slate-200 last:border-0 last:pb-0">
                        <Typography variant="caption" className="text-slate-650 block">
                          {item.serviceName} <span className="text-slate-400 font-medium">({item.quantity} {item.unitName})</span>
                        </Typography>
                        <Typography variant="caption" className="font-bold text-slate-800 block">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="caption" className="text-slate-400 italic block">Không có dịch vụ nào</Typography>
                  )}
                </Box>
              </Box>

              {/* Products purchased together if any */}
              {orderDetails.products && orderDetails.products.length > 0 && (
                <Box className="pt-2 border-t border-slate-200">
                  <Typography variant="subtitle2" className="font-extrabold text-[11px] text-blue-600 uppercase tracking-wider block mb-1.5">
                    Sản phẩm mua kèm ({orderDetails.products.length})
                  </Typography>
                  <Box className="space-y-1.5">
                    {orderDetails.products.map((p) => (
                      <Box key={p.productId} className="flex justify-between items-center text-xs pb-1.5 border-b border-dashed border-slate-200 last:border-0 last:pb-0">
                        <Typography variant="caption" className="text-slate-650 block">
                          {p.productName} <span className="text-slate-400 font-mono">({p.unit ? `x${p.quantity} ${p.unit}` : `x${p.quantity}`})</span>
                        </Typography>
                        <Typography variant="caption" className="font-bold text-slate-800 block">
                          {formatPrice(p.unitPrice * p.quantity)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Delivery and discount details */}
              <Box className="pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-500">
                {orderDetails.deliveryFee !== undefined && orderDetails.deliveryFee > 0 && (
                  <Box className="flex justify-between">
                    <span>Phí gom nhận & giao trả hàng:</span>
                    <span className="font-medium text-slate-700">{formatPrice(orderDetails.deliveryFee)}</span>
                  </Box>
                )}
                {orderDetails.discountAmount !== undefined && orderDetails.discountAmount > 0 && (
                  <Box className="flex justify-between text-emerald-600 font-bold">
                    <span>Chiết khấu mã {orderDetails.promoCode ? `(${orderDetails.promoCode})` : ""}:</span>
                    <span>-{formatPrice(orderDetails.discountAmount)}</span>
                  </Box>
                )}
              </Box>
              
              <Box className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-xs md:text-sm">
                <Typography variant="body2" sx={{ fontWeight: 900 }} className="font-black text-slate-800">Tổng hóa đơn thực thu:</Typography>
                <Typography variant="body2" className="text-blue-600 font-black text-base" sx={{ fontWeight: 900 }}>{formatPrice(orderDetails.totalPrice)}</Typography>
              </Box>
            </Box>
          </Box>

          <Button
            onClick={onClose}
            fullWidth
            variant="contained"
            sx={{
              py: 1.2,
              borderRadius: '12px',
              fontWeight: 'bold',
              textTransform: 'none',
              bgcolor: 'slate.900',
              color: '#ffffff',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'slate.800',
                boxShadow: 'none'
              }
            }}
            className="cursor-pointer text-center"
          >
            Hoàn Tất Hồ Sơ
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
