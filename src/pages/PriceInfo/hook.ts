import { useState } from 'react';
import { LAUNDRY_SERVICES } from '../../data';

export const usePriceInfo = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'wash_fold' | 'dry_clean' | 'heavy_items' | 'special_care'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(prev => prev === index ? null : index);
  };

  const filteredServices = LAUNDRY_SERVICES.filter(service => {
    const matchesTab = activeCategory => {
      if (activeCategory === 'all') return true;
      return service.category === activeCategory;
    };
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab(activeTab) && matchesSearch;
  });

  const faqs = [
    {
      q: "Sạch Sẽ có giặt riêng đồ của từng khách hàng không?",
      a: "Có. Mỗi đơn hàng được giặt và sấy riêng trên một lồng máy, không giặt chung giữa các khách hàng để đảm bảo vệ sinh và tránh thất lạc đồ."
    },
    {
      q: "Phí giao nhận 2 chiều được tính như thế nào?",
      a: "Đơn giặt từ 200.000đ trở lên được miễn phí giao nhận tận nhà. Với đơn dưới 200.000đ, phí giao nhận đồng giá 25.000đ cho cả chiều lấy đồ và trả đồ."
    },
    {
      q: "Nếu quần áo bị hư hại hoặc thất lạc thì xử lý ra sao?",
      a: "Tiệm luôn kiểm tra chất liệu và phân loại kỹ trước khi giặt. Nếu phát sinh lỗi rách vải, loang màu hoặc thất lạc do phía cửa hàng, Sạch Sẽ hỗ trợ bồi thường lên tới 20 lần giá cước của món đồ đó."
    },
    {
      q: "Dịch vụ giặt hấp (giặt khô) mất khoảng bao lâu?",
      a: "Thời gian xử lý tiêu chuẩn cho giặt hấp áo vest, áo dài, áo dạ hoặc vệ sinh giày là từ 2–3 ngày làm việc để giữ chuẩn phom dáng và chất liệu vải."
    }
  ];

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    expandedFAQ,
    toggleFAQ,
    filteredServices,
    faqs
  };
};
