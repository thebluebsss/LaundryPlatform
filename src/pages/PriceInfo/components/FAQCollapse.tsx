import React from 'react';
import { CircleHelp, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Stack, Box, Typography, Button } from '@mui/material';

interface FAQCollapseProps {
  faqs: { q: string; a: string }[];
  expandedFAQ: number | null;
  toggleFAQ: (idx: number) => void;
}

export const FAQCollapse: React.FC<FAQCollapseProps> = ({
  faqs,
  expandedFAQ,
  toggleFAQ
}) => {
  return (
    <Box 
      id="faq-collapse-component" 
      className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm"
    >
      <Stack spacing={3}>
        <Box>
          <Typography 
            variant="subtitle1" 
            className="font-extrabold text-slate-800 flex items-center gap-1.5"
            sx={{ fontWeight: 'bold' }}
          >
            <CircleHelp className="w-5 h-5 text-blue-600" />
            Giải Đáp Thắc Mắc Từ Sạch Sẽ
          </Typography>
          <Typography variant="caption" className="text-slate-505 mt-1 block">
            Những điểm quý khách cần thấu suốt khi sử dụng quy trình dệt là.
          </Typography>
        </Box>

        <Box className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFAQ === idx;
            return (
              <Box key={idx} className="border border-slate-100 rounded-2xl overflow-hidden">
                <Button
                  onClick={() => toggleFAQ(idx)}
                  fullWidth
                  variant="text"
                  sx={{
                    p: 2,
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    bgcolor: 'slate.50/50',
                    color: 'text.primary',
                    textTransform: 'none',
                    borderRadius: 0,
                    '&:hover': {
                      bgcolor: 'slate.50'
                    }
                  }}
                  className="cursor-pointer"
                  endIcon={isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                >
                  <Typography className="text-xs md:text-sm font-bold pr-2 leading-relaxed" sx={{ fontSize: '13px', fontWeight: 'bold' }}>
                    {faq.q}
                  </Typography>
                </Button>
                
                {isOpen && (
                  <Box className="p-4 bg-white border-t border-slate-100 text-xs md:text-sm text-slate-650 leading-relaxed space-y-2">
                    <Typography variant="body2">{faq.a}</Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Quick trust metrics */}
        <Box className="p-4 bg-blue-50/30 border border-blue-50/70 rounded-2xl">
          <Typography 
            variant="subtitle2" 
            className="text-blue-800 flex items-center gap-1.5 font-bold"
            sx={{ fontWeight: 'bold', mb: 1 }}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Bảo Hành Vải Cao Cấp
          </Typography>
          <Typography variant="caption" className="text-blue-700 leading-relaxed block">
            Mọi sản phẩm của bạn đều được gắn chíp nhãn lụa nhiệt độ thấp để điều phối luồng gió thích hợp, sấy khô ngưng tụ giữ nguyên thớ thô mộc quý giá ban đầu.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};
