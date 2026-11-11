# Kế Hoạch Hoàn Thiện Hệ Thống: Xóa Dữ Liệu Mẫu, Tích Hợp Google Maps & Tách Cổng Web Chủ Tiệm / Admin

## 1. Mục tiêu tổng quan
Cập nhật toàn diện hệ thống **Sạch Sẽ - Giặt Sấy Thông Minh** theo 4 yêu cầu cốt lõi:
1. **Sửa triệt để các lỗi (bugs) còn tồn tại** trong luồng đặt đơn, theo dõi đơn hàng, tạo tiệm giặt và đồng bộ trạng thái giữa Khách hàng – Chủ tiệm – Tài xế – Admin.
2. **Xóa sạch 100% dữ liệu mẫu (Mock Data)** về cửa hàng (`DEFAULT_STORES`), tài xế (`DEFAULT_DRIVERS`), đơn hàng mẫu và bộ nhớ tạm (`localStorage`), đảm bảo cơ sở dữ liệu khởi tạo sạch để tạo mới từ đầu.
3. **Thay thế bản đồ Leaflet bằng Google Maps Platform** (`@vis.gl/react-google-maps`) trên cả giao diện Web (`/stores-map`) và App Mobile (`/mobile-customer/home`, `/mobile-customer/tracking`, `/mobile-driver/radar`), khắc phục triệt để lỗi nền xám và chồng lấp marker.
4. **Tách cổng Web và trang Đăng nhập riêng biệt** cho Chủ tiệm (`/store-owner/login`) và Quản trị viên (`/admin/login`) ngay trên cùng dự án, tách biệt hoàn toàn với cổng Khách hàng (`/auth`).

---

## 2. Chi tiết các hạng mục triển khai

### Hạng mục 1: Tách Cổng Đăng Nhập & Giao Diện Web Riêng (`/store-owner/login` & `/admin/login`)
- **Cổng Đối tác Chủ tiệm (`/store-owner/login`)**:
  - Xây dựng trang đăng nhập & đăng ký mở tiệm dành riêng cho Chủ tiệm giặt (`role: "store_owner"`).
  - Sau khi đăng nhập hoặc đăng ký tài khoản Chủ tiệm thành công, chuyển hướng trực tiếp vào không gian quản lý `/store-owner/dashboard`.
  - Nếu Chủ tiệm chưa khởi tạo thông tin cửa hàng trong CSDL, hiển thị biểu mẫu thiết lập cửa hàng đầu tiên (Tên tiệm, Địa chỉ, Tọa độ trên Google Maps, Số điện thoại, Giờ mở cửa) ngay tại Dashboard/Settings để lưu trực tiếp vào Database.
- **Cổng Quản trị viên Platform (`/admin/login`)**:
  - Giữ cổng đăng nhập độc lập cho Admin (`role: "admin"`), bảo vệ toàn bộ nhánh `/admin/*` bằng `AdminRoute`.
- **Cổng Khách hàng (`/auth`)**:
  - Chỉ cho phép đăng nhập/đăng ký tài khoản Khách hàng (`role: "customer"`). Nếu nhập tài khoản Chủ tiệm hoặc Admin tại `/auth`, hiển thị thông báo hướng dẫn truy cập đúng cổng `/store-owner/login` hoặc `/admin/login`.
  - Bổ sung liên kết điều hướng nhỏ dành cho Đối tác Chủ tiệm & Quản trị viên ở phần chân trang (Footer) để thuận tiện truy cập khi kiểm thử mà không làm ảnh hưởng đến thanh điều hướng của Khách hàng.

### Hạng mục 2: Xóa Sạch Toàn Bộ Dữ Liệu Mẫu (Stores, Drivers, Orders & LocalStorage)
- **Ở tầng Backend (`/src/server`)**:
  - **`storeController.ts`**: Gỡ bỏ toàn bộ logic fallback về `DEFAULT_STORES` và `DEFAULT_DRIVERS` trong các hàm `getNearbyStores`, `getStores`, `getStoreById`, `getStoreDrivers`. Khi CSDL chưa có tiệm hoặc tài xế nào, API trả về mảng rỗng `[]` đúng thực tế.
  - **`dbFallback.ts` & `local-preview-db.json`**: Xóa dữ liệu seed `stores: DEFAULT_STORES` mặc định; làm sạch dữ liệu tiệm mẫu và đơn hàng mẫu để hệ thống bắt đầu từ trạng thái sạch.
- **Ở tầng Frontend (`/src/pages` & `/src/services`)**:
  - Gỡ bỏ mọi import `DEFAULT_STORES`, `DEFAULT_DRIVERS` từ `/src/data/storesData.ts` tại:
    - `/src/pages/StoresMap/index.tsx`
    - `/src/pages/MobileCustomer/Home/hook.ts`
    - `/src/pages/StoreOwner/Dashboard/hook.ts`
    - `/src/pages/StoreOwner/Deliveries/hook.ts`
    - `/src/pages/StoreOwner/Settings/hook.ts`
    - `/src/pages/Admin/Stores/index.tsx`
  - **Bổ sung trạng thái trống (Empty States) chuẩn UX**: Khi chưa có cửa hàng hoặc đơn hàng nào trong CSDL, hiển thị thông báo rõ ràng kèm nút hành động (ví dụ: Chủ tiệm/Admin có thể bấm *"Tạo cửa hàng mới"* ngay trên giao diện).
  - **Xóa bộ nhớ tạm `localStorage` cũ**: Loại bỏ việc đọc/ghi đơn hàng hoặc danh sách tiệm giả lập trong `localStorage` (`sachse_laundry_orders`, `sachse_stores_data`, `sachse_store_drivers`) để tránh hiển thị lại dữ liệu rác trên trình duyệt.

### Hạng mục 3: Thay Thế Leaflet Bằng Google Maps Platform Trên Web & Mobile
- **Kích hoạt & Cấu hình Google Maps**:
  - Kích hoạt Google Maps Demo API Key chính thức thông qua công cụ tích hợp của AI Studio và cài đặt thư viện `@vis.gl/react-google-maps`.
  - Tạo component dùng chung `GoogleMapView` bọc trong `<APIProvider>` và `<Map mapId="DEMO_MAP_ID">`.
- **Bản đồ Hệ thống Cửa hàng trên Web (`/stores-map`)**:
  - Hiển thị bản đồ Google Maps tương tác thực tế với các `<AdvancedMarker>` biểu diễn vị trí từng tiệm giặt đang có trong CSDL, vị trí người dùng và lộ trình di chuyển.
  - Khi bấm vào một tiệm ở danh sách bên trái hoặc bấm vào Marker trên bản đồ, tự động dịch chuyển tâm bản đồ (`panTo`) và hiển thị khung thông tin chi tiết (`InfoWindow`) kèm nút *"Đặt giặt tại tiệm này"*.
- **Bản đồ trên App Mobile Khách hàng & Tài xế**:
  - Cập nhật bản đồ mini tại `/mobile-customer/home` (quét các tiệm giặt thật xung quanh), `/mobile-customer/tracking` (theo dõi vị trí tiệm & tài xế giao nhận) và `/mobile-driver/radar` sang Google Maps.
  - Hỗ trợ chọn/chấm tọa độ trực tiếp trên Google Maps khi Chủ tiệm hoặc Admin thêm/sửa địa chỉ tiệm giặt.

### Hạng mục 4: Khắc Phục Các Bug Nghiệp Vụ Hiện Tại
- **Bug phân quyền & lọc đơn hàng tại trang Theo dõi đơn (`/tracking`)**:
  - Sửa `/src/pages/Tracking/hook.ts` để truyền đúng `userId` của khách hàng đang đăng nhập (`laundryOrdersAPI.getAll({ userId: user.id })`) thay vì lấy toàn bộ đơn hàng của mọi người dùng.
- **Bug chọn cửa hàng khi Đặt đơn (`/booking` & `/mobile-customer/create-order`)**:
  - Cho phép khách hàng chọn chi nhánh tiệm giặt thực tế từ CSDL (hoặc tự động gán tiệm gần nhất đang mở cửa) để đơn hàng gắn đúng `storeId` của Chủ tiệm.
- **Bug quản lý Cửa hàng của Chủ tiệm (`/store-owner/settings` & `/store-owner/dashboard`)**:
  - Cho phép Chủ tiệm tạo mới cửa hàng nếu tài khoản chưa có cửa hàng nào, và cập nhật trực tiếp thông tin cửa hàng vào CSDL thông qua API `POST /api/stores` và `PUT /api/stores/:id`.
