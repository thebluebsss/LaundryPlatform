import React from 'react';
import { CheckCircle, Info } from 'lucide-react';
import { Box, Button } from '@mui/material';

interface SuccessModalProps {
  showSuccess: boolean;
  justCreatedId: string;
  fullname: string;
  phoneNumber: string;
  pickupTimeSlot: string;
  pickupDateStr: string;
  grandTotal: number;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  showSuccess,
  justCreatedId,
  fullname,
  phoneNumber,
  pickupTimeSlot,
  pickupDateStr,
  grandTotal,
  onClose
}) => {
  if (!showSuccess) return null;

  const formatPrice = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <Box id="booking-success-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <Box className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6">
        <Box className="flex flex-col gap-6">
          <Box className="text-center flex flex-col gap-3">
            <Box className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle style={{ width: '36px', height: '36px' }} />
            </Box>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight m-0">
                Đăng Ký Đặt Lịch Thành Công!
              </h3>
              <p className="text-xs text-slate-400 m-0 mt-1">
                Mã vận đơn đã được gửi tới hệ thống cơ sở gần nhất.
              </p>
            </div>
          </Box>

          <Box className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3 text-xs md:text-sm">
            <Box className="flex justify-between items-center font-black pb-3 border-b border-slate-200/60 mb-1">
              <span className="text-slate-400">Mã của bạn:</span>
              <span className="text-blue-600">#{justCreatedId.slice(0, 8).toUpperCase()}</span>
            </Box>
            
            <Box className="flex justify-between items-center text-slate-500">
              <span>Họ tên:</span>
              <span className="font-bold text-slate-800">{fullname}</span>
            </Box>
            
            <Box className="flex justify-between items-center text-slate-500">
              <span>Điện thoại:</span>
              <span className="font-bold text-slate-800">{phoneNumber}</span>
            </Box>
            
            <Box className="flex justify-between items-center text-slate-500">
              <span>Thời gian hẹn lấy:</span>
              <span className="font-bold text-slate-800">
                {pickupTimeSlot} ({new Date(pickupDateStr).toLocaleDateString('vi-VN')})
              </span>
            </Box>
            
            <Box className="flex justify-between items-center border-t border-slate-200/60 pt-3 mt-1 font-black text-slate-950">
              <span>Tổng chi phí:</span>
              <span className="text-slate-900 font-extrabold">{formatPrice(grandTotal)}</span>
            </Box>
          </Box>

          <Box className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex gap-3 items-start">
            <Info style={{ width: '16px', height: '16px', color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
            <p className="text-[11px] text-blue-800 leading-normal m-0 font-medium">
              Hệ thống tự động đưa bạn về màn <strong>&apos;Theo Dõi Đơn Hàng&apos;</strong>. Tại đây bạn có thể cập nhật, mô phỏng các trạng thái bằng nút cơ học trực quan!
            </p>
          </Box>

          <Button
            onClick={onClose}
            fullWidth
            variant="contained"
            sx={{
              py: 1.5,
              borderRadius: '12px',
              fontWeight: '700',
              fontFamily: 'var(--font-sans)',
              textTransform: 'none',
              bgcolor: '#0f172a',
              color: '#ffffff',
              boxShadow: 'none',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#1e293b',
                boxShadow: 'none'
              }
            }}
          >
            Xem Chi Tiết Quy Trình Giặt
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
