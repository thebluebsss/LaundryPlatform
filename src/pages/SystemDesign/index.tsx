import React, { useState } from "react";
import {
  FileCode2,
  Download,
  Copy,
  Check,
  GitBranch,
  Users,
  CheckCircle2,
  Sun,
  Moon,
  Layers,
  Code2,
  LayoutGrid,
  LayoutList,
} from "lucide-react";

export interface SubUseCaseItem {
  id: string;
  name: string;
  rel: "include" | "extend";
}

export interface DecomposedCluster {
  id: string;
  parentUseCase: string; // 100% identical to Use Case Tổng Quát
  actorName: string;
  children: SubUseCaseItem[];
}

export interface ActorUseCaseGroup {
  actorKey: "customer" | "shipper" | "store" | "admin";
  actorLabel: string;
  actorSubLabel?: string;
  diagramTitle: string;
  clusters: DecomposedCluster[];
}

export const SHARED_AUTH_UC = "Quản lý tài khoản, đăng ký/ đăng nhập";

export const ACTOR_GROUPS: ActorUseCaseGroup[] = [
  {
    actorKey: "customer",
    actorLabel: "Khách hàng",
    diagramTitle: "BIỂU ĐỒ USE CASE PHÂN RÃ - KHÁCH HÀNG",
    clusters: [
      {
        id: "kh-1",
        parentUseCase: SHARED_AUTH_UC,
        actorName: "Khách hàng",
        children: [
          { id: "kh-1-1", name: "Đăng ký", rel: "extend" },
          { id: "kh-1-2", name: "Đăng nhập", rel: "include" },
          { id: "kh-1-3", name: "Quên mật khẩu", rel: "extend" },
          { id: "kh-1-4", name: "Thay đổi thông tin tài khoản", rel: "extend" },
        ],
      },
      {
        id: "kh-2",
        parentUseCase: "Tra cứu thông tin dịch vụ",
        actorName: "Khách hàng",
        children: [
          { id: "kh-2-1", name: "Xem bảng giá dịch vụ giặt sấy", rel: "include" },
          { id: "kh-2-2", name: "Xem danh mục sản phẩm chăm sóc quần áo", rel: "extend" },
          { id: "kh-2-3", name: "Ước tính chi phí giặt sấy tham khảo", rel: "extend" },
        ],
      },
      {
        id: "kh-3",
        parentUseCase: "Tìm kiếm cửa hàng",
        actorName: "Khách hàng",
        children: [
          { id: "kh-3-1", name: "Tìm kiếm theo ranking các cửa hàng", rel: "extend" },
          { id: "kh-3-2", name: "Định vị vị trí hiện tại trên bản đồ", rel: "extend" },
          { id: "kh-3-3", name: "Tìm tiệm giặt gần nhất trên bản đồ", rel: "include" },
        ],
      },
      {
        id: "kh-4",
        parentUseCase: "Đặt lịch dịch vụ giặt sấy",
        actorName: "Khách hàng",
        children: [
          { id: "kh-4-1", name: "Chọn cửa hàng giặt sấy", rel: "include" },
          {
            id: "kh-4-2",
            name: "Thêm từng dòng chi tiết: Chọn gói giặt, loại vải, số lượng tạm tính",
            rel: "include",
          },
          {
            id: "kh-4-3",
            name: "Nhập địa chỉ, thời gian lấy/giao đồ tận nơi, mô tả/ghi chú",
            rel: "include",
          },
          {
            id: "kh-4-4",
            name: "Sử dụng công cụ gợi ý chế độ giặt theo chất liệu vải (AI)",
            rel: "extend",
          },
          {
            id: "kh-4-5",
            name: "Chọn mua kèm sản phẩm chăm sóc quần áo",
            rel: "extend",
          },
        ],
      },
      {
        id: "kh-5",
        parentUseCase: "Thanh toán đơn hàng",
        actorName: "Khách hàng",
        children: [
          { id: "kh-5-1", name: "Thanh toán tiền mặt khi nhận đồ (COD)", rel: "extend" },
          { id: "kh-5-2", name: "Thanh toán trực tuyến (Chuyển khoản / QR)", rel: "extend" },
        ],
      },
      {
        id: "kh-6",
        parentUseCase: "Theo dõi tiến độ đơn hàng cá nhân",
        actorName: "Khách hàng",
        children: [
          { id: "kh-6-1", name: "Xem trạng thái xử lý giặt sấy", rel: "include" },
          { id: "kh-6-2", name: "Theo dõi lộ trình Shipper giao nhận", rel: "include" },
          {
            id: "kh-6-3",
            name: "Xác nhận khối lượng và chi phí thực tế sau khi tiệm cân",
            rel: "extend",
          },
          {
            id: "kh-6-4",
            name: "Hủy đơn hàng (Khi đơn đang chờ xác nhận)",
            rel: "extend",
          },
        ],
      },
      {
        id: "kh-7",
        parentUseCase: "Quản lý lịch sử đơn hàng cá nhân",
        actorName: "Khách hàng",
        children: [
          { id: "kh-7-1", name: "Xem danh sách đơn hàng đã hoàn thành", rel: "include" },
          { id: "kh-7-2", name: "Xem chi tiết hóa đơn và từng dòng đồ giặt", rel: "include" },
          { id: "kh-7-3", name: "Đánh giá chất lượng cửa hàng và tài xế", rel: "extend" },
          { id: "kh-7-4", name: "Đặt lại đơn giặt tương tự", rel: "extend" },
        ],
      },
    ],
  },
  {
    actorKey: "shipper",
    actorLabel: "Shipper",
    actorSubLabel: "(Tài xế giao nhận)",
    diagramTitle: "BIỂU ĐỒ USE CASE PHÂN RÃ - SHIPPER (TÀI XẾ GIAO NHẬN)",
    clusters: [
      {
        id: "sp-1",
        parentUseCase: SHARED_AUTH_UC,
        actorName: "Shipper (Tài xế giao nhận)",
        children: [
          { id: "sp-1-1", name: "Đăng ký tài khoản tài xế", rel: "extend" },
          { id: "sp-1-2", name: "Đăng nhập", rel: "include" },
          { id: "sp-1-3", name: "Quên mật khẩu", rel: "extend" },
          {
            id: "sp-1-4",
            name: "Thay đổi thông tin tài khoản và phương tiện",
            rel: "extend",
          },
        ],
      },
      {
        id: "sp-2",
        parentUseCase: "Quản lý trạng thái hoạt động",
        actorName: "Shipper (Tài xế giao nhận)",
        children: [
          {
            id: "sp-2-1",
            name: "Bật hoặc tắt trạng thái sẵn sàng nhận chuyến",
            rel: "include",
          },
          {
            id: "sp-2-2",
            name: "Cập nhật vị trí định vị GPS thời gian thực",
            rel: "include",
          },
        ],
      },
      {
        id: "sp-3",
        parentUseCase: "Tiếp nhận chuyến giao nhận mới",
        actorName: "Shipper (Tài xế giao nhận)",
        children: [
          {
            id: "sp-3-1",
            name: "Xem danh sách chuyến phát sóng gần đây",
            rel: "include",
          },
          {
            id: "sp-3-2",
            name: "Xem chi tiết lộ trình và cước phí chuyến đi",
            rel: "include",
          },
          { id: "sp-3-3", name: "Xác nhận nhận chuyến giao nhận", rel: "extend" },
          { id: "sp-3-4", name: "Từ chối hoặc bỏ qua chuyến phát sóng", rel: "extend" },
        ],
      },
      {
        id: "sp-4",
        parentUseCase: "Quản lý các đơn hàng đã nhận",
        actorName: "Shipper (Tài xế giao nhận)",
        children: [
          { id: "sp-4-1", name: "Xem danh sách đơn hàng đang thực hiện", rel: "include" },
          {
            id: "sp-4-2",
            name: "Xem bản đồ điều hướng đến điểm lấy hoặc giao đồ",
            rel: "include",
          },
          { id: "sp-4-3", name: "Liên hệ khách hàng hoặc chủ tiệm giặt", rel: "extend" },
          {
            id: "sp-4-4",
            name: "Xem lịch sử chuyến giao nhận và ví thu nhập",
            rel: "extend",
          },
        ],
      },
      {
        id: "sp-5",
        parentUseCase: "Cập nhật tiến độ giao nhận",
        actorName: "Shipper (Tài xế giao nhận)",
        children: [
          {
            id: "sp-5-1",
            name: "Xác nhận đã lấy đồ bẩn từ khách hàng",
            rel: "include",
          },
          {
            id: "sp-5-2",
            name: "Xác nhận đã bàn giao đồ cho tiệm giặt",
            rel: "include",
          },
          {
            id: "sp-5-3",
            name: "Xác nhận đã giao trả đồ sạch cho khách hàng",
            rel: "include",
          },
          {
            id: "sp-5-4",
            name: "Xác nhận thu tiền mặt (COD) từ khách hàng",
            rel: "extend",
          },
        ],
      },
    ],
  },
  {
    actorKey: "store",
    actorLabel: "Chủ tiệm giặt",
    actorSubLabel: "(Store Manager)",
    diagramTitle: "BIỂU ĐỒ USE CASE PHÂN RÃ - CHỦ TIỆM GIẶT (STORE MANAGER)",
    clusters: [
      {
        id: "sm-1",
        parentUseCase: SHARED_AUTH_UC,
        actorName: "Chủ tiệm giặt (Store Manager)",
        children: [
          { id: "sm-1-1", name: "Đăng nhập", rel: "include" },
          { id: "sm-1-2", name: "Quên mật khẩu", rel: "extend" },
          {
            id: "sm-1-3",
            name: "Thay đổi thông tin tài khoản và hồ sơ tiệm",
            rel: "extend",
          },
        ],
      },
      {
        id: "sm-2",
        parentUseCase: "Quản lý đơn hàng tại tiệm",
        actorName: "Chủ tiệm giặt (Store Manager)",
        children: [
          {
            id: "sm-2-1",
            name: "Tiếp nhận đơn hàng mới và phân loại vải",
            rel: "include",
          },
          {
            id: "sm-2-2",
            name: "Cân khối lượng thực tế cho từng dòng đồ giặt",
            rel: "include",
          },
          {
            id: "sm-2-3",
            name: "Gửi thông báo chênh lệch khối lượng chờ khách xác nhận",
            rel: "extend",
          },
          {
            id: "sm-2-4",
            name: "Cập nhật tiến độ xử lý giặt, sấy, gấp gọn",
            rel: "include",
          },
        ],
      },
      {
        id: "sm-3",
        parentUseCase: "Quản lý thông tin khách của tiệm",
        actorName: "Chủ tiệm giặt (Store Manager)",
        children: [
          {
            id: "sm-3-1",
            name: "Tra cứu thông tin liên hệ khách hàng đặt đơn",
            rel: "include",
          },
          {
            id: "sm-3-2",
            name: "Xem lịch sử đặt giặt của khách tại tiệm",
            rel: "include",
          },
          {
            id: "sm-3-3",
            name: "Ghi chú lưu ý chăm sóc vải riêng cho khách quen",
            rel: "extend",
          },
        ],
      },
      {
        id: "sm-4",
        parentUseCase: "Điều phối giao nhận tại tiệm",
        actorName: "Chủ tiệm giặt (Store Manager)",
        children: [
          {
            id: "sm-4-1",
            name: "Phát yêu cầu tìm Shipper đi lấy đồ bẩn",
            rel: "include",
          },
          {
            id: "sm-4-2",
            name: "Phát yêu cầu tìm Shipper đi giao trả đồ sạch",
            rel: "include",
          },
          {
            id: "sm-4-3",
            name: "Xác nhận bàn giao túi đồ với Shipper tại quầy",
            rel: "include",
          },
          {
            id: "sm-4-4",
            name: "Yêu cầu Shipper hoàn trả đồ khi khách từ chối giá mới",
            rel: "extend",
          },
        ],
      },
      {
        id: "sm-5",
        parentUseCase: "Quản lý dịch vụ tại tiệm",
        actorName: "Chủ tiệm giặt (Store Manager)",
        children: [
          {
            id: "sm-5-1",
            name: "Xem danh sách gói dịch vụ giặt sấy tại tiệm",
            rel: "include",
          },
          {
            id: "sm-5-2",
            name: "Bật hoặc tắt trạng thái nhận khách của từng gói giặt",
            rel: "extend",
          },
          {
            id: "sm-5-3",
            name: "Cấu hình khung giờ nhận và trả đồ tại tiệm",
            rel: "extend",
          },
        ],
      },
      {
        id: "sm-6",
        parentUseCase: "Quản lý máy móc thiết bị tại tiệm",
        actorName: "Chủ tiệm giặt (Store Manager)",
        children: [
          {
            id: "sm-6-1",
            name: "Theo dõi trạng thái hoạt động của máy giặt và máy sấy",
            rel: "include",
          },
          {
            id: "sm-6-2",
            name: "Gán mẻ giặt của đơn hàng vào máy đang trống",
            rel: "extend",
          },
          {
            id: "sm-6-3",
            name: "Cập nhật trạng thái bảo trì hoặc báo hỏng thiết bị",
            rel: "extend",
          },
        ],
      },
      {
        id: "sm-7",
        parentUseCase: "Xem báo cáo thống kê doanh thu tại tiệm",
        actorName: "Chủ tiệm giặt (Store Manager)",
        children: [
          {
            id: "sm-7-1",
            name: "Xem thống kê doanh thu theo ngày, tuần, tháng",
            rel: "include",
          },
          {
            id: "sm-7-2",
            name: "Thống kê số lượng đơn hoàn thành tại tiệm",
            rel: "include",
          },
          {
            id: "sm-7-3",
            name: "Xuất báo cáo kết quả kinh doanh của tiệm",
            rel: "extend",
          },
        ],
      },
    ],
  },
  {
    actorKey: "admin",
    actorLabel: "Quản trị viên",
    actorSubLabel: "(System Admin)",
    diagramTitle: "BIỂU ĐỒ USE CASE PHÂN RÃ - QUẢN TRỊ VIÊN (SYSTEM ADMIN)",
    clusters: [
      {
        id: "ad-1",
        parentUseCase: SHARED_AUTH_UC,
        actorName: "Quản trị viên (System Admin)",
        children: [
          { id: "ad-1-1", name: "Đăng nhập hệ thống quản trị", rel: "include" },
          { id: "ad-1-2", name: "Quên mật khẩu", rel: "extend" },
          {
            id: "ad-1-3",
            name: "Thay đổi thông tin tài khoản quản trị",
            rel: "extend",
          },
        ],
      },
      {
        id: "ad-2",
        parentUseCase: "Quản lý chuỗi cửa hàng",
        actorName: "Quản trị viên (System Admin)",
        children: [
          {
            id: "ad-2-1",
            name: "Xem danh sách và trạng thái các chi nhánh cửa hàng",
            rel: "include",
          },
          {
            id: "ad-2-2",
            name: "Thêm mới chi nhánh cửa hàng lên bản đồ",
            rel: "extend",
          },
          {
            id: "ad-2-3",
            name: "Cập nhật thông tin hoặc tạm ngưng chi nhánh",
            rel: "extend",
          },
          { id: "ad-2-4", name: "Gán chủ tiệm quản lý chi nhánh", rel: "extend" },
        ],
      },
      {
        id: "ad-3",
        parentUseCase: "Quản lý danh mục dịch vụ giặt sấy",
        actorName: "Quản trị viên (System Admin)",
        children: [
          {
            id: "ad-3-1",
            name: "Xem danh sách gói dịch vụ giặt sấy toàn hệ thống",
            rel: "include",
          },
          { id: "ad-3-2", name: "Thêm mới gói dịch vụ giặt sấy", rel: "extend" },
          {
            id: "ad-3-3",
            name: "Cập nhật đơn giá chuẩn theo kg hoặc theo món",
            rel: "extend",
          },
          {
            id: "ad-3-4",
            name: "Ẩn hoặc ngừng cung cấp gói dịch vụ",
            rel: "extend",
          },
        ],
      },
      {
        id: "ad-4",
        parentUseCase: "Quản lý danh mục sản phẩm bán kèm",
        actorName: "Quản trị viên (System Admin)",
        children: [
          {
            id: "ad-4-1",
            name: "Xem danh sách sản phẩm chăm sóc quần áo",
            rel: "include",
          },
          {
            id: "ad-4-2",
            name: "Thêm mới sản phẩm nước giặt, nước xả, phụ kiện",
            rel: "extend",
          },
          {
            id: "ad-4-3",
            name: "Cập nhật giá bán và số lượng tồn kho",
            rel: "extend",
          },
          {
            id: "ad-4-4",
            name: "Xóa hoặc ngừng kinh doanh sản phẩm",
            rel: "extend",
          },
        ],
      },
      {
        id: "ad-5",
        parentUseCase: "Quản trị tài khoản người dùng",
        actorName: "Quản trị viên (System Admin)",
        children: [
          {
            id: "ad-5-1",
            name: "Xem danh sách tài khoản toàn hệ thống",
            rel: "include",
          },
          {
            id: "ad-5-2",
            name: "Duyệt hồ sơ đăng ký đối tác Shipper và Chủ tiệm",
            rel: "extend",
          },
          {
            id: "ad-5-3",
            name: "Khóa hoặc mở khóa tài khoản người dùng",
            rel: "extend",
          },
        ],
      },
      {
        id: "ad-6",
        parentUseCase: "Phân quyền toàn hệ thống",
        actorName: "Quản trị viên (System Admin)",
        children: [
          { id: "ad-6-1", name: "Xem cấu hình vai trò người dùng", rel: "include" },
          {
            id: "ad-6-2",
            name: "Cấp quyền Chủ tiệm giặt hoặc Shipper",
            rel: "extend",
          },
          {
            id: "ad-6-3",
            name: "Thu hồi hoặc thay đổi quyền truy cập tài khoản",
            rel: "extend",
          },
        ],
      },
      {
        id: "ad-7",
        parentUseCase: "Xem báo cáo thống kê toàn hệ thống",
        actorName: "Quản trị viên (System Admin)",
        children: [
          {
            id: "ad-7-1",
            name: "Xem báo cáo tổng hợp số lượng đơn hàng toàn chuỗi",
            rel: "include",
          },
          {
            id: "ad-7-2",
            name: "Thống kê doanh thu toàn hệ thống theo kỳ",
            rel: "include",
          },
          {
            id: "ad-7-3",
            name: "Xuất báo cáo tổng hợp toàn hệ thống",
            rel: "extend",
          },
        ],
      },
    ],
  },
];

// Escape XML special characters for Draw.io file generation
function escXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Helper to wrap text into multiple lines
function wrapTextLines(text: string, maxCharsPerLine = 26): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxCharsPerLine && current.length > 0) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current.trim().length > 0) lines.push(current.trim());
  return lines;
}

// Compute even vertical distribution for a column of clusters inside a fixed square height
interface ComputedClusterLayout {
  cluster: DecomposedCluster;
  globalIdx: number;
  colIdx: 0 | 1;
  startChildY: number;
  parentCy: number;
  childSpacing: number;
}

function computeSquareTwoColumnLayout(
  clusters: DecomposedCluster[],
  topY = 135,
  bottomY = 1525,
  childSpacing = 74
): ComputedClusterLayout[] {
  const leftCount = Math.ceil(clusters.length / 2); // 4 for 7 clusters, 3 for 5 clusters
  const leftClusters = clusters.slice(0, leftCount);
  const rightClusters = clusters.slice(leftCount);

  const usableHeight = bottomY - topY;
  const results: ComputedClusterLayout[] = [];

  const layoutSingleCol = (
    colList: DecomposedCluster[],
    colIdx: 0 | 1,
    indexOffset: number
  ) => {
    const spans = colList.map((c) =>
      Math.max(0, (c.children.length - 1) * childSpacing)
    );
    const totalSpan = spans.reduce((acc, s) => acc + s, 0);
    // Distribute remaining vertical space evenly before, between, and after clusters
    const evenGap = Math.max(
      70,
      (usableHeight - totalSpan) / (colList.length + 1)
    );

    let curY = topY + evenGap;
    colList.forEach((cluster, idx) => {
      const span = spans[idx];
      const startChildY = curY;
      const parentCy = curY + span / 2;
      results.push({
        cluster,
        globalIdx: indexOffset + idx,
        colIdx,
        startChildY,
        parentCy,
        childSpacing,
      });
      curY += span + evenGap;
    });
  };

  layoutSingleCol(leftClusters, 0, 0);
  layoutSingleCol(rightClusters, 1, leftCount);

  return results;
}

// Generate clean PlantUML for General Use Case Diagram
export function generateGeneralPlantUml(): string {
  return `@startuml
left to right direction
skinparam packageStyle rectangle
skinparam shadow false
skinparam nodesep 35
skinparam ranksep 110
skinparam usecase {
  BackgroundColor #FFFFFF
  BorderColor #1E293B
  ArrowColor #1E293B
  FontSize 12
}
skinparam actor {
  BackgroundColor #FFFFFF
  BorderColor #1E293B
  FontSize 12
}

actor "Khách hàng" as KH
actor "Shipper\\n(Tài xế giao nhận)" as SP
actor "Chủ tiệm giặt\\n(Store Manager)" as SM
actor "Quản trị viên\\n(System Admin)" as AD

KH -[hidden]down- SP
SM -[hidden]down- AD

rectangle "HỆ THỐNG QUẢN LÝ DỊCH VỤ GIẶT SẤY (USE CASE TỔNG QUÁT)" {
  usecase "Quản lý tài khoản, đăng ký/ đăng nhập" as UC_AUTH

  ' Nhóm Khách hàng (6 UC riêng + 1 UC dùng chung = 7 UC)
  usecase "Tra cứu thông tin dịch vụ" as KH_UC2
  usecase "Tìm kiếm cửa hàng" as KH_UC3
  usecase "Đặt lịch dịch vụ giặt sấy" as KH_UC4
  usecase "Thanh toán đơn hàng" as KH_UC5
  usecase "Theo dõi tiến độ đơn hàng cá nhân" as KH_UC6
  usecase "Quản lý lịch sử đơn hàng cá nhân" as KH_UC7

  ' Nhóm Shipper (4 UC riêng + 1 UC dùng chung = 5 UC)
  usecase "Quản lý trạng thái hoạt động" as SP_UC2
  usecase "Tiếp nhận chuyến giao nhận mới" as SP_UC3
  usecase "Quản lý các đơn hàng đã nhận" as SP_UC4
  usecase "Cập nhật tiến độ giao nhận" as SP_UC5

  ' Nhóm Chủ tiệm giặt (6 UC riêng + 1 UC dùng chung = 7 UC)
  usecase "Quản lý đơn hàng tại tiệm" as SM_UC2
  usecase "Quản lý thông tin khách của tiệm" as SM_UC3
  usecase "Điều phối giao nhận tại tiệm" as SM_UC4
  usecase "Quản lý dịch vụ tại tiệm" as SM_UC5
  usecase "Quản lý máy móc thiết bị tại tiệm" as SM_UC6
  usecase "Xem báo cáo thống kê doanh thu tại tiệm" as SM_UC7

  ' Nhóm Quản trị viên (6 UC riêng + 1 UC dùng chung = 7 UC)
  usecase "Quản lý chuỗi cửa hàng" as AD_UC2
  usecase "Quản lý danh mục dịch vụ giặt sấy" as AD_UC3
  usecase "Quản lý danh mục sản phẩm bán kèm" as AD_UC4
  usecase "Quản trị tài khoản người dùng" as AD_UC5
  usecase "Phân quyền toàn hệ thống" as AD_UC6
  usecase "Xem báo cáo thống kê toàn hệ thống" as AD_UC7
}

' Liên kết Khách hàng
KH --> UC_AUTH
KH --> KH_UC2
KH --> KH_UC3
KH --> KH_UC4
KH --> KH_UC5
KH --> KH_UC6
KH --> KH_UC7

' Liên kết Shipper
SP --> UC_AUTH
SP --> SP_UC2
SP --> SP_UC3
SP --> SP_UC4
SP --> SP_UC5

' Liên kết Chủ tiệm giặt
UC_AUTH <-- SM
SM_UC2 <-- SM
SM_UC3 <-- SM
SM_UC4 <-- SM
SM_UC5 <-- SM
SM_UC6 <-- SM
SM_UC7 <-- SM

' Liên kết Quản trị viên
UC_AUTH <-- AD
AD_UC2 <-- AD
AD_UC3 <-- AD
AD_UC4 <-- AD
AD_UC5 <-- AD
AD_UC6 <-- AD
AD_UC7 <-- AD
@enduml`;
}

// Generate 2-Column Square Frame PlantUML for an Actor's Decomposed Use Case Diagram
export function generateActorDecomposedPlantUml(group: ActorUseCaseGroup): string {
  const prefix = group.actorKey.toUpperCase();
  const actorDisplay = group.actorSubLabel
    ? `${group.actorLabel}\\n${group.actorSubLabel}`
    : group.actorLabel;

  const leftCount = Math.ceil(group.clusters.length / 2);
  const leftActors = group.clusters
    .slice(0, leftCount)
    .map((_, i) => `actor "${actorDisplay}" as ${prefix}${i + 1}`)
    .join("\n");

  const rightActors = group.clusters
    .slice(leftCount)
    .map((_, i) => `actor "${actorDisplay}" as ${prefix}${leftCount + i + 1}`)
    .join("\n    ");

  const clustersCode = group.clusters
    .map((cluster, cIdx) => {
      const n = cIdx + 1;
      const pAlias = `${prefix}_UC${n}`;
      const wrappedParent = wrapTextLines(cluster.parentUseCase, 26).join("\\n");

      const childDecls = cluster.children
        .map((ch, chIdx) => {
          const wrappedChild = wrapTextLines(ch.name, 28).join("\\n");
          return `  usecase "${wrappedChild}" as ${pAlias}_${chIdx + 1}`;
        })
        .join("\n");

      const relLines = cluster.children
        .map((ch, chIdx) => {
          const cAlias = `${pAlias}_${chIdx + 1}`;
          return ch.rel === "include"
            ? `  ${pAlias} ..> ${cAlias} : <<include>>`
            : `  ${pAlias} <.. ${cAlias} : <<extend>>`;
        })
        .join("\n");

      return `  ' Cụm ${n}: ${cluster.parentUseCase}
  usecase "${wrappedParent}" as ${pAlias}
${childDecls}
  ${prefix}${n} --> ${pAlias}
${relLines}`;
    })
    .join("\n\n");

  // Hidden bridges from Left Column child use cases to Right Column actors so PlantUML arranges a balanced 2-column square frame
  const horizontalBridges = group.clusters
    .slice(leftCount)
    .map((_, idx) => {
      const leftClusterIdx = idx + 1;
      const rightActorIdx = leftCount + idx + 1;
      const midChildIdx = Math.ceil(
        group.clusters[idx].children.length / 2
      );
      return `  ${prefix}_UC${leftClusterIdx}_${midChildIdx} -[hidden]--> ${prefix}${rightActorIdx}`;
    })
    .join("\n");

  return `@startuml
left to right direction
skinparam packageStyle rectangle
skinparam shadow false
skinparam nodesep 36
skinparam ranksep 90
skinparam usecase {
  BackgroundColor #FFFFFF
  BorderColor #1E293B
  ArrowColor #1E293B
  FontSize 12
}

' Cột trái (${leftCount} Actor ngoài khung)
${leftActors}

rectangle "${group.diagramTitle}" {
  ' Cột phải (${group.clusters.length - leftCount} Actor chia đều bên phải)
  ${rightActors}

${clustersCode}

  ' Liên kết ẩn chia đều 2 cột trong 1 khung hình vuông cân đối
${horizontalBridges}
}
@enduml`;
}

// Generate standalone PlantUML for a single functional cluster
export function generateSingleClusterPlantUml(
  group: ActorUseCaseGroup,
  cluster: DecomposedCluster,
  clusterIdx: number
): string {
  const actorDisplay = group.actorSubLabel
    ? `${group.actorLabel}\\n${group.actorSubLabel}`
    : group.actorLabel;
  const pAlias = `UC_PARENT_${clusterIdx + 1}`;

  const childDecls = cluster.children
    .map(
      (ch, i) =>
        `  usecase "${wrapTextLines(ch.name, 28).join("\\n")}" as UC_CH_${i + 1}`
    )
    .join("\n");

  const rels = cluster.children
    .map((ch, i) =>
      ch.rel === "include"
        ? `  ${pAlias} ..> UC_CH_${i + 1} : <<include>>`
        : `  ${pAlias} <.. UC_CH_${i + 1} : <<extend>>`
    )
    .join("\n");

  return `@startuml
left to right direction
skinparam packageStyle rectangle
skinparam shadow false
skinparam nodesep 45
skinparam ranksep 130

actor "${actorDisplay}" as ACT

rectangle "Phân rã chức năng: ${cluster.parentUseCase}" {
  usecase "${wrapTextLines(cluster.parentUseCase, 26).join("\\n")}" as ${pAlias}
${childDecls}

  ACT --> ${pAlias}
${rels}
}
@enduml`;
}

// Generate 5-Page .drawio XML where every Decomposed Use Case Diagram is distributed evenly inside a 1520x1520 Square Frame (2 Columns)
export function generateDrawioXml(): string {
  const customerUCs = ACTOR_GROUPS[0].clusters
    .filter((c) => c.parentUseCase !== SHARED_AUTH_UC)
    .map((c) => c.parentUseCase);
  const shipperUCs = ACTOR_GROUPS[1].clusters
    .filter((c) => c.parentUseCase !== SHARED_AUTH_UC)
    .map((c) => c.parentUseCase);
  const storeUCs = ACTOR_GROUPS[2].clusters
    .filter((c) => c.parentUseCase !== SHARED_AUTH_UC)
    .map((c) => c.parentUseCase);
  const adminUCs = ACTOR_GROUPS[3].clusters
    .filter((c) => c.parentUseCase !== SHARED_AUTH_UC)
    .map((c) => c.parentUseCase);

  let cellsPage1 = `
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="sys_box" value="HỆ THỐNG QUẢN LÝ DỊCH VỤ GIẶT SẤY (USE CASE TỔNG QUÁT)" style="rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;fontStyle=1;fontSize=15;spacingTop=12;" vertex="1" parent="1">
      <mxGeometry x="220" y="30" width="880" height="1220" as="geometry"/>
    </mxCell>
    <mxCell id="uc_shared_auth" value="${escXml(SHARED_AUTH_UC)}" style="ellipse;whiteSpace=wrap;html=1;fontStyle=1;fontSize=12;" vertex="1" parent="1">
      <mxGeometry x="510" y="95" width="300" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="act_kh" value="Khách hàng" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;" vertex="1" parent="1">
      <mxGeometry x="75" y="370" width="40" height="80" as="geometry"/>
    </mxCell>
    <mxCell id="act_sp" value="Shipper&#xa;(Tài xế giao nhận)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;" vertex="1" parent="1">
      <mxGeometry x="75" y="860" width="40" height="80" as="geometry"/>
    </mxCell>
    <mxCell id="act_sm" value="Chủ tiệm giặt&#xa;(Store Manager)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;" vertex="1" parent="1">
      <mxGeometry x="1205" y="370" width="40" height="80" as="geometry"/>
    </mxCell>
    <mxCell id="act_ad" value="Quản trị viên&#xa;(System Admin)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;" vertex="1" parent="1">
      <mxGeometry x="1205" y="900" width="40" height="80" as="geometry"/>
    </mxCell>
    <mxCell id="edge_kh_auth" style="endArrow=none;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="act_kh" target="uc_shared_auth">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="edge_sp_auth" style="endArrow=none;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="act_sp" target="uc_shared_auth">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
          <mxPoint x="35" y="900"/>
          <mxPoint x="35" y="125"/>
        </Array>
      </mxGeometry>
    </mxCell>
    <mxCell id="edge_sm_auth" style="endArrow=none;html=1;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="act_sm" target="uc_shared_auth">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="edge_ad_auth" style="endArrow=none;html=1;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="act_ad" target="uc_shared_auth">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
          <mxPoint x="1285" y="940"/>
          <mxPoint x="1285" y="125"/>
        </Array>
      </mxGeometry>
    </mxCell>
  `;

  customerUCs.forEach((uc, idx) => {
    const y = 195 + idx * 85;
    cellsPage1 += `
      <mxCell id="kh_uc_${idx}" value="${escXml(uc)}" style="ellipse;whiteSpace=wrap;html=1;fontSize=12;" vertex="1" parent="1">
        <mxGeometry x="280" y="${y}" width="290" height="58" as="geometry"/>
      </mxCell>
      <mxCell id="kh_edge_${idx}" style="endArrow=none;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="act_kh" target="kh_uc_${idx}">
        <mxGeometry relative="1" as="geometry"/>
      </mxCell>
    `;
  });

  shipperUCs.forEach((uc, idx) => {
    const y = 755 + idx * 85;
    cellsPage1 += `
      <mxCell id="sp_uc_${idx}" value="${escXml(uc)}" style="ellipse;whiteSpace=wrap;html=1;fontSize=12;" vertex="1" parent="1">
        <mxGeometry x="280" y="${y}" width="290" height="58" as="geometry"/>
      </mxCell>
      <mxCell id="sp_edge_${idx}" style="endArrow=none;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="act_sp" target="sp_uc_${idx}">
        <mxGeometry relative="1" as="geometry"/>
      </mxCell>
    `;
  });

  storeUCs.forEach((uc, idx) => {
    const y = 195 + idx * 85;
    cellsPage1 += `
      <mxCell id="sm_uc_${idx}" value="${escXml(uc)}" style="ellipse;whiteSpace=wrap;html=1;fontSize=12;" vertex="1" parent="1">
        <mxGeometry x="750" y="${y}" width="290" height="58" as="geometry"/>
      </mxCell>
      <mxCell id="sm_edge_${idx}" style="endArrow=none;html=1;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="act_sm" target="sm_uc_${idx}">
        <mxGeometry relative="1" as="geometry"/>
      </mxCell>
    `;
  });

  adminUCs.forEach((uc, idx) => {
    const y = 720 + idx * 85;
    cellsPage1 += `
      <mxCell id="ad_uc_${idx}" value="${escXml(uc)}" style="ellipse;whiteSpace=wrap;html=1;fontSize=12;" vertex="1" parent="1">
        <mxGeometry x="750" y="${y}" width="290" height="58" as="geometry"/>
      </mxCell>
      <mxCell id="ad_edge_${idx}" style="endArrow=none;html=1;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="act_ad" target="ad_uc_${idx}">
        <mxGeometry relative="1" as="geometry"/>
      </mxCell>
    `;
  });

  // Pages 2..5: Decomposed Use Case Diagrams distributed evenly inside a 1520x1520 Square Frame (2 Columns)
  const actorPagesXml = ACTOR_GROUPS.map((group) => {
    const layoutItems = computeSquareTwoColumnLayout(
      group.clusters,
      135,
      1525,
      74
    );

    let innerCells = "";

    layoutItems.forEach(({ cluster, colIdx, startChildY, parentCy, childSpacing }) => {
      const actorX = colIdx === 0 ? 42 : 870;
      const parentX = colIdx === 0 ? 145 : 945;
      const parentW = 230;
      const parentH = 60;
      const childX = colIdx === 0 ? 545 : 1335;
      const childW = 280;
      const childH = 54;

      const actorId = `${cluster.id}_actor`;
      const parentId = `${cluster.id}_parent`;
      const childrenCount = cluster.children.length;

      innerCells += `
        <mxCell id="${actorId}" value="${escXml(group.actorLabel)}" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;" vertex="1" parent="1">
          <mxGeometry x="${actorX}" y="${Math.round(parentCy - 35)}" width="36" height="70" as="geometry"/>
        </mxCell>
        <mxCell id="${parentId}" value="${escXml(cluster.parentUseCase)}" style="ellipse;whiteSpace=wrap;html=1;fontStyle=1;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="${parentX}" y="${Math.round(parentCy - parentH / 2)}" width="${parentW}" height="${parentH}" as="geometry"/>
        </mxCell>
        <mxCell id="${cluster.id}_act_edge" style="endArrow=none;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="${actorId}" target="${parentId}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      `;

      cluster.children.forEach((child, chIdx) => {
        const childCy = startChildY + chIdx * childSpacing;
        const childId = `${cluster.id}_ch_${chIdx}`;
        const isInclude = child.rel === "include";
        const src = isInclude ? parentId : childId;
        const tgt = isInclude ? childId : parentId;
        const label = isInclude ? "&lt;&lt;include&gt;&gt;" : "&lt;&lt;extend&gt;&gt;";

        const parentPortY =
          childrenCount > 1
            ? (0.2 + (chIdx / (childrenCount - 1)) * 0.6).toFixed(2)
            : "0.5";
        const edgePorts = isInclude
          ? `exitX=1;exitY=${parentPortY};exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;`
          : `exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=${parentPortY};entryDx=0;entryDy=0;`;

        innerCells += `
          <mxCell id="${childId}" value="${escXml(child.name)}" style="ellipse;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="1">
            <mxGeometry x="${childX}" y="${Math.round(childCy - childH / 2)}" width="${childW}" height="${childH}" as="geometry"/>
          </mxCell>
          <mxCell id="${childId}_edge" value="${label}" style="dashed=1;endArrow=open;endFill=0;html=1;fontSize=10;${edgePorts}" edge="1" parent="1" source="${src}" target="${tgt}">
            <mxGeometry relative="1" as="geometry"/>
          </mxCell>
        `;
      });
    });

    const cells = `
      <mxCell id="0"/>
      <mxCell id="1" parent="0"/>
      <mxCell id="box_${group.actorKey}" value="${escXml(group.diagramTitle)}" style="rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;fontStyle=1;fontSize=15;spacingTop=12;" vertex="1" parent="1">
        <mxGeometry x="115" y="50" width="1520" height="1520" as="geometry"/>
      </mxCell>
      ${innerCells}
    `;

    return `
      <diagram id="diag_${group.actorKey}" name="Phân Rã - ${escXml(group.actorLabel)}">
        <mxGraphModel dx="1660" dy="1660" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1660" pageHeight="1660" math="0" shadow="0">
          <root>${cells}</root>
        </mxGraphModel>
      </diagram>
    `;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-10-27T09:00:00.000Z" agent="SachSe-SystemDesign" version="24.7.0" type="device">
  <diagram id="diag_general" name="1. Use Case Tổng Quát">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1360" pageHeight="1320" math="0" shadow="0">
      <root>${cellsPage1}</root>
    </mxGraphModel>
  </diagram>
  ${actorPagesXml}
</mxfile>`;
}

// Reusable Stick-Figure Actor SVG Component matching Draw.io's exact look
const ActorStickFigure: React.FC<{
  x: number;
  y: number;
  label: string;
  subLabel?: string;
  strokeColor: string;
  textColor: string;
}> = ({ x, y, label, subLabel, strokeColor, textColor }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Head */}
    <circle cx={0} cy={-24} r={9} fill="none" stroke={strokeColor} strokeWidth={1.6} />
    {/* Body */}
    <line x1={0} y1={-15} x2={0} y2={12} stroke={strokeColor} strokeWidth={1.6} />
    {/* Arms */}
    <line x1={-16} y1={-5} x2={16} y2={-5} stroke={strokeColor} strokeWidth={1.6} />
    {/* Left Leg */}
    <line x1={0} y1={12} x2={-13} y2={34} stroke={strokeColor} strokeWidth={1.6} />
    {/* Right Leg */}
    <line x1={0} y1={12} x2={13} y2={34} stroke={strokeColor} strokeWidth={1.6} />
    {/* Label */}
    <text
      x={0}
      y={49}
      textAnchor="middle"
      fill={textColor}
      fontSize={11.5}
      fontWeight={700}
    >
      {label}
    </text>
    {subLabel && (
      <text
        x={0}
        y={63}
        textAnchor="middle"
        fill={textColor}
        fontSize={10.5}
        fontWeight={600}
      >
        {subLabel}
      </text>
    )}
  </g>
);

const UseCaseEllipse: React.FC<{
  cx: number;
  cy: number;
  rx?: number;
  ry?: number;
  label: string;
  fillColor: string;
  strokeColor: string;
  textColor: string;
  bold?: boolean;
}> = ({
  cx,
  cy,
  rx = 135,
  ry = 28,
  label,
  fillColor,
  strokeColor,
  textColor,
  bold = false,
}) => {
  const maxChars = rx >= 135 ? 28 : 23;
  const lines = wrapTextLines(label, maxChars);
  const lineHeight = 13.5;
  const startY = cy - ((lines.length - 1) * lineHeight) / 2 + 4;

  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={startY + i * lineHeight}
          textAnchor="middle"
          fill={textColor}
          fontSize={11.5}
          fontWeight={bold ? 700 : 500}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export const SystemDesignPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "general" | "customer" | "shipper" | "store" | "admin" | "mapping"
  >("customer");
  const [darkCanvas, setDarkCanvas] = useState<boolean>(true);
  const [decomposedViewMode, setDecomposedViewMode] = useState<
    "square-2col" | "cards" | "plantuml"
  >("square-2col");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadDrawio = () => {
    const xml = generateDrawioXml();
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SachSe_UseCase_KhungVuong2Cot_Chuan.drawio";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const bgCanvas = darkCanvas ? "#0a0a0a" : "#ffffff";
  const gridStroke = darkCanvas ? "#1f2937" : "#e2e8f0";
  const strokeMain = darkCanvas ? "#e2e8f0" : "#1e293b";
  const textMain = darkCanvas ? "#f8fafc" : "#0f172a";
  const ellipseFill = darkCanvas ? "#09090b" : "#f8fafc";
  const badgeBg = darkCanvas ? "#09090b" : "#ffffff";

  const customerUCs = ACTOR_GROUPS[0].clusters
    .filter((c) => c.parentUseCase !== SHARED_AUTH_UC)
    .map((c) => c.parentUseCase);
  const shipperUCs = ACTOR_GROUPS[1].clusters
    .filter((c) => c.parentUseCase !== SHARED_AUTH_UC)
    .map((c) => c.parentUseCase);
  const storeUCs = ACTOR_GROUPS[2].clusters
    .filter((c) => c.parentUseCase !== SHARED_AUTH_UC)
    .map((c) => c.parentUseCase);
  const adminUCs = ACTOR_GROUPS[3].clusters
    .filter((c) => c.parentUseCase !== SHARED_AUTH_UC)
    .map((c) => c.parentUseCase);

  const activeActorGroup = ACTOR_GROUPS.find((g) => g.actorKey === activeTab);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Bố Cục Chia Đều Trong 1 Khung Hình Vuông Cân Đối (1520×1520)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            Hệ Thống Biểu Đồ Use Case Tổng Quát & Phân Rã (4 Actor)
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Toàn bộ các cụm chức năng của từng Actor được đặt gọn trong{" "}
            <strong>1 khung hình vuông duy nhất (tỷ lệ 1:1)</strong>, chia đều thành{" "}
            <strong>2 cột trái - phải cân đối từ trên xuống dưới</strong>, các nhãn{" "}
            <code>&lt;&lt;include&gt;&gt;</code> / <code>&lt;&lt;extend&gt;&gt;</code> nghiêng theo đúng góc mũi tên nên không bao giờ đè lên nhau.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setDarkCanvas(!darkCanvas)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {darkCanvas ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                Nền Sáng (In Báo Cáo)
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                Nền Tối (Giống Draw.io)
              </>
            )}
          </button>

          <button
            onClick={handleDownloadDrawio}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Tải File .drawio Khung Vuông 2 Cột
          </button>
        </div>
      </div>

      {/* Checklist Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-black text-emerald-950">
              1. Chia đều trong 1 khung hình vuông (1:1)
            </p>
            <p className="text-emerald-800 leading-relaxed">
              Tất cả cụm chức năng nằm trong 1 khung vuông duy nhất (4 cụm cột trái, 3 cụm cột phải được căn khoảng cách dọc đều nhau).
            </p>
          </div>
        </div>
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-black text-blue-950">
              2. Mũi tên & chữ xoay theo hướng tia
            </p>
            <p className="text-blue-800 leading-relaxed">
              Nhãn <code>&lt;&lt;include&gt;&gt;</code> và <code>&lt;&lt;extend&gt;&gt;</code> tự động xoay song song với từng đường nét đứt, rõ nét tuyệt đối.
            </p>
          </div>
        </div>
        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
          <Users className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-black text-purple-950">
              3. Đồng nhất 100% với Use Case Tổng Quát
            </p>
            <p className="text-purple-800 leading-relaxed">
              Hoàn toàn không dùng dấu &quot;&amp;&quot;, tên các Use Case cha trùng khớp 100% với biểu đồ Use Case Tổng Quát.
            </p>
          </div>
        </div>
      </div>

      {/* Diagram Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "general"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          1. Use Case Tổng Quát (Đã bỏ &quot;&amp;&quot;)
        </button>
        <button
          onClick={() => setActiveTab("customer")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "customer"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          2. UC Phân Rã - Khách Hàng (7 cụm)
        </button>
        <button
          onClick={() => setActiveTab("shipper")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "shipper"
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          3. UC Phân Rã - Shipper (5 cụm)
        </button>
        <button
          onClick={() => setActiveTab("store")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "store"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          4. UC Phân Rã - Chủ Tiệm Giặt (7 cụm)
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "admin"
              ? "bg-purple-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          5. UC Phân Rã - Quản Trị Viên (7 cụm)
        </button>
        <button
          onClick={() => setActiveTab("mapping")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "mapping"
              ? "bg-amber-500 text-slate-950"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          6. Bảng Đối Chiếu Đồng Nhất Tên
        </button>
      </div>

      {/* TAB 1: USE CASE TỔNG QUÁT */}
      {activeTab === "general" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Biểu Đồ Use Case Tổng Quát — Chia Đều Trong 1 Khung Hình Vuông Cân Đối
              </h2>
              <p className="text-xs text-slate-500">
                23 Use Case độc lập của 4 Actor được phân bố cân xứng 2 bên trái - phải trong 1 khung hệ thống hình vuông.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleCopyText(generateGeneralPlantUml(), "general-puml")
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "general-puml" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Đã Copy Code PlantUML
                  </>
                ) : (
                  <>
                    <Code2 className="w-3.5 h-3.5" />
                    Copy Code PlantUML Tổng Quát
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto p-4" style={{ backgroundColor: bgCanvas }}>
            <svg
              viewBox="0 0 1320 1320"
              className="w-full max-w-[1050px] h-auto mx-auto block"
              style={{ backgroundColor: bgCanvas }}
            >
              <defs>
                <pattern
                  id="drawio-grid-general"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke={gridStroke}
                    strokeWidth="0.7"
                  />
                </pattern>
              </defs>

              <rect width="1320" height="1320" fill="url(#drawio-grid-general)" />

              {/* Outer Square System Boundary Box */}
              <rect
                x={220}
                y={40}
                width={880}
                height={1240}
                fill={darkCanvas ? "rgba(5,5,5,0.88)" : "rgba(255,255,255,0.94)"}
                stroke={strokeMain}
                strokeWidth={1.8}
              />
              <text
                x={660}
                y={74}
                textAnchor="middle"
                fill={textMain}
                fontSize={15}
                fontWeight={800}
              >
                HỆ THỐNG QUẢN LÝ DỊCH VỤ GIẶT SẤY (USE CASE TỔNG QUÁT)
              </text>

              {/* Lines from 4 actors to Shared Auth UC (cy = 135) */}
              <line x1={115} y1={410} x2={500} y2={135} stroke={strokeMain} strokeWidth={1.2} />
              <polyline
                points="95,910 35,910 35,135 500,135"
                fill="none"
                stroke={strokeMain}
                strokeWidth={1.2}
              />
              <line x1={1205} y1={410} x2={820} y2={135} stroke={strokeMain} strokeWidth={1.2} />
              <polyline
                points="1225,950 1285,950 1285,135 820,135"
                fill="none"
                stroke={strokeMain}
                strokeWidth={1.2}
              />

              <UseCaseEllipse
                cx={660}
                cy={135}
                rx={160}
                ry={30}
                label={SHARED_AUTH_UC}
                fillColor={ellipseFill}
                strokeColor={strokeMain}
                textColor={textMain}
                bold
              />

              {/* 4 Actors */}
              <ActorStickFigure
                x={95}
                y={420}
                label="Khách hàng"
                strokeColor={strokeMain}
                textColor={textMain}
              />
              <ActorStickFigure
                x={95}
                y={920}
                label="Shipper"
                subLabel="(Tài xế giao nhận)"
                strokeColor={strokeMain}
                textColor={textMain}
              />
              <ActorStickFigure
                x={1225}
                y={420}
                label="Chủ tiệm giặt"
                subLabel="(Store Manager)"
                strokeColor={strokeMain}
                textColor={textMain}
              />
              <ActorStickFigure
                x={1225}
                y={960}
                label="Quản trị viên"
                subLabel="(System Admin)"
                strokeColor={strokeMain}
                textColor={textMain}
              />

              {/* Left-Top: Customer Use Cases (6 additional + 1 shared = 7 total) */}
              {customerUCs.map((uc, idx) => {
                const cy = 235 + idx * 86;
                return (
                  <g key={`kh-${idx}`}>
                    <line
                      x1={115}
                      y1={420}
                      x2={285}
                      y2={cy}
                      stroke={strokeMain}
                      strokeWidth={1.2}
                    />
                    <UseCaseEllipse
                      cx={425}
                      cy={cy}
                      rx={140}
                      ry={28}
                      label={uc}
                      fillColor={ellipseFill}
                      strokeColor={strokeMain}
                      textColor={textMain}
                    />
                  </g>
                );
              })}

              {/* Left-Bottom: Shipper Use Cases (4 additional + 1 shared = 5 total) */}
              {shipperUCs.map((uc, idx) => {
                const cy = 805 + idx * 92;
                return (
                  <g key={`sp-${idx}`}>
                    <line
                      x1={115}
                      y1={920}
                      x2={285}
                      y2={cy}
                      stroke={strokeMain}
                      strokeWidth={1.2}
                    />
                    <UseCaseEllipse
                      cx={425}
                      cy={cy}
                      rx={140}
                      ry={28}
                      label={uc}
                      fillColor={ellipseFill}
                      strokeColor={strokeMain}
                      textColor={textMain}
                    />
                  </g>
                );
              })}

              {/* Right-Top: Store Manager Use Cases (6 additional + 1 shared = 7 total) */}
              {storeUCs.map((uc, idx) => {
                const cy = 235 + idx * 86;
                return (
                  <g key={`sm-${idx}`}>
                    <line
                      x1={1205}
                      y1={420}
                      x2={1035}
                      y2={cy}
                      stroke={strokeMain}
                      strokeWidth={1.2}
                    />
                    <UseCaseEllipse
                      cx={895}
                      cy={cy}
                      rx={140}
                      ry={28}
                      label={uc}
                      fillColor={ellipseFill}
                      strokeColor={strokeMain}
                      textColor={textMain}
                    />
                  </g>
                );
              })}

              {/* Right-Bottom: System Admin Use Cases (6 additional + 1 shared = 7 total) */}
              {adminUCs.map((uc, idx) => {
                const cy = 770 + idx * 86;
                return (
                  <g key={`ad-${idx}`}>
                    <line
                      x1={1205}
                      y1={960}
                      x2={1035}
                      y2={cy}
                      stroke={strokeMain}
                      strokeWidth={1.2}
                    />
                    <UseCaseEllipse
                      cx={895}
                      cy={cy}
                      rx={140}
                      ry={28}
                      label={uc}
                      fillColor={ellipseFill}
                      strokeColor={strokeMain}
                      textColor={textMain}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* TABS 2..5: DECOMPOSED USE CASE DIAGRAMS IN 1 SQUARE FRAME (2 EVEN COLUMNS) */}
      {activeActorGroup && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Sub-header & View Mode Switcher */}
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900">
                {activeActorGroup.diagramTitle}
              </h2>
              <p className="text-xs text-slate-500">
                Chia đều {activeActorGroup.clusters.length} cụm chức năng vào{" "}
                <strong>1 khung hình vuông cân đối (2 cột trái - phải)</strong>, không có khung con rườm rà, không đè mũi tên.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  onClick={() => setDecomposedViewMode("square-2col")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    decomposedViewMode === "square-2col"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  1 Khung Hình Vuông (Chia Đều 2 Cột)
                </button>
                <button
                  onClick={() => setDecomposedViewMode("cards")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    decomposedViewMode === "cards"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  Xem Tách Riêng Từng Cụm
                </button>
                <button
                  onClick={() => setDecomposedViewMode("plantuml")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    decomposedViewMode === "plantuml"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Code UML (PlantUML 2 Cột)
                </button>
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: 1 SQUARE FRAME WITH 2 EVENLY DISTRIBUTED COLUMNS */}
          {decomposedViewMode === "square-2col" && (
            <div className="w-full overflow-x-auto p-4" style={{ backgroundColor: bgCanvas }}>
              {(() => {
                // True 1:1 Square Canvas (1660 x 1620) with a 1520 x 1520 Square System Boundary Frame
                const svgWidth = 1660;
                const svgHeight = 1620;
                const layoutItems = computeSquareTwoColumnLayout(
                  activeActorGroup.clusters,
                  135,
                  1525,
                  74
                );

                return (
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full max-w-[1120px] h-auto mx-auto block"
                    style={{ backgroundColor: bgCanvas }}
                  >
                    <defs>
                      <pattern
                        id={`drawio-grid-sq-${activeActorGroup.actorKey}`}
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 20 0 L 0 0 0 20"
                          fill="none"
                          stroke={gridStroke}
                          strokeWidth="0.7"
                        />
                      </pattern>
                      <marker
                        id="open-arrow-sq"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="5"
                        orient="auto"
                      >
                        <polyline
                          points="1,1 9,5 1,9"
                          fill="none"
                          stroke={strokeMain}
                          strokeWidth="1.5"
                        />
                      </marker>
                    </defs>

                    <rect
                      width={svgWidth}
                      height={svgHeight}
                      fill={`url(#drawio-grid-sq-${activeActorGroup.actorKey})`}
                    />

                    {/* ONE SINGLE SQUARE SYSTEM BOUNDARY FRAME (1520 x 1520) */}
                    <rect
                      x={115}
                      y={50}
                      width={1520}
                      height={1520}
                      fill={darkCanvas ? "rgba(5,5,5,0.88)" : "rgba(255,255,255,0.94)"}
                      stroke="#38bdf8"
                      strokeWidth={1.8}
                    />
                    <text
                      x={875}
                      y={88}
                      textAnchor="middle"
                      fill={textMain}
                      fontSize={16}
                      fontWeight={800}
                    >
                      {activeActorGroup.diagramTitle}
                    </text>

                    {/* Subtle vertical center guide separating the 2 balanced columns inside the square */}
                    <line
                      x1={845}
                      y1={110}
                      x2={845}
                      y2={1545}
                      stroke={darkCanvas ? "#1e293b" : "#e2e8f0"}
                      strokeWidth={1.2}
                      strokeDasharray="8,8"
                    />

                    {layoutItems.map(
                      ({ cluster, colIdx, startChildY, parentCy, childSpacing }) => {
                        // Left Column vs Right Column coordinates inside the 1520x1520 square
                        const actorX = colIdx === 0 ? 58 : 888;
                        const parentCx = colIdx === 0 ? 260 : 1060;
                        const parentRx = 115;
                        const childCx = colIdx === 0 ? 685 : 1475;
                        const childRx = 140;

                        const childrenCount = cluster.children.length;

                        return (
                          <g key={cluster.id}>
                            {/* Separate Actor Stick Figure aligned horizontally with Parent Use Case */}
                            <ActorStickFigure
                              x={actorX}
                              y={parentCy - 6}
                              label={activeActorGroup.actorLabel}
                              subLabel={activeActorGroup.actorSubLabel}
                              strokeColor={strokeMain}
                              textColor={textMain}
                            />

                            {/* Straight horizontal solid line from Actor to Parent Use Case */}
                            <line
                              x1={actorX + 18}
                              y1={parentCy}
                              x2={parentCx - parentRx}
                              y2={parentCy}
                              stroke={strokeMain}
                              strokeWidth={1.5}
                            />

                            {/* Dashed lines & Child Use Case Ovals */}
                            {cluster.children.map((ch, idx) => {
                              const childCy = startChildY + idx * childSpacing;
                              const isInclude = ch.rel === "include";

                              // Spread attachment points vertically on the right edge of the Parent Oval
                              const offsetFactor =
                                childrenCount > 1
                                  ? idx - (childrenCount - 1) / 2
                                  : 0;
                              const yParentEdge = parentCy + offsetFactor * 10;
                              const xParentEdge = parentCx + parentRx;

                              const xChildEdge = childCx - childRx;
                              const yChildEdge = childCy;

                              const x1 = isInclude ? xParentEdge : xChildEdge;
                              const y1 = isInclude ? yParentEdge : yChildEdge;
                              const x2 = isInclude ? xChildEdge : xParentEdge;
                              const y2 = isInclude ? yChildEdge : yParentEdge;

                              // Place label along the arrow and rotate it parallel to the line so labels never collide!
                              const t = 0.52;
                              const labelX =
                                xParentEdge + (xChildEdge - xParentEdge) * t;
                              const labelY =
                                yParentEdge + (yChildEdge - yParentEdge) * t;
                              const angleDeg =
                                Math.atan2(
                                  yChildEdge - yParentEdge,
                                  xChildEdge - xParentEdge
                                ) *
                                (180 / Math.PI);

                              const stereoText = isInclude
                                ? "<<include>>"
                                : "<<extend>>";

                              return (
                                <g key={ch.id}>
                                  <line
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke={strokeMain}
                                    strokeWidth={1.3}
                                    strokeDasharray="6,4"
                                    markerEnd="url(#open-arrow-sq)"
                                  />
                                  <g
                                    transform={`translate(${labelX}, ${labelY}) rotate(${angleDeg.toFixed(
                                      1
                                    )})`}
                                  >
                                    <rect
                                      x={-36}
                                      y={-8}
                                      width={72}
                                      height={14}
                                      rx={3}
                                      fill={badgeBg}
                                    />
                                    <text
                                      x={0}
                                      y={3}
                                      textAnchor="middle"
                                      fill={
                                        isInclude
                                          ? darkCanvas
                                            ? "#34d399"
                                            : "#047857"
                                          : darkCanvas
                                          ? "#fbbf24"
                                          : "#b45309"
                                      }
                                      fontSize={10}
                                      fontWeight={700}
                                    >
                                      {stereoText}
                                    </text>
                                  </g>
                                  <UseCaseEllipse
                                    cx={childCx}
                                    cy={childCy}
                                    rx={childRx}
                                    ry={26}
                                    label={ch.name}
                                    fillColor={ellipseFill}
                                    strokeColor={strokeMain}
                                    textColor={textMain}
                                  />
                                </g>
                              );
                            })}

                            {/* Parent Use Case Oval (100% identical name to Use Case Tổng Quát) */}
                            <UseCaseEllipse
                              cx={parentCx}
                              cy={parentCy}
                              rx={parentRx}
                              ry={30}
                              label={cluster.parentUseCase}
                              fillColor={ellipseFill}
                              strokeColor={strokeMain}
                              textColor={textMain}
                              bold
                            />
                          </g>
                        );
                      }
                    )}
                  </svg>
                );
              })()}
            </div>
          )}

          {/* VIEW MODE 2: INDIVIDUAL CLUSTER CARDS */}
          {decomposedViewMode === "cards" && (
            <div className="p-6 bg-slate-50 space-y-6">
              {activeActorGroup.clusters.map((cluster, cIdx) => {
                const childrenCount = cluster.children.length;
                const rowSpacing = 84;
                const clusterSpan = Math.max(0, (childrenCount - 1) * rowSpacing);
                const startChildY = 85;
                const parentCy = startChildY + clusterSpan / 2;
                const cardSvgHeight = Math.max(220, clusterSpan + 170);
                const cardSvgWidth = 1220;

                const actorX = 85;
                const parentCx = 365;
                const parentRx = 140;
                const childCx = 945;
                const childRx = 215;

                const singlePuml = generateSingleClusterPlantUml(
                  activeActorGroup,
                  cluster,
                  cIdx
                );

                return (
                  <div
                    key={cluster.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                  >
                    <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black">
                          Cụm {cIdx + 1}/{activeActorGroup.clusters.length}
                        </span>
                        <span className="font-extrabold text-sm">
                          {cluster.parentUseCase}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyText(singlePuml, cluster.id)}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {copiedKey === cluster.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Đã Copy PlantUML Cụm {cIdx + 1}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Code PlantUML Cụm Này
                          </>
                        )}
                      </button>
                    </div>

                    <div
                      className="w-full overflow-x-auto p-3"
                      style={{ backgroundColor: bgCanvas }}
                    >
                      <svg
                        viewBox={`0 0 ${cardSvgWidth} ${cardSvgHeight}`}
                        className="w-full min-w-[960px] h-auto mx-auto block"
                        style={{ backgroundColor: bgCanvas }}
                      >
                        <defs>
                          <pattern
                            id={`grid-card-${cluster.id}`}
                            width="20"
                            height="20"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M 20 0 L 0 0 0 20"
                              fill="none"
                              stroke={gridStroke}
                              strokeWidth="0.7"
                            />
                          </pattern>
                          <marker
                            id={`arrow-card-${cluster.id}`}
                            markerWidth="10"
                            markerHeight="10"
                            refX="9"
                            refY="5"
                            orient="auto"
                          >
                            <polyline
                              points="1,1 9,5 1,9"
                              fill="none"
                              stroke={strokeMain}
                              strokeWidth="1.5"
                            />
                          </marker>
                        </defs>

                        <rect
                          width={cardSvgWidth}
                          height={cardSvgHeight}
                          fill={`url(#grid-card-${cluster.id})`}
                        />

                        <rect
                          x={180}
                          y={20}
                          width={1010}
                          height={cardSvgHeight - 40}
                          fill={
                            darkCanvas
                              ? "rgba(5,5,5,0.88)"
                              : "rgba(255,255,255,0.94)"
                          }
                          stroke="#38bdf8"
                          strokeWidth={1.6}
                        />
                        <text
                          x={685}
                          y={46}
                          textAnchor="middle"
                          fill={textMain}
                          fontSize={13.5}
                          fontWeight={800}
                        >
                          PHÂN RÃ CHỨC NĂNG: {cluster.parentUseCase.toUpperCase()}
                        </text>

                        <ActorStickFigure
                          x={actorX}
                          y={parentCy - 6}
                          label={activeActorGroup.actorLabel}
                          subLabel={activeActorGroup.actorSubLabel}
                          strokeColor={strokeMain}
                          textColor={textMain}
                        />

                        <line
                          x1={actorX + 20}
                          y1={parentCy}
                          x2={parentCx - parentRx}
                          y2={parentCy}
                          stroke={strokeMain}
                          strokeWidth={1.5}
                        />

                        {cluster.children.map((ch, idx) => {
                          const childCy = startChildY + idx * rowSpacing;
                          const isInclude = ch.rel === "include";
                          const offsetFactor =
                            childrenCount > 1
                              ? idx - (childrenCount - 1) / 2
                              : 0;
                          const yParentEdge = parentCy + offsetFactor * 11;
                          const xParentEdge = parentCx + parentRx;
                          const xChildEdge = childCx - childRx;
                          const yChildEdge = childCy;

                          const x1 = isInclude ? xParentEdge : xChildEdge;
                          const y1 = isInclude ? yParentEdge : yChildEdge;
                          const x2 = isInclude ? xChildEdge : xParentEdge;
                          const y2 = isInclude ? yChildEdge : yParentEdge;

                          const midX = (xParentEdge + xChildEdge) / 2;
                          const midY = (yParentEdge + yChildEdge) / 2;

                          return (
                            <g key={ch.id}>
                              <line
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={strokeMain}
                                strokeWidth={1.3}
                                strokeDasharray="6,4"
                                markerEnd={`url(#arrow-card-${cluster.id})`}
                              />
                              <rect
                                x={midX - 42}
                                y={midY - 10}
                                width={84}
                                height={18}
                                rx={4}
                                fill={badgeBg}
                              />
                              <text
                                x={midX}
                                y={midY + 3}
                                textAnchor="middle"
                                fill={
                                  isInclude
                                    ? darkCanvas
                                      ? "#34d399"
                                      : "#047857"
                                    : darkCanvas
                                    ? "#fbbf24"
                                    : "#b45309"
                                }
                                fontSize={11}
                                fontWeight={700}
                              >
                                {isInclude ? "<<include>>" : "<<extend>>"}
                              </text>
                              <UseCaseEllipse
                                cx={childCx}
                                cy={childCy}
                                rx={childRx}
                                ry={29}
                                label={ch.name}
                                fillColor={ellipseFill}
                                strokeColor={strokeMain}
                                textColor={textMain}
                              />
                            </g>
                          );
                        })}

                        <UseCaseEllipse
                          cx={parentCx}
                          cy={parentCy}
                          rx={parentRx}
                          ry={32}
                          label={cluster.parentUseCase}
                          fillColor={ellipseFill}
                          strokeColor={strokeMain}
                          textColor={textMain}
                          bold
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 3: 2-COLUMN SQUARE PLANTUML CODE */}
          {decomposedViewMode === "plantuml" && (
            <div className="p-6 space-y-6 bg-slate-50">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-black">
                      Code PlantUML Khung Hình Vuông 2 Cột: {activeActorGroup.actorLabel}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Sử dụng liên kết ẩn ngang (<code>-[hidden]--&gt;</code>) để chia đều các cụm chức năng thành 2 cột trái - phải trong 1 khung hình vuông duy nhất.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyText(
                        generateActorDecomposedPlantUml(activeActorGroup),
                        `full-${activeActorGroup.actorKey}`
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === `full-${activeActorGroup.actorKey}` ? (
                      <>
                        <Check className="w-4 h-4" />
                        Đã Sao Chép
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Sao Chép Code PlantUML 2 Cột
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono bg-slate-950 text-slate-100 overflow-x-auto leading-relaxed max-h-[520px]">
                  {generateActorDecomposedPlantUml(activeActorGroup)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: MAPPING TABLE */}
      {activeTab === "mapping" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-black text-slate-900">
              Bảng Đối Chiếu Đồng Nhất 100% Tên Use Case Từ Tổng Quát Đến Phân Rã (4 Actor)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dùng bảng này để đưa trực tiếp vào chương &quot;Phân tích thiết kế hệ thống&quot; trong báo cáo Word/Đồ án của bạn.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3.5 font-extrabold border-r border-slate-800 w-44">
                    Tác Nhân (Actor)
                  </th>
                  <th className="p-3.5 font-extrabold border-r border-slate-800 w-16 text-center">
                    Mã
                  </th>
                  <th className="p-3.5 font-extrabold border-r border-slate-800 w-72">
                    Tên Use Case Ở Biểu Đồ Tổng Quát &amp; Cha Ở Phân Rã (Đồng Nhất 100%)
                  </th>
                  <th className="p-3.5 font-extrabold">
                    Các Use Case Con Trong Cụm Phân Rã (&lt;&lt;include&gt;&gt; / &lt;&lt;extend&gt;&gt;)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ACTOR_GROUPS.map((group) =>
                  group.clusters.map((cluster, idx) => (
                    <tr key={cluster.id} className="hover:bg-slate-50/80">
                      {idx === 0 && (
                        <td
                          rowSpan={group.clusters.length}
                          className="p-4 font-black text-slate-900 bg-slate-50/60 border-r border-slate-200 align-top"
                        >
                          <div className="text-sm">{group.actorLabel}</div>
                          {group.actorSubLabel && (
                            <div className="text-xs font-semibold text-slate-500 mt-0.5">
                              {group.actorSubLabel}
                            </div>
                          )}
                          <div className="mt-2 inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                            {group.clusters.length} cụm độc lập
                          </div>
                        </td>
                      )}
                      <td className="p-3.5 text-center font-mono font-bold text-slate-500 border-r border-slate-200 align-top">
                        UC{idx + 1}
                      </td>
                      <td className="p-3.5 font-extrabold text-blue-900 border-r border-slate-200 align-top">
                        {cluster.parentUseCase}
                      </td>
                      <td className="p-3.5 space-y-1.5">
                        {cluster.children.map((ch) => (
                          <div key={ch.id} className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                                ch.rel === "include"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              &lt;&lt;{ch.rel}&gt;&gt;
                            </span>
                            <span className="text-slate-700 font-medium">{ch.name}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
