import React from 'react';
import { Search, Layers, Clock } from 'lucide-react';
import { LaundryService } from '../../../types';
import { Box, Typography, Button, TextField, InputAdornment } from '@mui/material';

interface PriceListProps {
  activeTab: 'all' | 'wash_fold' | 'dry_clean' | 'heavy_items' | 'special_care';
  setActiveTab: (val: 'all' | 'wash_fold' | 'dry_clean' | 'heavy_items' | 'special_care') => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredServices: LaundryService[];
}

export const PriceList: React.FC<PriceListProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  filteredServices
}) => {
  const categories = [
    { value: 'all', label: 'Tất cả bảng giá' },
    { value: 'wash_fold', label: 'Giặt Sấy Phổ Thông' },
    { value: 'dry_clean', label: 'Giặt Hấp (Dry Clean)' },
    { value: 'heavy_items', label: 'Chăn Mền / Ga Giường' },
    { value: 'special_care', label: 'Vệ Sinh Giày Hiệu' }
  ] as const;

  const formatPrice = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <Box id="price-list-component" className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-5">
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-4">
        <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 m-0">
          <Layers style={{ width: '18px', height: '18px', color: '#2563eb' }} />
          Chi Tiết Đơn Giá Từng Dịch Vụ
        </h4>

        <TextField
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm giá áo khoác, giày hiệu..."
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                </InputAdornment>
              ),
              style: { 
                fontSize: '12px', 
                borderRadius: '12px', 
                fontFamily: 'var(--font-sans)',
              }
            }
          }}
          sx={{ 
            width: { xs: '100%', sm: 200 },
            backgroundColor: '#f8fafc',
          }}
        />
      </Box>

      <Box className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            onClick={() => setActiveTab(cat.value)}
            variant={activeTab === cat.value ? 'contained' : 'outlined'}
            sx={{
              px: 2,
              py: 0.6,
              fontSize: '11px',
              fontFamily: 'var(--font-sans)',
              fontWeight: '700',
              borderRadius: '9999px',
              textTransform: 'none',
              boxShadow: 'none',
              bgcolor: activeTab === cat.value ? '#0f172a' : '#f8fafc',
              color: activeTab === cat.value ? '#ffffff' : '#475569',
              border: activeTab === cat.value ? '1px solid #0f172a' : '1px solid #e2e8f0',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: activeTab === cat.value ? '#1e293b' : '#f1f5f9',
                boxShadow: 'none',
                border: activeTab === cat.value ? '1px solid #0f172a' : '1px solid #cbd5e1'
              }
            }}
          >
            {cat.label}
          </Button>
        ))}
      </Box>

      <Box className="max-h-[460px] overflow-y-auto pr-1.5 flex flex-col custom-scrollbar">
        {filteredServices.length === 0 ? (
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ py: 6, color: '#94a3b8', fontStyle: 'italic', fontFamily: 'var(--font-sans)', fontSize: '12px' }}
          >
            Chưa tìm thấy dịch vụ tương ứng yêu cầu. Vui lòng nhập từ khóa khác.
          </Typography>
        ) : (
          filteredServices.map((service) => (
            <Box key={service.id} className="py-4 flex justify-between items-start gap-4 border-b border-slate-100 last:border-0 last:pb-0">
              <Box className="flex flex-col gap-1">
                <div className="text-xs md:text-sm font-bold text-slate-800">
                  {service.name}
                </div>
                <div className="text-[11px] text-slate-400 max-w-md leading-relaxed">
                  {service.description}
                </div>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-sans)' }}>
                    <Clock style={{ width: '13px', height: '13px' }} /> Thúc đẩy trong {service.durationDays} ngày
                  </Box>
                </Box>
              </Box>
              <Box className="text-right flex-shrink-0">
                <div className="text-xs md:text-sm font-black text-blue-600">
                  {formatPrice(service.unitPrice)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  / 1 {service.unitName}
                </div>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};
