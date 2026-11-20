import { LaundryService, PromoCode } from './types';

export const LAUNDRY_SERVICES: LaundryService[] = [
  // Wash & Fold Services
  {
    id: 'wf-regular',
    name: 'Giặt sấy thường',
    category: 'wash_fold',
    pricingType: 'per_kg',
    unitPrice: 15000,
    unitName: 'kg',
    description: 'Giặt nước ấm, xả thơm dịu nhẹ, sấy khô hoàn toàn và gấp gọn gàng. Phù hợp cho quần áo mặc hằng ngày.',
    iconName: 'Shirt',
    durationDays: 1,
    featured: true
  },
  {
    id: 'wf-premium',
    name: 'Giặt sấy & là hơi cao cấp',
    category: 'wash_fold',
    pricingType: 'per_kg',
    unitPrice: 25000,
    unitName: 'kg',
    description: 'Giặt sấy hoàn chỉnh kết hợp là hơi phẳng phiu và treo móc gọn gàng, sẵn sàng mặc ngay.',
    iconName: 'Sparkles',
    durationDays: 1,
    featured: true
  },

  // Dry Clean Services
  {
    id: 'dc-vest',
    name: 'Giặt hấp áo vest / blazer',
    category: 'dry_clean',
    pricingType: 'per_item',
    unitPrice: 65000,
    unitName: 'cái',
    description: 'Giặt khô dịu nhẹ giúp giữ chuẩn phom dáng, đường may và sợi chỉ cho áo vest nam, nữ.',
    iconName: 'Briefcase',
    durationDays: 2,
    featured: true
  },
  {
    id: 'dc-aodai',
    name: 'Giặt hấp áo dài truyền thống',
    category: 'dry_clean',
    pricingType: 'per_item',
    unitPrice: 85000,
    unitName: 'bộ',
    description: 'Làm sạch nhẹ nhàng dành riêng cho vải gấm, lụa tơ tằm và họa tiết thêu tay hoặc đính kết.',
    iconName: 'Heart',
    durationDays: 2
  },
  {
    id: 'dc-dạ',
    name: 'Giặt hấp áo dạ / áo măng tô',
    category: 'dry_clean',
    pricingType: 'per_item',
    unitPrice: 95000,
    unitName: 'cái',
    description: 'Dành cho áo khoác dày mùa đông, giữ độ mềm ấm của chất dạ và hạn chế xù lông sau khi giặt.',
    iconName: 'Wind',
    durationDays: 2
  },

  // Heavy Items Services
  {
    id: 'hv-blanket',
    name: 'Giặt chăn bông dày',
    category: 'heavy_items',
    pricingType: 'per_item',
    unitPrice: 60000,
    unitName: 'cái',
    description: 'Giặt riêng bằng máy công nghiệp cỡ lớn, sấy khô sâu giúp chăn bông tơi xốp và sạch mùi ẩm.',
    iconName: 'BedDouble',
    durationDays: 2,
    featured: true
  },
  {
    id: 'hv-bedsheet',
    name: 'Giặt bộ chăn ga gối',
    category: 'heavy_items',
    pricingType: 'per_item',
    unitPrice: 50000,
    unitName: 'bộ',
    description: 'Làm sạch mồ hôi, bụi mịn và mùi ẩm mốc bằng nước giặt dịu nhẹ, an toàn cho da.',
    iconName: 'FolderHeart',
    durationDays: 1
  },
  {
    id: 'hv-curtain',
    name: 'Giặt rèm cửa / màn cửa',
    category: 'heavy_items',
    pricingType: 'per_kg',
    unitPrice: 35000,
    unitName: 'kg',
    description: 'Giặt sạch bụi bám lâu ngày, là phẳng giữ nếp rèm đứng dáng và lưu hương dịu nhẹ.',
    iconName: 'Maximize2',
    durationDays: 3
  },

  // Special Care Services
  {
    id: 'sc-sneaker',
    name: 'Vệ sinh giày thể thao',
    category: 'special_care',
    pricingType: 'per_item',
    unitPrice: 55000,
    unitName: 'đôi',
    description: 'Vệ sinh thủ công kỹ lưỡng từ đế đến dây giày, khử mùi và sấy khô đúng nhiệt độ để giữ form giày.',
    iconName: 'Footprints',
    durationDays: 2,
    featured: true
  },
  {
    id: 'sc-leather',
    name: 'Làm sạch & dưỡng giày da',
    category: 'special_care',
    pricingType: 'per_item',
    unitPrice: 120000,
    unitName: 'đôi',
    description: 'Làm sạch nhẹ nhàng kết hợp sáp dưỡng chuyên dụng giúp bề mặt da thật hoặc da lộn mềm mịn, sáng đẹp.',
    iconName: 'Gem',
    durationDays: 3
  }
];

export const PROMO_CODES: PromoCode[] = [
  {
    code: 'GIATMOI15',
    description: 'Giảm ngay 15% tổng hóa đơn cho khách hàng mới trải nghiệm',
    discountType: 'percentage',
    value: 15
  },
  {
    code: 'SACHSE20K',
    description: 'Giảm 20.000đ cho đơn hàng giặt sấy từ 150.000đ trở lên',
    discountType: 'fixed',
    value: 20000,
    minSubtotal: 150000
  },
  {
    code: 'TIETKIEM30',
    description: 'Giảm lớn 30.000đ cho đơn hàng cỡ đại trên 300.000đ',
    discountType: 'fixed',
    value: 30000,
    minSubtotal: 300000
  }
];

export interface HanoiDistrictOption {
  name: string;
  lat: number;
  lng: number;
}

export const HANOI_DISTRICTS: HanoiDistrictOption[] = [
  { name: 'Quận Hoàn Kiếm', lat: 21.0285, lng: 105.8542 },
  { name: 'Quận Ba Đình', lat: 21.0341, lng: 105.8372 },
  { name: 'Quận Đống Đa', lat: 21.0181, lng: 105.8292 },
  { name: 'Quận Hai Bà Trưng', lat: 21.0091, lng: 105.8535 },
  { name: 'Quận Cầu Giấy', lat: 21.0362, lng: 105.7906 },
  { name: 'Quận Thanh Xuân', lat: 20.9938, lng: 105.8114 },
  { name: 'Quận Tây Hồ', lat: 21.0687, lng: 105.8224 },
  { name: 'Quận Hoàng Mai', lat: 20.9741, lng: 105.8564 },
  { name: 'Quận Long Biên', lat: 21.0381, lng: 105.8861 },
  { name: 'Quận Hà Đông', lat: 20.9714, lng: 105.7788 },
  { name: 'Quận Nam Từ Liêm', lat: 21.0156, lng: 105.7647 },
  { name: 'Quận Bắc Từ Liêm', lat: 21.0645, lng: 105.7556 },
  { name: 'Huyện Gia Lâm', lat: 21.0185, lng: 105.9382 },
  { name: 'Huyện Thanh Trì', lat: 20.9412, lng: 105.8482 },
  { name: 'Huyện Đông Anh', lat: 21.1394, lng: 105.8469 },
];

export const DISTRICTS = {
  hanoi: HANOI_DISTRICTS.map((d) => d.name),
  hcm: HANOI_DISTRICTS.map((d) => d.name),
};

export const LAUNDRY_FAQS = [
  {
    question: 'Quy trình giao nhận đồ giặt diễn ra thế nào?',
    answer: 'Rất đơn giản! Bạn đặt lịch hẹn qua app, nhân viên giao nhận sẽ đến tận địa chỉ của bạn để nhận đồ theo đúng khung giờ đã chọn. Đồ sau thu gom sẽ được phân loại, giặt sạch sấy khô và được giao trả lại tận nhà của bạn trong trạng thái gấp xếp/treo móc phẳng phiu.'
  },
  {
    question: 'Giặt Sấy khác gì so với Giặt Hấp (Dry Cleaning)?',
    answer: 'Giặt sấy thông thường sử dụng nước và chất tẩy rửa dịu nhẹ cho trang phục đơn giản hàng ngày. Giặt hấp sử dung dung môi đặc biệt không chứa nước kết hợp thiết bị hấp chuyên sâu dành cho đồ cao cấp quý phái như Vest, váy dạ hội, tơ lụa, áo len, dạ măng tô để bảo vệ hoàn hảo phom dáng và chất vải.'
  },
  {
    question: 'Bao lâu thì tôi nhận lại được đồ sạch?',
    answer: 'Thông thường dịch vụ giặt sấy thường chỉ mất 1 ngày (24h). Các dịch vụ đòi hỏi xử lý tỉ mỉ như giặt hấp vest/đầm dạ hội, giặt nệm bông dày hay vệ sinh giày hiệu sẽ mất từ 2 đến 3 ngày để đảm bảo độ khô ráo và sạch đẹp tối ưu.'
  },
  {
    question: 'Phí giao nhận được tính như thế nào?',
    answer: 'Chúng tôi tính phí giao nhận đồng giá cực kỳ ưu đãi chỉ 25.000đ cho cả 2 lượt thu gom và giao trả tận nơi trong bán kính 10km. Đơn hàng có tổng giá trị dịch vụ từ 200.000đ trở lên sẽ được MIỄN PHÍ hoàn toàn phí giao nhận!'
  },
  {
    question: 'Tôi có cần phân loại quần áo trước khi gửi không?',
    answer: 'Bạn hoàn toàn không cần bận tâm về việc này! Đội ngũ chuyên gia kỹ thuật lồng giặt của chúng tôi sẽ tiến hành kiểm tra nhãn mác, phân loại màu sắc sáng/tối cũng như phân nhóm chất liệu vải trước khi đưa vào giặt sấy riêng biệt.'
  }
];

export const TESTIMONIALS = [
  {
    name: 'Khánh Linh',
    role: 'Nhân viên văn phòng, Q. Đống Đa, Hà Nội',
    comment: 'Từ lúc biết đến app này mình không phải đau đầu lo việc giặt ủi drap giường và áo vest nữa. Chỉ cần mươi phút bấm chọn giờ thu gom, đồ giao lại siêu thơm và xếp cực ngay ngắn!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100'
  },
  {
    name: 'Minh Hoàng',
    role: 'Doanh nhân, Q. Ba Đình, Hà Nội',
    comment: 'Dịch vụ giặt vest xuất sắc, giữ đúng phom dáng cao cấp nguyên vẹn. Nhân viên giao nhận rất lịch sự, đúng giờ. Sự tiện lợi ngoài mong đợi.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100'
  },
  {
    name: 'Mỹ Duyên',
    role: 'Sinh viên, Q. Cầu Giấy, Hà Nội',
    comment: 'Giá cả giặt sấy theo cân rất hợp túi tiền sinh viên. Thích nhất là được xem tiến trình đơn hàng giặt sấy di chuyển trực quan ngay trên điện thoại!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100'
  }
];
