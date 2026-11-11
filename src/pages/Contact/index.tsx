import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { Box, Button } from '@mui/material';
import { InputText } from '../../components/InputText';
import { InputArea } from '../../components/InputArea';

export const Contact: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, Điện thoại, Lời nhắn)!', 'warning');
      return;
    }

    setIsSubmitting(true);
    // Gửi tin nhắn giả lập mượt mà lên hệ thống
    setTimeout(() => {
      showToast('Cảm ơn đóng góp của bạn! Giặt Là Sạch Sẽ sẽ phản hồi lại trong vòng 15-30 phút qua SĐT hoặc Email.', 'success');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setIsSubmitting(false);
    }, 1200);
  };

  const getIconBoxClass = (colorScheme: 'blue' | 'indigo' | 'emerald' | 'amber') => {
    const schemes = {
      blue: 'bg-blue-50 text-blue-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      emerald: 'bg-emerald-50 text-emerald-600',
      amber: 'bg-amber-50 text-amber-600',
    };
    return `w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${schemes[colorScheme]}`;
  };

  return (
    <Box id="contact-root-container" className="flex flex-col gap-8">
      {/* Intro section banner */}
      <Box className="bg-slate-50/70 border border-slate-100 rounded-3xl p-6 md:p-8 flex flex-col gap-4">
        <Box style={{ maxWidth: '42rem' }}>
          <div>
            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full tracking-wider inline-block">
              Liên Hệ 24/7
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 m-0 mt-3 tracking-tight">
            Kết Nối Với Giặt Là Sạch Sẽ
          </h2>
          <p className="text-xs text-slate-400 m-0 mt-1.5 leading-relaxed">
            Mọi thắc mắc về thất lạc đồ, dịch vụ giặt hấp đặc biệt, hay phản hồi chất lượng phục vụ của shipper/nhân viên tiệm đều được tiếp nhận và xử lý triệt để ngay lập tức.
          </p>
        </Box>
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info (5 cols) */}
        <Box className="lg:col-span-5 flex flex-col gap-6">
          <Box className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
              <MessageSquare style={{ width: '18px', height: '18px', color: '#2563eb' }} />
              Thông Tin Liên Hệ
            </h4>

            <Box className="flex flex-col gap-4">
              <Box className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50/75 transition-colors duration-250">
                <div className={getIconBoxClass('blue')}>
                  <Phone style={{ width: '18px', height: '18px' }} />
                </div>
                <Box className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Hotline gom đồ nhanh
                  </span>
                  <div className="text-sm font-bold text-slate-800">
                    1900-5454-99
                  </div>
                  <p className="text-[10px] text-slate-400 m-0">
                    Hỗ trợ nhận trả đồ từ 7:00 đến 22:00 hàng ngày
                  </p>
                </Box>
              </Box>

              <Box className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50/75 transition-colors duration-250">
                <div className={getIconBoxClass('indigo')}>
                  <Mail style={{ width: '18px', height: '18px' }} />
                </div>
                <Box className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Hòm thư điện tử
                  </span>
                  <div className="text-sm font-bold text-slate-800">
                    chamsockhachhang@sachse.vn
                  </div>
                  <p className="text-[10px] text-slate-400 m-0">
                    Tiếp nhận hợp đồng giặt là doanh nghiệp, spa, homestay
                  </p>
                </Box>
              </Box>

              <Box className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50/75 transition-colors duration-250">
                <div className={getIconBoxClass('emerald')}>
                  <MapPin style={{ width: '18px', height: '18px' }} />
                </div>
                <Box className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Xưởng tổng trung tâm
                  </span>
                  <div className="text-xs font-bold text-slate-800 leading-normal">
                    Shophouse SV12, KĐT Vinhomes Ocean Park, Gia Lâm, Hà Nội
                  </div>
                </Box>
              </Box>

              <Box className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50/75 transition-colors duration-250">
                <div className={getIconBoxClass('amber')}>
                  <Clock style={{ width: '18px', height: '18px' }} />
                </div>
                <Box className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Thời gian làm việc
                  </span>
                  <div className="text-sm font-bold text-slate-800">
                    07:00 - 22:00 (Cả ngày lễ và Chủ Nhật)
                  </div>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col gap-3 shadow-lg">
            <Box className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
              <ShieldCheck style={{ width: '192px', height: '192px', color: '#ffffff' }} />
            </Box>
            <div className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
              Cam Kết Chất Lượng
            </div>
            <p className="text-xs text-slate-300 leading-relaxed m-0 relative z-10">
              Chúng tôi bảo đảm đền bù lên tới <span className="font-extrabold text-white">20 LẦN</span> giá trị hoá đơn giặt nếu xảy ra sự cố lỗi rách vải hay thất lạc do lỗi vận hành của tiệm. Sự hài lòng tuyệt đối là lẽ sống của Giặt Là Sạch Sẽ.
            </p>
          </Box>
        </Box>

        {/* Contact Form (7 cols) */}
        <Box className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <h4 className="text-base font-black text-slate-850 m-0 text-slate-800">
              Gửi Thắc Mắc & Yêu Cầu Thu Gom Đồ Đặc Biệt
            </h4>
            
            <p className="text-xs text-slate-400 m-0 leading-normal">
              Nếu quý khách có số lượng chăn chiếu, rèm cửa siêu nặng hoặc quần áo lụa là đắt tiền cần giặt khô nâng niu đặc biệt, hãy gửi thông tin để chuyên viên gọi điện tư vấn tỉ mỉ nhất.
            </p>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputText
                title="Họ và tên của bạn"
                required
                placeholder="Ví dụ: Nguyễn Văn A"
                inputProps={{
                  value: name,
                  onChange: (e: any) => setName(e.target.value),
                }}
              />

              <InputText
                title="Số điện thoại"
                required
                placeholder="Ví dụ: 0987xxxxxx"
                inputProps={{
                  type: 'tel',
                  value: phone,
                  onChange: (e: any) => setPhone(e.target.value),
                }}
              />
            </Box>

            <InputText
              title="Địa chỉ thư điện tử (Không bắt buộc)"
              placeholder="Ví dụ: email@gmail.com"
              inputProps={{
                type: 'email',
                value: email,
                onChange: (e: any) => setEmail(e.target.value),
              }}
            />

            <InputArea
              title="Lời nhắn chi tiết yêu cầu"
              required
              rows={4}
              placeholder="Ví dụ: Mình cần giặt hấp 3 áo vest lụa dầy và rèm vách ô kính 15m2..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              fullWidth
              variant="contained"
              sx={{
                py: 1.8,
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '13px',
                fontFamily: 'var(--font-sans)',
                textTransform: 'none',
                bgcolor: '#2563eb',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.1)',
                '&:hover': {
                  bgcolor: '#1d4ed8'
                }
              }}
              startIcon={<Send style={{ width: '16px', height: '16px' }} />}
            >
              {isSubmitting ? 'ĐANG GỬI TIN NHẮN...' : 'GỬI ĐÓNG GÓP Ý KIẾN / THÔNG TIN'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};
