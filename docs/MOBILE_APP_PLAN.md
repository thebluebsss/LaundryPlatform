# Kế Hoạch Triển Khai & Kiến Trúc Mobile App (Khách Hàng & Tài Xế)

Tài liệu này quy hoạch chi tiết kiến trúc kỹ thuật, cấu trúc thư mục, luồng màn hình và ánh xạ API để xây dựng **2 Phân hệ Mobile App (Khách hàng & Tài xế)** đồng bộ trực tiếp với **Web Portal Chủ Cửa Hàng (`/store-owner/*`)** và **9 Bảng Database** hiện có của dự án.

---

## 1. Nguyên Tắc Tái Sử Dụng Code Hiện Tại
1. **Dùng chung 100% Backend & Database (`src/server`)**:
   - Không cần viết lại Backend: Cả Web Chủ Cửa Hàng và Mobile App Khách/Tài xế đều gọi chung các API `/api/laundry-orders`, `/api/bookings`, `/api/delivery`, `/api/stores`, `/api/ai`, `/api/payments`.
2. **Dùng chung Types & Services (`src/types.ts`, `src/services/api.ts`)**:
   - Toàn bộ interface `LaundryOrder`, `CartItem` (`Order_Details`), `WeightConfirmStatus`, `DeliveryTask`, `GarmentInspectionResult` đã được chuẩn hóa đồng nhất.
3. **Cấu trúc thư mục lưu theo từng Page (`Page/index.tsx`, `Page/hook.ts`, `Page/components/*`)**:
   - Giữ nguyên chuẩn thiết kế tách biệt giao diện (`index.tsx`), logic gọi API & state (`hook.ts`), và các sub-components (`components/*`).

---

## 2. Phân Hệ 1: Mobile App Dành Cho Khách Hàng (Customer App)

### 2.1. Cấu trúc thư mục
```text
src/pages/MobileCustomer/
├── HomeMap/
│   ├── index.tsx
│   ├── hook.ts
│   └── components/
│       ├── NearbyStoreCard.tsx
│       └── ServiceCategoryTabs.tsx
├── CreateOrder/
│   ├── index.tsx
│   ├── hook.ts
│   └── components/
│       ├── OrderLineItemForm.tsx      # Thêm từng dòng đồ (fabricType, serviceId, estimatedQuantity)
│       ├── AiGarmentScannerModal.tsx  # Chụp ảnh món đồ lẻ / tem mác gửi AI phân tích (Tùy chọn)
│       └── PickupSchedulePicker.tsx
├── WeightConfirm/
│   ├── index.tsx
│   ├── hook.ts
│   └── components/
│       └── WeightComparisonSheet.tsx  # Đối chiếu Tạm tính vs Thực tế sau khi tiệm cân
└── OrderTracking/
    ├── index.tsx
    ├── hook.ts
    └── components/
        ├── LiveOrderTimeline.tsx
        └── VietQrPaymentModal.tsx
```

### 2.2. Luồng Nghiệp Vụ & API Tương Ứng (Khớp Sequence Diagram)
1. **Bước 1 — Chọn Tiệm Giặt & Khởi Tạo Đơn**:
   - Gọi `GET /api/stores/nearby` và `GET /api/services`.
2. **Bước 2 — Thêm Từng Dòng Đồ (`loop [Thêm từng dòng đồ giặt]`)**:
   - Khách hàng thêm 1 hoặc nhiều dòng đồ vào `items[]`:
     - **Trường hợp không dùng AI**: Khách tự chọn `serviceId`, `fabricType`, nhập `estimatedQuantity`.
     - **Trường hợp dùng AI (`opt [Sử dụng AI Kiểm tra món đồ]`)**: Khách chụp ảnh món đồ cần giặt riêng hoặc chụp tem mác $\rightarrow$ gọi `POST /api/ai/inspect-garment` $\rightarrow$ AI tự động gợi ý `fabricType`, gói giặt phù hợp và `careInstructions`.
   - Hoàn tất đặt đơn: Gọi `POST /api/laundry-orders` (trạng thái `status: 'pending'`, `weightConfirmStatus: 'not_weighed'`).
3. **Bước 3 — Xác Nhận Khối Lượng Thực Tế Khi Tiệm Cân Xong**:
   - Khi Chủ cửa hàng cân đồ trên Web (`/store-owner/orders`) và chuyển `weightConfirmStatus = 'waiting_customer'`, App Khách hàng hiển thị bảng đối chiếu số kg thực tế (`actualQuantity`) và tổng tiền mới (`actualSubtotal`).
   - Khách bấm **Đồng ý** $\rightarrow$ `PATCH /api/laundry-orders/:id/status` (`weightConfirmStatus: 'accepted'`, `status: 'washing'`).
4. **Bước 4 — Thanh Toán VietQR & Nhận Đồ Sạch**:
   - Quét mã QR thanh toán qua `POST /api/payments/create-payos-link` hoặc thanh toán khi nhận đồ.

---

## 3. Phân Hệ 2: Mobile App Dành Cho Tài Xế (Driver / Shipper App)

### 3.1. Cấu trúc thư mục
```text
src/pages/MobileDriver/
├── BroadcastRadar/
│   ├── index.tsx
│   ├── hook.ts
│   └── components/
│       ├── OnlineToggleHeader.tsx
│       └── BroadcastTaskItem.tsx
├── ActiveTask/
│   ├── index.tsx
│   ├── hook.ts
│   └── components/
│       ├──CustomerRouteMap.tsx
│       └── StatusSlideButton.tsx
└── DriverWallet/
    ├── index.tsx
    └── hook.ts
```

### 3.2. Luồng Nghiệp Vụ & API Tương Ứng
1. **Nhận Chuyến Phát Sóng (`broadcasting`)**:
   - Gọi `GET /api/delivery/available-tasks` để xem các chuyến đi lấy đồ bẩn (`pickup_from_customer`) và đi giao trả đồ sạch (`deliver_to_customer`).
   - Bấm nhận chuyến: Gọi `POST /api/delivery/accept-task`.
2. **Cập Nhật Tiến Trình Di Chuyển & Bàn Giao**:
   - Cập nhật GPS: `POST /api/delivery/update-location`.
   - Cập nhật trạng thái chuyến (`PATCH /api/delivery/task-status`):
     - `arrived_pickup`: Đã đến nhà khách hàng.
     - `picked_up`: Đã nhận giỏ đồ bẩn từ khách.
     - `in_transit`: Đang vận chuyển về cửa hàng.
     - `completed`: Đã bàn giao giỏ đồ cho Chủ tiệm (đồng bộ `LaundryOrder.status = 'sorting'` để Chủ tiệm cân thực tế trên Web).

---

## 4. Lộ Trình Thực Thi (Sprint Plan)
- **Sprint 1 (Hoàn thành trên Web)**: Xây dựng đầy đủ Web Portal dành cho Chủ Cửa Hàng (`/store-owner/dashboard`, `/store-owner/orders`, `/store-owner/equipment`, `/store-owner/deliveries`, `/store-owner/settings`) và chuẩn hóa API cân thực tế `/api/laundry-orders/:id/weigh`.
- **Sprint 2 (Mobile App Khách Hàng)**: Triển khai cụm màn hình Đặt đơn đa dòng đồ + AI Scanner (`CreateOrder`) và Màn hình xác nhận cân nặng thực tế (`WeightConfirm`).
- **Sprint 3 (Mobile App Tài Xế)**: Triển khai màn hình Radar nhận chuyến (`BroadcastRadar`), bản đồ dẫn đường Leaflet và cập nhật trạng thái giao nhận 2 chiều (`ActiveTask`).
