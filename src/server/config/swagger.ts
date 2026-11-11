import swaggerJsdoc from "swagger-jsdoc";
import { swaggerSchemas } from "./swaggerSchemas";
import { swaggerPaths } from "./swaggerPaths";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ProLaundry API Documentation",
      version: "1.0.0",
      description: "Hệ thống API RESTful toàn diện cho nền tảng giặt là công nghệ cao ProLaundry. Hỗ trợ đầy đủ xác thực JWT, quản lý đơn giặt, sản phẩm phụ trợ, cổng thanh toán (VNPay, MoMo, PayOS, VietQR), điều phối giao nhận shipper và AI Vision.",
      contact: {
        name: "ProLaundry Support",
        email: "support@prolaundry.com",
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
        name: "Bookings",
        description: "Quản lý đơn giặt là, đặt lịch, tra cứu theo SĐT và cập nhật trạng thái giặt",
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
        name: "Services",
        description: "Bảng giá niêm yết các gói dịch vụ giặt sấy, là ủi, hấp cao cấp",
      },
      {
        name: "Stores",
        description: "Tìm kiếm chi nhánh tiệm giặt gần nhất và danh sách tài xế",
      },
      {
        name: "Delivery",
        description: "Điều phối giao nhận shipper, nhận đơn và cập nhật định vị",
      },
      {
        name: "Payments",
        description: "Tích hợp thanh toán VNPay, MoMo, PayOS, VietQR Napas 24/7",
      },
      {
        name: "Equipment",
        description: "Quản lý tình trạng hoạt động và bảo trì máy giặt, máy sấy",
      },
      {
        name: "Users",
        description: "Quản lý tài khoản khách hàng và nhân viên (Admin)",
      },
      {
        name: "AI Vision",
        description: "AI nhận diện chất liệu vải, mác quần áo và cảnh báo sai lệch giá",
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
