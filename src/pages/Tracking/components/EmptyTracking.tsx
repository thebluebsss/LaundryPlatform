import React from 'react';
import { Boxes } from 'lucide-react';
import { Button, Box } from '@mui/material';

interface EmptyTrackingProps {
  onNavigateHome: () => void;
}

export const EmptyTracking: React.FC<EmptyTrackingProps> = ({ onNavigateHome }) => {
  return (
    <Box id="tracking-empty-state" className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
      <Box className="flex flex-col items-center gap-6">
        <Box className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <Boxes style={{ width: '28px', height: '28px' }} />
        </Box>
        <Box>
          <h3 className="text-base font-black text-slate-800 m-0">
            Quý khách chưa có đơn hàng nào!
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed m-0 mt-2">
            Ước lượng giặt xả xịn mịn, nhập mã ưu đãi khủng và tạo đơn hàng đầu tiên ngay để trải nghiệm quy trình.
          </p>
        </Box>
        <Button
          onClick={onNavigateHome}
          variant="contained"
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '700',
            fontFamily: 'var(--font-sans)',
            textTransform: 'none',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: '#1d4ed8',
              transform: 'scale(1.02)'
            }
          }}
        >
          Đến Ước Tính & Tạo Đơn Mới →
        </Button>
      </Box>
    </Box>
  );
};
