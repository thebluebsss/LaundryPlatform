import React from 'react';
import { 
  Shirt, 
  Sparkles, 
  Briefcase, 
  Heart, 
  Wind, 
  BedDouble, 
  FolderHeart, 
  Maximize2, 
  Footprints, 
  Gem, 
  Plus, 
  Minus 
} from 'lucide-react';
import { LAUNDRY_SERVICES } from '../../../data';
import { Stack, Box, Typography, Button } from '@mui/material';

const ServiceIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const props = { className: className || "w-5 h-5" };
  switch (name) {
    case 'Shirt': return <Shirt {...props} />;
    case 'Sparkles': return <Sparkles {...props} />;
    case 'Briefcase': return <Briefcase {...props} />;
    case 'Heart': return <Heart {...props} />;
    case 'Wind': return <Wind {...props} />;
    case 'BedDouble': return <BedDouble {...props} />;
    case 'FolderHeart': return <FolderHeart {...props} />;
    case 'Maximize2': return <Maximize2 {...props} />;
    case 'Footprints': return <Footprints {...props} />;
    case 'Gem': return <Gem {...props} />;
    default: return <Shirt {...props} />;
  }
};

interface EstimatorProps {
  activeCategory: 'all' | 'wash_fold' | 'dry_clean' | 'heavy_items' | 'special_care';
  setActiveCategory: (cat: 'all' | 'wash_fold' | 'dry_clean' | 'heavy_items' | 'special_care') => void;
  cart: Record<string, number>;
  updateQuantity: (id: string, change: number) => void;
}

export const Estimator: React.FC<EstimatorProps> = ({
  activeCategory,
  setActiveCategory,
  cart,
  updateQuantity
}) => {
  const categories = [
    { value: 'all', label: 'Tất cả dịch vụ' },
    { value: 'wash_fold', label: 'Giặt Sấy Phổ Thông' },
    { value: 'dry_clean', label: 'Giặt Hấp (Dry Clean)' },
    { value: 'heavy_items', label: 'Chăn Mền / Ga Giường' },
    { value: 'special_care', label: 'Vệ Sinh Giày Hiệu' }
  ] as const;

  const formatPrice = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  const filteredServices = LAUNDRY_SERVICES.filter(service => {
    if (activeCategory === 'all') return true;
    return service.category === activeCategory;
  });

  return (
    <Box 
      id="home-estimator-section" 
      className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
    >
      <Stack spacing={3}>
        <Box>
          <Typography 
            variant="h6" 
            className="text-slate-800 flex items-center gap-2 font-extrabold"
            sx={{ fontWeight: 'bold' }}
          >
            <Sparkles className="text-blue-500 w-5 h-5 animate-pulse" />
            Bảng Chọn Dịch Vụ & Ước Lượng Giá Nhỏ Gọn
          </Typography>
          <Typography className="text-xs text-slate-500 mt-1" variant="body2">
            Đơn hàng từ <Box component="span" className="text-blue-600 font-bold">200.000 đ</Box> trở lên được <Box component="span" className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold">Miễn Phí Giao Nhận 2 Chiều</Box> (trị giá 25K)!
          </Typography>
        </Box>

        {/* Catalog Filter Pills */}
        <Box className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              variant={activeCategory === cat.value ? 'contained' : 'outlined'}
              sx={{
                px: 2.5,
                py: 0.8,
                fontSize: { xs: '11px', md: '12px' },
                fontWeight: 'bold',
                borderRadius: '9999px',
                textTransform: 'none',
                boxShadow: 'none',
                bgcolor: activeCategory === cat.value ? 'primary.main' : 'slate.50',
                color: activeCategory === cat.value ? '#ffffff' : 'slate.600',
                border: activeCategory === cat.value ? '1px solid #2563eb' : '1px solid #e2e8f0',
                '&:hover': {
                  bgcolor: activeCategory === cat.value ? 'primary.dark' : 'slate.100',
                  boxShadow: 'none',
                  border: activeCategory === cat.value ? '1px solid #2563eb' : '1px solid #cbd5e1'
                }
              }}
              className="cursor-pointer"
            >
              {cat.label}
            </Button>
          ))}
        </Box>

        {/* List filtered services */}
        <Box className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredServices.map((service) => {
            const qty = cart[service.id] || 0;
            return (
              <Box 
                key={service.id}
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                  qty > 0 
                    ? 'bg-blue-50/40 border-blue-200 shadow-sm' 
                    : 'bg-slate-50/50 border-slate-100/95 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Box className="flex items-start gap-4 flex-1">
                  <Box className={`p-3 rounded-xl flex-shrink-0 ${qty > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <ServiceIcon name={service.iconName} />
                  </Box>
                  <Box>
                    <Box className="flex items-center gap-2">
                      <Typography variant="subtitle2" className="font-bold text-slate-800" sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {service.name}
                      </Typography>
                      {service.featured && (
                        <Box component="span" className="text-[10px] uppercase font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          Phổ Biến
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" className="text-slate-500 mt-1 max-w-md block" sx={{ fontSize: '11px' }}>
                      {service.description}
                    </Typography>
                    <Box className="mt-2 text-xs font-semibold text-blue-600 bg-white border border-blue-100 px-2.5 py-1 rounded-full inline-block">
                      {formatPrice(service.unitPrice)} / {service.unitName}
                    </Box>
                  </Box>
                </Box>

                {/* Increment counter */}
                <Box className="flex items-center justify-end gap-3 mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Button
                    onClick={() => updateQuantity(service.id, -1)}
                    disabled={qty === 0}
                    variant="outlined"
                    sx={{
                      minWidth: '32px',
                      width: '32px',
                      height: '32px',
                      p: 0,
                      borderRadius: '50%',
                      borderColor: 'slate.200',
                      bgcolor: qty > 0 ? '#ffffff' : 'slate.100',
                      color: qty > 0 ? 'slate.705' : 'slate.300',
                      '&:hover': {
                        bgcolor: 'slate.100',
                        borderColor: 'slate.300'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'slate.100',
                        color: 'slate.300',
                        borderColor: 'slate.200'
                      }
                    }}
                    className="cursor-pointer active:scale-95 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <Typography className={`w-8 text-center text-sm font-bold ${qty > 0 ? 'text-blue-600 text-[16px]' : 'text-slate-400'}`}>
                    {qty}
                  </Typography>
                  <Button
                    onClick={() => updateQuantity(service.id, 1)}
                    variant="outlined"
                    sx={{
                      minWidth: '32px',
                      width: '32px',
                      height: '32px',
                      p: 0,
                      borderRadius: '50%',
                      borderColor: 'slate.200',
                      bgcolor: '#ffffff',
                      color: 'slate.700',
                      '&:hover': {
                        bgcolor: 'slate.100',
                        borderColor: 'slate.300'
                      }
                    }}
                    className="cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                  <Typography variant="caption" className="text-slate-400 w-8 text-left ml-1">
                    {service.unitName}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Stack>
    </Box>
  );
};
