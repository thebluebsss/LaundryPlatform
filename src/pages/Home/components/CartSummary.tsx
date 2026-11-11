import React from 'react';
import { ShoppingCart, Info, CalendarClock, Check, Percent } from 'lucide-react';
import { PROMO_CODES } from '../../../data';
import { CartItem, PromoCode } from '../../../types';
import { Stack, Box, Typography, Button, TextField, InputAdornment } from '@mui/material';

interface CartSummaryProps {
  cartItemsList: CartItem[];
  subtotal: number;
  isFreeDelivery: boolean;
  deliveryFee: number;
  activePromo: PromoCode | undefined;
  discountAmount: number;
  estDays: number;
  totalPrice: number;
  promoInput: string;
  setPromoInput: (val: string) => void;
  promoError: string;
  setPromoError: (val: string) => void;
  handleApplyPromo: (code: string) => void;
  handleProceedToBooking: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  cartItemsList,
  subtotal,
  isFreeDelivery,
  deliveryFee,
  activePromo,
  discountAmount,
  estDays,
  totalPrice,
  promoInput,
  setPromoInput,
  promoError,
  setPromoError,
  handleApplyPromo,
  handleProceedToBooking,
}) => {
  const formatPrice = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <Box id="home-cart-summary-section" className="space-y-6">
      <Box className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <Box className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
          <ShoppingCart className="w-48 h-48" />
        </Box>

        <Typography 
          variant="h6" 
          className="font-bold flex items-center gap-2 border-b border-slate-800 pb-4"
          sx={{ fontWeight: 'bold' }}
        >
          <ShoppingCart className="w-5 h-5 text-blue-400" />
          Giỏ Hàng Ước Tính
        </Typography>

        {cartItemsList.length === 0 ? (
          <Box className="py-12 text-center text-slate-400 space-y-3">
            <Info className="w-8 h-8 mx-auto text-slate-500" />
            <Typography variant="body2" className="text-sm">Chưa có dịch vụ nào được chọn.</Typography>
            <Typography variant="caption" className="text-slate-500 max-w-[220px] mx-auto leading-normal block">
              Vui lòng tăng số lượng dịch vụ bạn muốn để tính toán tổng chi phí.
            </Typography>
          </Box>
        ) : (
          <Box className="mt-4 space-y-4">
            {/* List chosen details */}
            <Box 
              sx={{ maxHeight: 160, overflowY: 'auto' }} 
              className="space-y-2 pr-1 custom-scrollbar"
            >
              {cartItemsList.map((item) => (
                <Box key={item.serviceId} className="flex justify-between items-center text-xs text-slate-300">
                  <span className="truncate max-w-[150px]">{item.serviceName}</span>
                  <span className="font-mono text-[11px]">
                    {item.quantity} {item.unitName} × {formatPrice(item.unitPrice)}
                  </span>
                </Box>
              ))}
            </Box>

            {/* Pricing breaks */}
            <Box className="border-t border-slate-800 pt-4 space-y-2 text-sm text-slate-300">
              <Box className="flex justify-between">
                <Typography variant="body2" className="text-slate-300">Tạm tính (Dịch vụ):</Typography>
                <Typography variant="body2" className="font-semibold text-slate-200">{formatPrice(subtotal)}</Typography>
              </Box>
              
              <Box className="flex justify-between items-center">
                <Typography variant="body2" className="flex items-center gap-1 text-slate-300">
                  Phí giao nhận:
                  {isFreeDelivery && (
                    <Box component="span" className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                      Freeship
                    </Box>
                  )}
                </Typography>
                <Typography variant="body2" className="font-mono text-slate-200 text-[13px]">
                  {deliveryFee === 0 ? '0 đ' : formatPrice(deliveryFee)}
                </Typography>
              </Box>

              {activePromo && (
                <Box className="flex justify-between text-rose-400 font-medium">
                  <Typography variant="body2" className="text-rose-450 font-medium text-rose-400">Ưu đãi ({activePromo.code}):</Typography>
                  <Typography variant="body2" className="font-semibold text-rose-400">- {formatPrice(discountAmount)}</Typography>
                </Box>
              )}
              
              <Box className="flex justify-between text-slate-300 text-xs mt-1 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <Box component="span" className="flex items-center gap-1">
                  <CalendarClock className="w-3.5 h-3.5 text-blue-400" />
                  Bàn giao dự kiến:
                </Box>
                <Box component="span" className="font-semibold text-slate-200">Khoảng {estDays} ngày làm việc</Box>
              </Box>
            </Box>

            {/* Total Cost */}
            <Box className="border-t border-slate-800 pt-4 mt-2">
              <Box className="flex justify-between items-baseline mb-4">
                <Typography variant="body2" className="text-sm font-bold text-slate-300">Tổng cộng ước tính:</Typography>
                <Typography variant="h5" className="font-black text-blue-400" sx={{ fontWeight: 900, color: 'info.light' }}>
                  {formatPrice(totalPrice)}
                </Typography>
              </Box>

              <Button
                onClick={handleProceedToBooking}
                fullWidth
                variant="contained"
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  bgcolor: 'primary.main',
                  boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'scale(1.01)'
                  },
                  '&:active': {
                    transform: 'scale(0.95)'
                  },
                  transition: 'all 0.2s'
                }}
                className="cursor-pointer"
                startIcon={<Check className="w-5 h-5" />}
              >
                Đặt Lịch Thu Gom Giao Nhận
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Quick Coupons Card */}
      <Box className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <Typography 
          variant="subtitle2" 
          className="text-slate-800 mb-3 flex items-center gap-2 font-bold"
          sx={{ fontWeight: 'bold' }}
        >
          <Percent className="w-4 h-4 text-rose-500" />
          Nhập Mã Ưu Đãi Giảm Giá
        </Typography>

        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            value={promoInput}
            onChange={(e) => {
              setPromoInput(e.target.value);
              setPromoError('');
            }}
            placeholder="GIATMOI15"
            variant="outlined"
            slotProps={{
              htmlInput: {
                className: "uppercase font-semibold placeholder:text-slate-400",
                style: { fontSize: '12px' }
              }
            }}
            sx={{ flex: 1 }}
            className="bg-slate-50"
          />
          <Button
            onClick={() => handleApplyPromo(promoInput)}
            disabled={subtotal === 0}
            variant="contained"
            sx={{
              px: 3,
              fontWeight: 'bold',
              fontSize: '12px',
              borderRadius: '12px',
              textTransform: 'none',
              bgcolor: subtotal === 0 ? 'slate.100' : 'slate.800',
              color: subtotal === 0 ? 'slate.400' : '#ffffff',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'slate.700',
                boxShadow: 'none'
              }
            }}
            className="cursor-pointer"
          >
            Áp Dụng
          </Button>
        </Stack>

        {promoError && (
          <Typography variant="caption" className="text-rose-500 font-medium mt-2 block">
            {promoError}
          </Typography>
        )}

        {activePromo && !promoError && (
          <Box className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mt-3 text-xs text-emerald-800 font-medium flex items-start gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <Box>
              <Typography className="font-bold text-emerald-900" sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                Khuyến mãi: {activePromo.code}
              </Typography>
              <Typography className="text-[10px] text-emerald-700 mt-0.5 block">
                {activePromo.description}
              </Typography>
            </Box>
          </Box>
        )}

        <Box className="mt-4 pt-3 border-t border-slate-100">
          <Typography className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-2 block">
            Ưu đãi hôm nay:
          </Typography>
          <Stack spacing={1}>
            {PROMO_CODES.map((promo) => (
              <Button
                key={promo.code}
                onClick={() => {
                  setPromoInput(promo.code);
                  handleApplyPromo(promo.code);
                }}
                variant="outlined"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: '12px',
                  borderColor: 'slate.200',
                  color: 'slate.700',
                  textTransform: 'none',
                  textAlign: 'left',
                  width: '100%',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'blue-50/20'
                  }
                }}
                className="group cursor-pointer"
              >
                <Box className="text-left">
                  <Box component="span" className="font-bold text-slate-900 group-hover:text-blue-600 underline text-xs">
                    {promo.code}
                  </Box>
                  <Typography className="text-[10px] text-slate-500 mt-0.5 block">
                    {promo.description}
                  </Typography>
                </Box>
                <Box component="span" className="text-[10px] font-bold text-rose-500 bg-rose-50 py-0.5 px-1.5 rounded">
                  {promo.discountType === 'percentage' ? `-${promo.value}%` : `-${(promo.value / 1000)}k`}
                </Box>
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
