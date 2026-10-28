import { LaundryService, PromoCode } from './types';

export const LAUNDRY_SERVICES: LaundryService[] = [
  // Wash & Fold Services
  {
    id: 'wf-regular',
    name: 'Giặt Sấy Sấy Khô Thường',
    category: 'wash_fold',
    pricingType: 'per_kg',
    unitPrice: 15000,
    unitName: 'kg',
    description: 'Giặt thường bằng nước ấm, xả comfort, sấy khô hoàn toàn và gấp xếp gọn gàng. Phù hợp cho quần áo hàng ngày.',
    iconName: 'Shirt',
    durationDays: 1,
    featured: true
  },
  {
    id: 'wf-premium',
    name: 'Giặt Ủi Cao Cấp (Có Là Hơi)',
    category: 'wash_fold',
    pricingType: 'per_kg',
    unitPrice: 25000,
    unitName: 'kg',
    description: 'Bao gồm toàn bộ quy trình giặt sấy thường kết hợp là hơi phẳng phiu từng nếp nhăn và treo móc cẩn thận.',
    iconName: 'Sparkles',
    durationDays: 1,
    featured: true
  },
  
  // Dry Clean Services
  {
    id: 'dc-vest',
    name: 'Giặt Hấp Áo Vest / Blazer',
    category: 'dry_clean',
    pricingType: 'per_item',
    unitPrice: 65000,
    unitName: 'cái',
    description: 'Công nghệ giặt hữu cơ (Organic dry cleaning) bảo vệ tối đa phom dáng và sợ chỉ của áo vest nam/nữ.',
    iconName: 'Briefcase',
    durationDays: 2,
    featured: true
  },
  {
    id: 'dc-aodai',
    name: 'Giặt Hấp Áo Dài Truyền Thống',
    category: 'dry_clean',
    pricingType: 'per_item',
    unitPrice: 85000,
    unitName: 'bộ',
    description: 'Xử lý giặt hấp dịu nhẹ bảo vệ gấm, lụa tơ tằm, các họa tiết thêu tay hoặc đính cườm lấp lánh.',
    iconName: 'Heart',
    durationDays: 2
  },
  {
    id: 'dc-dạ',
    name: 'Giặt Hấp Áo Dạ / Áo Măng Tô',
    category: 'dry_clean',
    pricingType: 'per_item',
    unitPrice: 95000,
    unitName: 'cái',
    description: 'Dành cho các loại áo khoác dày, giữ độ ấm tơ lông dạ, không bị xù xì sau khi làm sạch.',
    iconName: 'Wind',
    durationDays: 2
  },

  // Heavy Items Services
  {
    id: 'hv- blanket',
    name: 'Giặt Chăn Bông Dày',
    category: 'heavy_items',
    pricingType: 'per_item',
    unitPrice: 60000,
    unitName: 'cái',
    description: 'Xử lý chăn bông kích thước lớn bằng lồng giặt đại công nghiệp, sấy diệt khuẩn bằng luồng nhiệt cực sạch.',
    iconName: 'BedDouble',
    durationDays: 2,
    featured: true
  },
  {
    id: 'hv-bedsheet',
    name: 'Giặt Bộ Drap Giường (Ga + Gối)',
    category: 'heavy_items',
    pricingType: 'per_item',
    unitPrice: 50000,
    unitName: 'bộ',
    description: 'Giặt sạch vết mồ hôi, bụi phấn và tế bào da chết bằng dung dịch diệt khuẩn chuyên sâu.',
    iconName: 'FolderHeart',
    durationDays: 1
  },
  {
    id: 'hv-curtain',
    name: 'Giặt Rèm Cửa / Màn Cửa',
    category: 'heavy_items',
    pricingType: 'per_kg',
    unitPrice: 35000,
    unitName: 'kg',
    description: 'Làm sạch sâu bụi bám lâu ngày, ép form rèm luôn đứng dáng và thơm ngát hương hoa lavender.',
    iconName: 'Maximize2',
    durationDays: 3
  },

  // Special Care Services
  {
    id: 'sc-sneaker',
    name: 'Vệ Sinh Giày Thể Thao',
    category: 'special_care',
    pricingType: 'per_item',
    unitPrice: 55000,
    unitName: 'đôi',
    description: 'Vệ sinh tay tỉ mỉ từ đế đến dây giày, khử mùi nano bạc và chiếu tia UV diệt nấm mốc bên trong.',
    iconName: 'Footprints',
    durationDays: 2,
    featured: true
  },
  {
    id: 'sc-leather',
    name: 'Làm Sạch & Dưỡng Da Giày Hiệu',
    category: 'special_care',
    pricingType: 'per_item',
    unitPrice: 120000,
    unitName: 'đôi',
    description: 'Sử dụng sáp dưỡng chuyên dụng phục hồi độ bóng bẩy tự nhiên cho giày da thật hoặc da lộn.',
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

export const DISTRICTS = {
  hanoi: [
    'Quận Cầu Giấy',
    'Quận Ba Đình',
    'Quận Đống Đa',
    'Quận Hoàn Kiếm',
    'Quận Hai Bà Trưng',
    'Quận Tây Hồ',
    'Quận Thanh Xuân',
    'Quận Hà Đông',
    'Quận Nam Từ Liêm',
    'Quận Bắc Từ Liêm',
    'Quận Hoàng Mai'
  ],
  hcm: [
    'Quận 1',
    'Quận 3',
    'Quận 5',
    'Quận 7',
    'Quận Phú Nhuận',
    'Quận Bình Thạnh',
    'Quận Gò Vấp',
    'Quận Tân Bình',
    'Quận Tân Phú',
    'Quận 10',
    'Quận 12',
    'Thành phố Thủ Đức'
  ]
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
    role: 'Nhân viên văn phòng, Q.3, HCM',
    comment: 'Từ lúc biết đến app này mình không phải đau đầu lo việc giặt ủi drap giường và áo vest nữa. Chỉ cần mươi phút bấm chọn giờ thu gom, đồ giao lại siêu thơm và xếp cực ngay ngắn!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100'
  },
  {
    name: 'Minh Hoàng',
    role: 'Doanh nhân, Q. Ba Đình, HN',
    comment: 'Dịch vụ giặt vest xuất sắc, giữ đúng phom dáng cao cấp nguyên vẹn. Nhân viên giao nhận rất lịch sự, đúng giờ. Sự tiện lợi ngoài mong đợi.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100'
  },
  {
    name: 'Mỹ Duyên',
    role: 'Sinh viên, Q. Cầu Giấy, HN',
    comment: 'Giá cả giặt sấy theo cân rất hợp túi tiền sinh viên. Thích nhất là được xem tiến trình đơn hàng giặt sấy di chuyển trực quan ngay trên điện thoại!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100'
  }
];
