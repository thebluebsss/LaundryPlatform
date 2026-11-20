import swaggerJsdoc from "swagger-jsdoc";
import { swaggerSchemas } from "./swaggerSchemas";
import { swaggerPaths } from "./swaggerPaths";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Giặt Là Sạch Sẽ — API Documentation",
      version: "2.0.0",
      description:
        "Hệ thống API RESTful & Real-time SSE cho nền tảng Giặt Là Sạch Sẽ (Khách hàng · Shipper · Chủ tiệm · Admin). Hỗ trợ JWT RBAC, đơn giặt cân thực tế, Live GPS Tracking, Kênh Chat nội bộ 3 bên, Thanh toán & Đối soát tự động (VietQR / PayOS / VNPay), Đánh giá 2 chiều và Trợ lý Chatbot AI Gemini.",
      contact: {
        name: "Giặt Là Sạch Sẽ Support",
        email: "support@giatlasachse.vn",
      },
    },
    servers: [
      {
        url: "/",
        description: "Máy chủ hiện tại (Mặc định)",
      },
      {
        url: "http://localhost:3000",
        description: "Localhost Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Nhập token JWT sau khi gọi API /api/auth/login. Ví dụ: eyJhbGciOi...",
        },
      },
      schemas: {
        ...swaggerSchemas,
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Success message",
            },
            data: {
              type: "object",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "Xác thực người dùng, đăng ký, đăng nhập và lấy JWT token",
      },
      {
        name: "Laundry Orders",
        description: "Đơn giặt sấy chuẩn (đặt lịch, cân thực tế, duyệt giá, Live GPS, Chat 3 bên, VietQR/PayOS/VNPay & SSE)",
      },
      {
        name: "Delivery",
        description: "Điều phối giao nhận shipper, phát sóng bán kính 1km, nhận đơn và định vị GPS",
      },
      {
        name: "AI Assistant",
        description: "Trợ lý Chatbot Hỏi Đáp AI Gemini đồng bộ dữ liệu hệ thống cho Khách hàng và Shipper",
      },
      {
        name: "Reviews",
        description: "Đánh giá 2 chiều (Cửa hàng & Tài xế), phản hồi của Chủ tiệm và kiểm duyệt Admin",
      },
      {
        name: "Contact",
        description: "Tiếp nhận yêu cầu tư vấn giặt đặc biệt và đăng ký đối tác",
      },
      {
        name: "Stores",
        description: "Tìm kiếm chi nhánh tiệm giặt gần nhất và danh sách tài xế",
      },
      {
        name: "Services",
        description: "Bảng giá niêm yết các gói dịch vụ giặt sấy, là ủi, hấp cao cấp",
      },
      {
        name: "Equipment",
        description: "Quản lý tình trạng hoạt động và bảo trì máy giặt, máy sấy",
      },
      {
        name: "Payments",
        description: "Tích hợp thanh toán VNPay, MoMo, PayOS, VietQR Napas 24/7",
      },
      {
        name: "Bookings",
        description: "API đặt lịch truyền thống & thống kê",
      },
      {
        name: "Orders",
        description: "Quản lý đơn mua sản phẩm nước giặt, xả vải, phụ kiện",
      },
      {
        name: "Products",
        description: "Danh mục sản phẩm bán lẻ và gợi ý thông minh",
      },
      {
        name: "Users",
        description: "Quản lý tài khoản khách hàng, tài xế, chủ tiệm và admin",
      },
      {
        name: "System",
        description: "Kiểm tra hoạt động máy chủ và trạng thái cơ sở dữ liệu",
      },
    ],
    paths: swaggerPaths,
  },
  apis: ["./src/server/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
