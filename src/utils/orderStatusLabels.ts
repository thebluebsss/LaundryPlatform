import { OrderStatus } from "../types";

/**
 * Tên chuẩn hóa thống nhất cho Tiến độ Đơn Giặt trên toàn hệ thống (Khách hàng · Chủ tiệm giặt · Tài xế · Admin)
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ tài xế lấy đồ",
  picking_up: "Tài xế đang đi lấy đồ",
  sorting: "Đã tới tiệm · Chờ cân & phân loại",
  waiting_confirm: "Chờ khách duyệt cân thực tế",
  washing: "Đang giặt sấy",
  ironing: "Đang là ủi & đóng gói",
  delivering: "Tài xế đang giao trả đồ sạch",
  returning: "Đang hoàn trả đồ (Khách từ chối cân)",
  completed: "Đã hoàn thành giao trả",
  cancelled: "Đã hủy đơn",
};

/**
 * 8 Bước tiến độ chuẩn hiển thị trên thanh theo dõi của Khách hàng (App Khách Hàng)
 */
export const CUSTOMER_ORDER_STAGES: {
  key: OrderStatus;
  stepNumber: number;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    key: "pending",
    stepNumber: 1,
    label: "1. Đã đặt đơn · Chờ tài xế lấy đồ",
    shortLabel: "1. Chờ lấy đồ",
    description: "Đơn giặt đã khởi tạo và đang phát sóng tìm tài xế trong bán kính 1km",
  },
  {
    key: "picking_up",
    stepNumber: 2,
    label: "2. Tài xế đang đi lấy đồ",
    shortLabel: "2. Đang lấy đồ",
    description: "Tài xế đã nhận chuyến và đang di chuyển tới địa chỉ của bạn để nhận đồ",
  },
  {
    key: "sorting",
    stepNumber: 3,
    label: "3. Đã tới tiệm · Chờ cân & phân loại",
    shortLabel: "3. Chờ cân đo",
    description: "Tài xế đã bàn giao đồ cho tiệm — Chủ tiệm đang phân loại vải và cân thực tế",
  },
  {
    key: "waiting_confirm",
    stepNumber: 4,
    label: "4. Chờ khách duyệt cân thực tế",
    shortLabel: "4. Chờ duyệt cân",
    description: "Khối lượng thực tế có chênh lệch — Chờ bạn xác nhận chi phí trên ứng dụng",
  },
  {
    key: "washing",
    stepNumber: 5,
    label: "5. Đang giặt sấy",
    shortLabel: "5. Đang giặt sấy",
    description: "Đồ giặt đang được xử lý làm sạch và sấy khô khử khuẩn tại lồng giặt",
  },
  {
    key: "ironing",
    stepNumber: 6,
    label: "6. Đang là ủi & đóng gói",
    shortLabel: "6. Là ủi & đóng gói",
    description: "Quần áo đã giặt sạch, đang được là hơi phẳng phiu và đóng gói kín",
  },
  {
    key: "delivering",
    stepNumber: 7,
    label: "7. Tài xế đang giao trả đồ sạch",
    shortLabel: "7. Đang giao trả",
    description: "Tài xế đã nhận túi đồ sạch từ tiệm và đang trên đường giao trả tận nhà bạn",
  },
  {
    key: "completed",
    stepNumber: 8,
    label: "8. Đã hoàn thành giao trả",
    shortLabel: "8. Hoàn thành",
    description: "Đồ sạch đã được giao trả tận tay khách hàng và hoàn tất thanh toán",
  },
];

/**
 * Tên chuẩn hóa cho Tiến độ Chuyến Giao Nhận (Shipper & Điều phối Cửa hàng)
 */
export const DELIVERY_TASK_STATUS_LABELS: Record<string, string> = {
  broadcasting: "Đang phát sóng tìm tài xế (≤ 1km)",
  accepted: "Tài xế đã nhận chuyến",
  picking_up: "Tài xế đang di chuyển tới điểm lấy",
  arrived_pickup: "Tài xế đã tới điểm lấy đồ",
  picked_up: "Đã lấy đồ · Đang vận chuyển",
  in_transit: "Đang trên đường vận chuyển",
  completed: "Đã bàn giao đồ thành công",
  cancelled: "Đã hủy chuyến giao nhận",
};

/**
 * Tên chuẩn hóa cho Trạng thái xác nhận cân nặng thực tế
 */
export const WEIGHT_CONFIRM_STATUS_LABELS: Record<string, string> = {
  not_weighed: "Chưa cân thực tế",
  waiting_customer: "Chờ khách duyệt cân",
  accepted: "Đã chốt cân thực tế",
  rejected_return: "Khách từ chối cân · Hoàn trả đồ",
};

export const getOrderStatusLabel = (status?: string): string => {
  if (!status) return ORDER_STATUS_LABELS.pending;
  return (
    ORDER_STATUS_LABELS[status as OrderStatus] ||
    DELIVERY_TASK_STATUS_LABELS[status] ||
    status
  );
};
