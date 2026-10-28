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
      q: "Tiệm Sạch Sẽ có gom đồ riêng lẻ của từng mẻ giặt không?",
      a: "Tất nhiên rồi! Sạch Sẽ tuyệt đối không giặt chung đồ của các khách hàng khác nhau. Mỗi gia đình đều được phân vào một máy giặt và một lồng sấy riêng biệt bảo đảm tuyệt đối vấn đề vệ sinh và tránh tuyệt đối tình trạng thất lạc quần áo."
    },
    {
      q: "Phí ship gom nhận đồ 2 chiều được tính như thế nào?",
      a: "Với tất cả hóa đơn giặt là trị giá từ 200.000 đ trở lên, Sạch Sẽ miễn phí thu nhận lẫn giao đồ trả hoàn toàn (giá gốc là 25k). Với hóa đơn dưới 200k, phí gom nhận đồng giá cực rẻ là 25k cho cả 2 lượt thu gom và trả đồ."
    },
    {
      q: "Quần Áo của tôi bị co rút hoặc loang màu thì chính sách đền bù thế nào?",
      a: "Chúng tôi áp dụng quy trình kiểm soát gắn chip lồng vắt nhiệt độ và phân chia vải. Trường hợp thợ lồng dệt của chúng tôi làm rách hoặc loang màu sản phẩm, Sạch Sẽ cam kết đền bù bảo hiểm giá trị quần áo tối đa tới 20 lần giá cước chuyên biệt cho món đồ đó."
    },
    {
      q: "Dịch vụ giặt hấp (Dry Cleaning) mất khoảng bao nhiêu ngày?",
      a: "Thời gian thông thường cho gói Giặt sấy khô sấy lạnh là từ 2-3 ngày làm việc để chất liệu lụa, veston hay giày hiệu có độ khô mộc mạc và chuẩn phom dáng tinh tế của hãng thiết kế."
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
