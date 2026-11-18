import { Request, Response } from "express";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import LaundryService from "../models/LaundryService";
import Store from "../models/Store";
import LaundryOrder from "../models/LaundryOrder";
import DeliveryTask from "../models/DeliveryTask";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const STATUS_VI_MAP: Record<string, string> = {
  pending: "Chờ tài xế nhận chuyến",
  picking_up: "Tài xế đang đến lấy đồ",
  at_store: "Đã tới tiệm · Chờ cân đồ",
  waiting_weight_confirm: "Chờ khách xác nhận cân nặng & giá mới",
  washing: "Đang giặt sấy tại tiệm",
  ready_for_delivery: "Đã giặt xong · Chờ giao trả",
  delivering: "Tài xế đang giao đồ sạch về cho khách",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
  return_requested: "Yêu cầu hoàn trả đồ",
};

const TASK_STATUS_VI_MAP: Record<string, string> = {
  broadcasting: "Đang phát sóng tìm tài xế (bán kính 1km)",
  accepted: "Tài xế đã nhận chuyến · Đang di chuyển tới điểm lấy",
  picked_up: "Đã lấy túi đồ · Đang trên đường đi giao",
  completed: "Đã hoàn thành chuyến giao nhận",
  cancelled: "Đã hủy chuyến",
};

export const chatWithAssistant = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      role = "customer",
      message = "",
      history = [],
      userId = "",
      phone = "",
      userName = "",
    } = req.body;

    const cleanMessage = String(message || "").trim();
    if (!cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập nội dung câu hỏi cho Trợ lý",
      });
    }

    const activeRole: "customer" | "driver" =
      role === "driver" ? "driver" : "customer";

    // 1. Fetch live system data from MongoDB / Fallback DB
    const [servicesRaw, storesRaw, ordersRaw, tasksRaw] = await Promise.all([
      (LaundryService as any).find({}).catch(() => []),
      (Store as any).find({}).catch(() => []),
      (LaundryOrder as any).find({}).sort({ createdAt: -1 }).catch(() => []),
      (DeliveryTask as any).find({}).sort({ createdAt: -1 }).catch(() => []),
    ]);

    const services = Array.isArray(servicesRaw) && servicesRaw.length > 0
      ? servicesRaw
      : [
          {
            name: "Giặt sấy tiêu chuẩn theo cân",
            price: 18000,
            unit: "kg",
            turnaroundHours: 12,
          },
          {
            name: "Giặt khô & Là hơi cao cấp (Vest, Áo dạ, Lụa)",
            price: 65000,
            unit: "món",
            turnaroundHours: 24,
          },
          {
            name: "Giặt chăn ga gối đệm diệt khuẩn UV",
            price: 85000,
            unit: "bộ",
            turnaroundHours: 18,
          },
          {
            name: "Vệ sinh & Khử mùi giày Sneaker chuyên sâu",
            price: 75000,
            unit: "đôi",
            turnaroundHours: 24,
          },
        ];

    const stores = Array.isArray(storesRaw) && storesRaw.length > 0
      ? storesRaw
      : [
          {
            name: "Tiệm Giặt Sạch Sẽ Hoàn Kiếm",
            district: "Quận Hoàn Kiếm",
            address: "24 Phố Hàng Bài, Quận Hoàn Kiếm, Hà Nội",
            phone: "0901 234 567",
          },
          {
            name: "Tiệm Giặt Sạch Sẽ Cầu Giấy",
            district: "Quận Cầu Giấy",
            address: "118 Cầu Giấy, Quận Cầu Giấy, Hà Nội",
            phone: "0902 345 678",
          },
          {
            name: "Tiệm Giặt Sạch Sẽ Đống Đa",
            district: "Quận Đống Đa",
            address: "86 Chùa Bộc, Quận Đống Đa, Hà Nội",
            phone: "0903 456 789",
          },
        ];

    const allOrders = Array.isArray(ordersRaw) ? ordersRaw : [];
    const allTasks = Array.isArray(tasksRaw) ? tasksRaw : [];

    // Filter customer orders if phone or userId provided, otherwise take top 3 latest orders
    const customerOrders = allOrders
      .filter((o: any) => {
        if (userId && o.userId === userId) return true;
        if (phone && o.phoneNumber === phone) return true;
        return false;
      })
      .slice(0, 3);
    const relevantOrders =
      customerOrders.length > 0 ? customerOrders : allOrders.slice(0, 3);

    // Compute Driver / Shipper metrics & active tasks
    const completedTasks = allTasks.filter(
      (t: any) => t.status === "completed"
    );
    const activeDriverTasks = allTasks.filter(
      (t: any) => t.status === "accepted" || t.status === "picked_up"
    );
    const broadcastingTasks = allTasks.filter(
      (t: any) => t.status === "broadcasting"
    );

    const totalDriverEarnings = completedTasks.reduce(
      (sum: number, t: any) => sum + (Number(t.shippingFee) || 25000),
      0
    );

    // Build textual context for Gemini System Instruction
    const servicesText = services
      .slice(0, 8)
      .map(
        (s: any) =>
          `- ${s.name}: ${Number(s.price || 20000).toLocaleString("vi-VN")}đ/${s.unit || "kg"} (Thời gian hoàn thành: ~${s.turnaroundHours || 12}h)`
      )
      .join("\n");

    const storesText = stores
      .slice(0, 8)
      .map(
        (st: any) =>
          `- ${st.name} (${st.district || "Hà Nội"}): ${st.address || "Hà Nội"} · SĐT: ${st.phone || "1900 6868"}`
      )
      .join("\n");

    const ordersText =
      relevantOrders.length > 0
        ? relevantOrders
            .map(
              (o: any) =>
                `- Mã đơn #${String(o.id).toUpperCase()}: Khách ${o.customerName} | Tiệm: ${o.storeName || "Sạch Sẽ"} | Trạng thái: ${STATUS_VI_MAP[o.status] || o.status} | Cân nặng: ${o.actualWeightKg || o.estimatedWeight || 3}kg | Tổng tiền: ${Number(o.totalPrice || 0).toLocaleString("vi-VN")}đ (${o.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}) | Tài xế: ${o.shipperName || "Đang tìm tài xế"}`
            )
            .join("\n")
        : "- Chưa có đơn hàng nào đang hoạt động.";

    const driverTasksText =
      activeDriverTasks.length > 0
        ? activeDriverTasks
            .map(
              (t: any) =>
                `- Chuyến #${String(t.id).toUpperCase()} (Đơn #${String(t.orderId).toUpperCase()}): Loại: ${t.taskType === "deliver_to_customer" ? "Chiều 2 - Nhận đồ sạch từ tiệm giao trả khách" : "Chiều 1 - Đến nhà khách lấy đồ bẩn mang về tiệm"} | Trạng thái: ${TASK_STATUS_VI_MAP[t.status] || t.status} | Điểm lấy: ${t.pickupAddress || t.customerAddress} -> Điểm giao: ${t.deliveryAddress || t.storeAddress} | Quãng đường: ${t.distanceKm || 1.8}km | Cước phí Shipper nhận: ${Number(t.shippingFee || 25000).toLocaleString("vi-VN")}đ | SĐT khách: ${t.customerPhone || "0988776655"}`
            )
            .join("\n")
        : broadcastingTasks.length > 0
          ? `Hiện chưa có chuyến đang chạy, nhưng đang có ${broadcastingTasks.length} chuyến mới đang phát sóng trên Bản đồ Radar chờ nhận (cước phí từ 25.000đ - 35.000đ/chuyến).`
          : "Hiện chưa có chuyến giao nhận nào đang chạy.";

    const systemInstruction =
      activeRole === "customer"
        ? `Bạn là Trợ lý Hỏi Đáp thông minh dành cho KHÁCH HÀNG của hệ thống "Giặt Là Sạch Sẽ" tại TP. Hà Nội.
Tên người dùng hiện tại: ${userName || "Quý khách"}.
Nhiệm vụ của bạn:
1. Giải đáp chính xác, ngắn gọn, thân thiện bằng tiếng Việt về bảng giá giặt sấy, dịch vụ, danh sách chi nhánh tiệm giặt tại Hà Nội, quy trình cân đồ thực tế tại tiệm, chính sách hủy đơn và thanh toán VietQR/PayOS/VNPay.
2. Dữ liệu thực tế từ hệ thống hiện tại:
[BẢNG GIÁ DỊCH VỤ]:
${servicesText}
- Phí giao nhận tận nơi tiêu chuẩn: 25.000đ/đơn (Hỗ trợ lấy gấp Express).

[DANH SÁCH CHI NHÁNH TIỆM GIẶT TẠI HÀ NỘI]:
${storesText}

[ĐƠN HÀNG GẦN NHẤT TRÊN HỆ THỐNG]:
${ordersText}

[QUY ĐỊNH QUAN TRỌNG]:
- Khách hàng có thể hủy đơn miễn phí TRƯỚC KHI tài xế đến lấy đồ thành công (trạng thái Chờ nhận chuyến hoặc Đang đến lấy).
- Khi đồ tới tiệm, Chủ tiệm sẽ cân thực tế và chụp ảnh minh chứng. Nếu chênh lệch cân nặng hoặc có phụ phí cổ áo/vết bẩn, hệ thống gửi yêu cầu để Khách hàng bấm "Đồng ý giá mới" trên App trước khi giặt.
- Thanh toán hỗ trợ Tiền mặt (COD) hoặc Quét mã VietQR Napas247 / PayOS / VNPay tự động đối soát tức thì.
Hãy trình bày câu trả lời rõ ràng theo gạch đầu dòng, súc tích (dưới 160 từ), sử dụng đúng số liệu thực tế ở trên.`
        : `Bạn là Trợ lý Điều Phối & Hỏi Đáp thông minh dành riêng cho TÀI XẾ GIAO NHẬN (SHIPPER) của hệ thống "Sạch Sẽ Tài Xế" tại TP. Hà Nội.
Tên tài xế hiện tại: ${userName || "Đối tác Tài xế"}.
Nhiệm vụ của bạn:
1. Hỗ trợ Shipper tra cứu quy trình giao nhận 2 chiều chuẩn, kiểm tra số dư Ví thu nhập, cước phí chuyến và lộ trình điểm lấy - điểm giao của chuyến đang chạy.
2. Dữ liệu thực tế từ hệ thống hiện tại của Shipper:
[THỐNG KÊ VÍ THU NHẬP & HIỆU SUẤT SHIPPER]:
- Tổng doanh thu tích lũy đã hoàn thành: ${totalDriverEarnings.toLocaleString("vi-VN")}đ
- Số chuyến đã hoàn thành: ${completedTasks.length} chuyến
- Số chuyến đang thực hiện: ${activeDriverTasks.length} chuyến
- Số chuyến đang phát sóng trên Radar (bán kính 1km): ${broadcastingTasks.length} chuyến
- Cước phí giao nhận: Shipper hưởng 100% phí vận chuyển trên mỗi chặng (mặc định 25.000đ - 35.000đ/chặng) + thưởng hoàn thành mốc 8 chuyến/ngày.

[CHUYẾN GIAO NHẬN & TUYẾN ĐƯỜNG HIỆN TẠI]:
${driverTasksText}

[QUY TRÌNH GIAO NHẬN 4 BƯỚC DÀNH CHO SHIPPER]:
- Bước 1 (Bật Radar): Mở trạng thái "Đang nhận chuyến" trên màn hình Radar để nhận cuộc gọi điều phối tự động trong bán kính 1km.
- Bước 2 (Di chuyển tới điểm lấy & Bật Live GPS): Chạy theo lộ trình Google Maps tới nhà khách (Chiều 1) hoặc tới tiệm giặt (Chiều 2). Có thể mở Kênh Chat Nội Bộ 3 bên để nhắn nhanh 1 chạm ("Tôi đang đứng dưới sảnh chờ nhận đồ").
- Bước 3 (Xác nhận Đã Lấy Đồ): Kiểm tra túi đồ và bấm nút "Xác nhận Đã Lấy Đồ" trên App Tài xế. Lưu ý: Sau khi Shipper bấm Đã Lấy Đồ, khách hàng không thể tự ý hủy đơn nữa.
- Bước 4 (Bàn giao & Cộng tiền Ví): Giao đồ cho tiệm giặt (Chiều 1) hoặc giao đồ sạch tận tay khách (Chiều 2) và bấm "Hoàn thành chuyến" để hệ thống cộng ngay cước phí vào Ví thu nhập.
Hãy trình bày câu trả lời rõ ràng theo gạch đầu dòng, súc tích (dưới 160 từ), sử dụng đúng số liệu thực tế ở trên.`;

    // Build structured summary cards to return alongside the text reply
    const contextSummary =
      activeRole === "customer"
        ? {
            role: "customer",
            highlightTitle: "Dữ liệu Tiệm & Dịch vụ trực tuyến",
            stats: [
              {
                label: "Giặt sấy tiêu chuẩn",
                value: `${Number(services[0]?.price || 18000).toLocaleString("vi-VN")}đ/${services[0]?.unit || "kg"}`,
              },
              {
                label: "Chi nhánh Hà Nội",
                value: `${stores.length} cơ sở`,
              },
              {
                label: "Đơn gần nhất",
                value: relevantOrders[0]
                  ? `#${String(relevantOrders[0].id).toUpperCase()}`
                  : "Chưa có",
              },
            ],
          }
        : {
            role: "driver",
            highlightTitle: "Dữ liệu Ví & Lộ trình Shipper",
            stats: [
              {
                label: "Ví thu nhập",
                value: `${totalDriverEarnings.toLocaleString("vi-VN")}đ`,
              },
              {
                label: "Đã hoàn thành",
                value: `${completedTasks.length} chuyến`,
              },
              {
                label: "Chuyến đang chạy",
                value: activeDriverTasks[0]
                  ? `#${String(activeDriverTasks[0].orderId).toUpperCase()}`
                  : `${broadcastingTasks.length} chờ nhận`,
              },
            ],
          };

    // Build fallback answer from live DB in case Gemini API key is not configured or rate-limited
    const buildDataGroundedFallback = (): string => {
      const q = cleanMessage.toLowerCase();
      if (activeRole === "customer") {
        if (q.includes("giá") || q.includes("bảng giá") || q.includes("bao nhiêu") || q.includes("dịch vụ")) {
          return `Dưới đây là **bảng giá dịch vụ thực tế** tại hệ thống Giặt Là Sạch Sẽ:\n${servicesText}\n• **Phí giao nhận tận nơi**: 25.000đ/đơn.\n• **Quy trình minh bạch**: Sau khi Shipper mang đồ về tiệm, chủ tiệm sẽ cân thực tế và gửi thông báo để bạn xác nhận giá trên App trước khi giặt.`;
        }
        if (q.includes("chi nhánh") || q.includes("tiệm") || q.includes("địa chỉ") || q.includes("cửa hàng") || q.includes("ở đâu")) {
          return `Hệ thống **Giặt Là Sạch Sẽ** hiện có **${stores.length} chi nhánh** hoạt động tại TP. Hà Nội:\n${storesText}\n• Bạn có thể đặt lịch trên App để hệ thống tự động kết nối chi nhánh và Shipper trong bán kính 1km gần bạn nhất.`;
        }
        if (q.includes("đơn") || q.includes("trạng thái") || q.includes("kiểm tra")) {
          return `Thông tin **đơn giặt gần nhất** trên hệ thống:\n${ordersText}\n• Bạn có thể bấm vào mục **Đơn hàng** để xem vị trí Live GPS của tài xế hoặc nhắn tin trong Kênh Chat 3 bên.`;
        }
        return `Xin chào ${userName || "bạn"}! Tôi là Trợ lý Giặt Là Sạch Sẽ. Dữ liệu hệ thống hiện tại:\n• **Bảng giá nổi bật**:\n${servicesText}\n• **Hệ thống chi nhánh**: ${stores.length} cơ sở tại Hà Nội.\n• **Chính sách**: Hỗ trợ hủy đơn miễn phí trước khi Shipper lấy đồ, xác nhận cân nặng thực tế trên App và thanh toán VietQR tự động đối soát.`;
      } else {
        if (q.includes("quy trình") || q.includes("bước") || q.includes("hướng dẫn") || q.includes("giao nhận")) {
          return `**Quy trình giao nhận 4 bước chuẩn dành cho Shipper Sạch Sẽ**:\n• **Bước 1 (Nhận lệnh Radar)**: Bật trạng thái *Đang nhận chuyến* để nhận đơn tự động trong bán kính 1km.\n• **Bước 2 (Di chuyển & Bật Live GPS)**: Đi tới điểm lấy theo bản đồ, dùng Chat nhanh 1 chạm để báo khách/tiệm.\n• **Bước 3 (Xác nhận Đã Lấy Đồ)**: Kiểm tra túi đồ và bấm *Đã lấy đồ* (từ lúc này khách không thể hủy đơn).\n• **Bước 4 (Hoàn thành & Cộng Ví)**: Bàn giao đồ tại đích đến để nhận ngay 100% cước phí vào Ví thu nhập.`;
        }
        if (q.includes("ví") || q.includes("thu nhập") || q.includes("doanh thu") || q.includes("tiền") || q.includes("cước")) {
          return `**Tổng kết Ví thu nhập Shipper thời gian thực**:\n• **Tổng thu nhập tích lũy**: ${totalDriverEarnings.toLocaleString("vi-VN")}đ\n• **Số chuyến đã hoàn thành**: ${completedTasks.length} chuyến\n• **Chuyến đang thực hiện**: ${activeDriverTasks.length} chuyến\n• **Chính sách cước**: Tài xế nhận 100% phí vận chuyển mỗi chặng (25.000đ – 35.000đ/chuyến) ngay khi bấm hoàn thành.`;
        }
        if (q.includes("lộ trình") || q.includes("tuyến đường") || q.includes("đang chạy") || q.includes("điểm lấy") || q.includes("điểm giao")) {
          return `**Thông tin lộ trình & nhiệm vụ hiện tại của bạn**:\n${driverTasksText}\n• Bạn có thể mở tab **Chuyến Đang Chạy** để bật phát sóng Live GPS và nhắn tin trực tiếp với Khách hàng hoặc Chủ tiệm.`;
        }
        return `Xin chào tài xế ${userName || ""}! Dữ liệu vận hành thời gian thực của bạn:\n• **Ví thu nhập**: ${totalDriverEarnings.toLocaleString("vi-VN")}đ (${completedTasks.length} chuyến hoàn thành).\n• **Nhiệm vụ hiện tại**:\n${driverTasksText}\n• Hãy chọn câu hỏi nhanh bên dưới nếu bạn cần xem chi tiết quy trình 4 bước hoặc lộ trình giao nhận.`;
      }
    };

    const ai = getGeminiClient();
    if (!ai) {
      return successResponse(
        res,
        {
          reply: buildDataGroundedFallback(),
          role: activeRole,
          source: "system_knowledge",
          contextSummary,
        },
        "Trợ lý phản hồi thành công"
      );
    }

    try {
      const conversationTranscript = Array.isArray(history)
        ? history
            .slice(-6)
            .map(
              (item: any) =>
                `${item.sender === "user" ? "Người dùng" : "Trợ lý"}: ${String(item.text || "")}`
            )
            .join("\n")
        : "";

      const fullPrompt = conversationTranscript
        ? `Lịch sử hội thoại gần đây:\n${conversationTranscript}\n\nCâu hỏi mới của người dùng: ${cleanMessage}`
        : cleanMessage;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: fullPrompt,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const replyText =
        response.text?.trim() || buildDataGroundedFallback();

      return successResponse(
        res,
        {
          reply: replyText,
          role: activeRole,
          source: "gemini-4-hydrogen",
          contextSummary,
        },
        "Trợ lý AI Gemini phản hồi thành công"
      );
    } catch (error: any) {
      return successResponse(
        res,
        {
          reply: buildDataGroundedFallback(),
          role: activeRole,
          source: "system_knowledge",
          contextSummary,
        },
        "Trợ lý phản hồi từ dữ liệu hệ thống"
      );
    }
  }
);
