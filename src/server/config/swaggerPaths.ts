/**
 * OpenAPI 3.0 Path definitions for ProLaundry REST API
 */

export const swaggerPaths = {
  // ==========================================
  // AUTHENTICATION
  // ==========================================
  "/api/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Đăng ký tài khoản người dùng mới",
      description: "Tạo tài khoản khách hàng mới với email, số điện thoại và mật khẩu.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "email", "password", "fullName", "phone"],
              properties: {
                username: { type: "string", example: "nguyenvana" },
                email: { type: "string", example: "vana@gmail.com" },
                password: { type: "string", example: "Password123@" },
                fullName: { type: "string", example: "Nguyễn Văn A" },
                phone: { type: "string", example: "0901234567" },
                address: { type: "string", example: "123 Cầu Giấy, Hà Nội" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Đăng ký thành công, trả về thông tin user và JWT token",
        },
        400: {
          description: "Thông tin đăng ký không hợp lệ hoặc tài khoản đã tồn tại",
        },
      },
    },
  },

  "/api/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Đăng nhập hệ thống",
      description: "Xác thực với username/email và password. Trả về token JWT để dùng ở nút Authorize.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "password"],
              properties: {
                username: { type: "string", example: "admin" },
                password: { type: "string", example: "admin123" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Đăng nhập thành công, nhận JWT Token",
        },
        401: {
          description: "Sai tên đăng nhập hoặc mật khẩu",
        },
      },
    },
  },

  "/api/auth/check-duplicate": {
    get: {
      tags: ["Authentication"],
      summary: "Kiểm tra trùng lặp username / email",
      parameters: [
        {
          name: "username",
          in: "query",
          schema: { type: "string" },
          description: "Username cần kiểm tra",
        },
        {
          name: "email",
          in: "query",
          schema: { type: "string" },
          description: "Email cần kiểm tra",
        },
      ],
      responses: {
        200: {
          description: "Kết quả kiểm tra (có tồn tại hay không)",
        },
      },
    },
  },

  "/api/auth/profile": {
    get: {
      tags: ["Authentication"],
      summary: "Lấy thông tin tài khoản hiện tại",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Thông tin cá nhân của người dùng đang đăng nhập",
        },
        401: {
          description: "Chưa xác thực hoặc token hết hạn",
        },
      },
    },
    patch: {
      tags: ["Authentication"],
      summary: "Cập nhật hồ sơ cá nhân",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                fullName: { type: "string", example: "Nguyễn Văn B" },
                phone: { type: "string", example: "0987654321" },
                address: { type: "string", example: "456 Kim Mã, Hà Nội" },
                avatar: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Cập nhật hồ sơ thành công",
        },
      },
    },
  },

  "/api/auth/forgot-password": {
    post: {
      tags: ["Authentication"],
      summary: "Yêu cầu khôi phục mật khẩu qua email",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: { type: "string", example: "user@example.com" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Mã đặt lại mật khẩu đã được gửi về email",
        },
      },
    },
  },

  "/api/auth/reset-password": {
    post: {
      tags: ["Authentication"],
      summary: "Đặt lại mật khẩu mới",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["token", "newPassword"],
              properties: {
                token: { type: "string", example: "reset-token-abc" },
                newPassword: { type: "string", example: "NewPassword123@" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Đặt lại mật khẩu thành công",
        },
      },
    },
  },

  // ==========================================
  // BOOKINGS (ĐƠN GIẶT LÀ)
  // ==========================================
  "/api/bookings": {
    get: {
      tags: ["Bookings"],
      summary: "Danh sách tất cả đơn giặt (Dành cho Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "query",
          schema: { type: "string" },
          description: "Lọc theo trạng thái đơn (pending, confirmed, processing, completed, cancelled)",
        },
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
        },
      ],
      responses: {
        200: { description: "Danh sách đơn giặt thành công" },
      },
    },
    post: {
      tags: ["Bookings"],
      summary: "Tạo đơn đặt lịch giặt là mới",
      description: "Khách hàng đặt dịch vụ giặt sấy, chọn địa chỉ giao nhận và thời gian hẹn.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "phone", "address", "service", "pickupDate"],
              properties: {
                name: { type: "string", example: "Trần Thị Hoa" },
                phone: { type: "string", example: "0912345678" },
                address: { type: "string", example: "Số 88 Cầu Giấy, Hà Nội" },
                service: { type: "string", example: "wash", enum: ["wash", "dry-clean", "iron", "special"] },
                pickupDate: { type: "string", format: "date-time", example: "2026-10-12T09:00:00Z" },
                deliveryDate: { type: "string", format: "date-time", example: "2026-10-13T17:00:00Z" },
                estimatedWeight: { type: "number", example: 4.5 },
                notes: { type: "string", example: "Giặt riêng áo trắng" },
                storeId: { type: "string", example: "store-01" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Tạo đơn giặt thành công, trả về mã bookingId" },
      },
    },
  },

  "/api/bookings/my": {
    get: {
      tags: ["Bookings"],
      summary: "Lấy lịch sử đơn giặt của người dùng hiện tại",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Danh sách đơn giặt của người dùng" },
      },
    },
  },

  "/api/bookings/stats": {
    get: {
      tags: ["Bookings"],
      summary: "Thống kê tổng quan đơn giặt (Admin)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Số lượng đơn theo trạng thái, doanh thu ước tính" },
      },
    },
  },

  "/api/bookings/{id}": {
    get: {
      tags: ["Bookings"],
      summary: "Chi tiết đơn giặt theo ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "ID đơn giặt",
        },
      ],
      responses: {
        200: { description: "Thông tin chi tiết đơn giặt" },
        404: { description: "Không tìm thấy đơn giặt" },
      },
    },
    delete: {
      tags: ["Bookings"],
      summary: "Xóa đơn giặt (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Xóa đơn giặt thành công" },
      },
    },
  },

  "/api/bookings/phone/{phone}": {
    get: {
      tags: ["Bookings"],
      summary: "Tra cứu vận đơn nhanh theo Số Điện Thoại",
      description: "Khách hàng không cần đăng nhập vẫn tra cứu được lộ trình và trạng thái đồ giặt của mình.",
      parameters: [
        {
          name: "phone",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Số điện thoại người gửi",
        },
      ],
      responses: {
        200: { description: "Danh sách đơn giặt tương ứng với SĐT" },
      },
    },
  },

  "/api/bookings/{id}/status": {
    patch: {
      tags: ["Bookings"],
      summary: "Cập nhật tiến độ giặt sấy (Admin / Nhân viên)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: {
                  type: "string",
                  enum: ["pending", "confirmed", "picked_up", "washing", "drying", "folding", "completed", "cancelled"],
                  example: "washing",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Cập nhật trạng thái thành công" },
      },
    },
  },

  "/api/bookings/{id}/payment-status": {
    patch: {
      tags: ["Bookings"],
      summary: "Cập nhật trạng thái thanh toán đơn giặt (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["paymentStatus"],
              properties: {
                paymentStatus: {
                  type: "string",
                  enum: ["pending", "paid", "failed", "refunded"],
                  example: "paid",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Cập nhật thanh toán thành công" },
      },
    },
  },

  // ==========================================
  // PRODUCTS (SẢN PHẨM & NƯỚC GIẶT XẢ)
  // ==========================================
  "/api/products": {
    get: {
      tags: ["Products"],
      summary: "Lấy danh mục sản phẩm phụ trợ giặt là",
      parameters: [
        {
          name: "category",
          in: "query",
          schema: { type: "string" },
          description: "Lọc theo danh mục: detergent, softener, bleach, bag, accessory",
        },
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Từ khóa tìm kiếm tên sản phẩm",
        },
      ],
      responses: {
        200: { description: "Danh sách sản phẩm" },
      },
    },
    post: {
      tags: ["Products"],
      summary: "Thêm sản phẩm mới (Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateProductRequest",
            },
          },
        },
      },
      responses: {
        201: { description: "Tạo sản phẩm thành công" },
      },
    },
  },

  "/api/products/recommendations": {
    get: {
      tags: ["Products"],
      summary: "Gợi ý thông minh sản phẩm phù hợp gói giặt",
      parameters: [
        {
          name: "service",
          in: "query",
          schema: { type: "string" },
          description: "Gói giặt (wash, dry-clean, ...)",
        },
      ],
      responses: {
        200: { description: "Danh sách sản phẩm gợi ý kèm combo ưu đãi" },
      },
    },
  },

  "/api/products/{id}": {
    get: {
      tags: ["Products"],
      summary: "Xem chi tiết một sản phẩm",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Thông tin chi tiết sản phẩm" },
      },
    },
    patch: {
      tags: ["Products"],
      summary: "Cập nhật sản phẩm (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                price: { type: "number" },
                stock: { type: "number" },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Cập nhật thành công" },
      },
    },
    delete: {
      tags: ["Products"],
      summary: "Xóa sản phẩm (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Đã xóa sản phẩm" },
      },
    },
  },

  // ==========================================
  // ORDERS (ĐƠN HÀNG MUA PHỤ PHẨM)
  // ==========================================
  "/api/orders": {
    get: {
      tags: ["Orders"],
      summary: "Danh sách đơn hàng của người dùng đang đăng nhập",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Lịch sử mua hàng" },
      },
    },
    post: {
      tags: ["Orders"],
      summary: "Tạo đơn đặt mua sản phẩm",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateOrderRequest",
            },
          },
        },
      },
      responses: {
        201: { description: "Tạo đơn hàng thành công" },
      },
    },
  },

  "/api/orders/admin": {
    get: {
      tags: ["Orders"],
      summary: "Quản lý toàn bộ đơn hàng sản phẩm (Admin)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Danh sách toàn bộ đơn hàng bán lẻ" },
      },
    },
  },

  "/api/orders/{id}": {
    get: {
      tags: ["Orders"],
      summary: "Chi tiết đơn hàng sản phẩm",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Chi tiết đơn hàng" },
      },
    },
  },

  "/api/orders/{id}/status": {
    patch: {
      tags: ["Orders"],
      summary: "Cập nhật trạng thái đơn hàng (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: {
                  type: "string",
                  enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Cập nhật thành công" },
      },
    },
  },

  "/api/orders/{id}/cancel": {
    patch: {
      tags: ["Orders"],
      summary: "Hủy đơn hàng mua sản phẩm",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Hủy đơn hàng thành công" },
      },
    },
  },

  // ==========================================
  // SERVICES (BẢNG GIÁ DỊCH VỤ GIẶT)
  // ==========================================
  "/api/services": {
    get: {
      tags: ["Services"],
      summary: "Danh sách các gói dịch vụ giặt là kèm đơn giá",
      description: "Lấy bảng giá niêm yết: Giặt sấy thường, Giặt khô là hơi, Chăm sóc đồ hiệu...",
      responses: {
        200: { description: "Danh sách dịch vụ" },
      },
    },
    post: {
      tags: ["Services"],
      summary: "Thêm gói dịch vụ mới (Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "pricePerUnit", "unit"],
              properties: {
                name: { type: "string", example: "Giặt sấy diệt khuẩn UV" },
                description: { type: "string", example: "Khử khuẩn nhiệt độ cao" },
                unit: { type: "string", example: "kg" },
                pricePerUnit: { type: "number", example: 35000 },
                turnaroundHours: { type: "number", example: 6 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Tạo gói dịch vụ thành công" },
      },
    },
  },

  "/api/services/{id}": {
    get: {
      tags: ["Services"],
      summary: "Chi tiết dịch vụ theo ID",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Thông tin dịch vụ" } },
    },
    patch: {
      tags: ["Services"],
      summary: "Cập nhật giá hoặc thông tin gói dịch vụ (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                pricePerUnit: { type: "number" },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Cập nhật thành công" } },
    },
    delete: {
      tags: ["Services"],
      summary: "Xóa gói dịch vụ (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Đã xóa dịch vụ" } },
    },
  },

  // ==========================================
  // STORES (CỬA HÀNG & CHI NHÁNH)
  // ==========================================
  "/api/stores": {
    get: {
      tags: ["Stores"],
      summary: "Danh sách tất cả chi nhánh cửa hàng giặt là",
      responses: {
        200: { description: "Danh sách các tiệm giặt trong chuỗi" },
      },
    },
    post: {
      tags: ["Stores"],
      summary: "Thêm chi nhánh cửa hàng mới (Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "address", "phone"],
              properties: {
                name: { type: "string", example: "ProLaundry Cầu Giấy" },
                address: { type: "string", example: "Số 102 Xuân Thủy, Cầu Giấy, Hà Nội" },
                phone: { type: "string", example: "0243123456" },
                lat: { type: "number", example: 21.0368 },
                lng: { type: "number", example: 105.7836 },
                openingHours: { type: "string", example: "07:00 - 22:00" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Tạo chi nhánh thành công" },
      },
    },
  },

  "/api/stores/nearby": {
    get: {
      tags: ["Stores"],
      summary: "Tìm chi nhánh ProLaundry gần khách hàng nhất",
      parameters: [
        { name: "lat", in: "query", schema: { type: "number", example: 21.0285 } },
        { name: "lng", in: "query", schema: { type: "number", example: 105.8542 } },
        { name: "radius", in: "query", schema: { type: "number", example: 5 } },
      ],
      responses: {
        200: { description: "Danh sách chi nhánh sắp xếp theo khoảng cách km" },
      },
    },
  },

  "/api/stores/drivers": {
    get: {
      tags: ["Stores"],
      summary: "Danh sách đội ngũ tài xế / shipper giao đồ giặt",
      responses: {
        200: { description: "Danh sách tài xế đang trực" },
      },
    },
  },

  "/api/stores/{id}": {
    get: {
      tags: ["Stores"],
      summary: "Chi tiết chi nhánh",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Thông tin chi nhánh" } },
    },
    patch: {
      tags: ["Stores"],
      summary: "Cập nhật chi nhánh (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Cập nhật thành công" } },
    },
    delete: {
      tags: ["Stores"],
      summary: "Xóa chi nhánh (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Đã xóa chi nhánh" } },
    },
  },

  // ==========================================
  // DELIVERY (ĐIỀU PHỐI GIAO NHẬN SHIPPER)
  // ==========================================
  "/api/delivery/available-tasks": {
    get: {
      tags: ["Delivery"],
      summary: "Danh sách đơn cần shipper đến nhận / giao",
      responses: {
        200: { description: "Danh sách cuốc xe chờ nhận" },
      },
    },
  },

  "/api/delivery/accept-task": {
    post: {
      tags: ["Delivery"],
      summary: "Tài xế bấm nhận đơn giao nhận",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["taskId", "driverId"],
              properties: {
                taskId: { type: "string", example: "task-001" },
                driverId: { type: "string", example: "driver-001" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Nhận cuốc xe thành công" },
      },
    },
  },

  "/api/delivery/task-status": {
    patch: {
      tags: ["Delivery"],
      summary: "Tài xế cập nhật trạng thái chuyến giao",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["taskId", "status"],
              properties: {
                taskId: { type: "string", example: "task-001" },
                status: {
                  type: "string",
                  enum: ["picking_up", "picked_up", "delivering", "delivered", "failed"],
                  example: "delivering",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Cập nhật hành trình thành công" },
      },
    },
  },

  "/api/delivery/my-tasks": {
    get: {
      tags: ["Delivery"],
      summary: "Lịch sử đơn của tài xế",
      parameters: [
        { name: "driverId", in: "query", schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Danh sách đơn đã nhận" },
      },
    },
  },

  "/api/delivery/update-location": {
    post: {
      tags: ["Delivery"],
      summary: "Cập nhật tọa độ GPS thời gian thực của tài xế",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["driverId", "lat", "lng"],
              properties: {
                driverId: { type: "string", example: "driver-001" },
                lat: { type: "number", example: 21.0368 },
                lng: { type: "number", example: 105.7836 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Đã cập nhật vị trí shipper" },
      },
    },
  },

  // ==========================================
  // PAYMENTS (CỔNG THANH TOÁN ĐIỆN TỬ)
  // ==========================================
  "/api/payment/vnpay/create": {
    post: {
      tags: ["Payments"],
      summary: "Tạo link thanh toán VNPay cho đơn giặt",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["bookingId", "amount"],
              properties: {
                bookingId: { type: "string", example: "BOOK-202610-001" },
                amount: { type: "number", example: 120000 },
                orderInfo: { type: "string", example: "Thanh toan don giat ProLaundry" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Trả về paymentUrl để chuyển hướng khách sang VNPay",
        },
      },
    },
  },

  "/api/payment/vnpay/ipn": {
    get: {
      tags: ["Payments"],
      summary: "Webhook IPN xử lý kết quả từ VNPay (GET)",
      responses: {
        200: { description: "Phản hồi xác nhận giao dịch về cho VNPay" },
      },
    },
  },

  "/api/payment/momo/create": {
    post: {
      tags: ["Payments"],
      summary: "Tạo thanh toán Ví MoMo cho đơn giặt",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["bookingId", "amount"],
              properties: {
                bookingId: { type: "string", example: "BOOK-202610-001" },
                amount: { type: "number", example: 85000 },
                orderInfo: { type: "string", example: "Thanh toan don giat MoMo" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Trả về QR / payUrl MoMo",
        },
      },
    },
  },

  "/api/payment/payos/create": {
    post: {
      tags: ["Payments"],
      summary: "Tạo cổng thanh toán PayOS chuyển khoản tự động",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["bookingId", "amount"],
              properties: {
                bookingId: { type: "string", example: "BOOK-202610-001" },
                amount: { type: "number", example: 100000 },
                description: { type: "string", example: "Don giat ProLaundry" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Trả về mã QR PayOS và link checkout" },
      },
    },
  },

  "/api/payment/vietqr/create": {
    post: {
      tags: ["Payments"],
      summary: "Tạo mã VietQR Napas 24/7 quét trực tiếp trên App Ngân Hàng",
      description: "Tạo mã QR theo chuẩn Napas247 kèm cú pháp chuyển tiền tự động khớp lệnh.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["bookingId", "amount"],
              properties: {
                bookingId: { type: "string", example: "BOOK-202610-001" },
                amount: { type: "number", example: 150000 },
                description: { type: "string", example: "PROLAUNDRY 001" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Trả về hình ảnh QR base64 hoặc URL VietQR" },
      },
    },
  },

  "/api/payment/vietqr/confirm": {
    post: {
      tags: ["Payments"],
      summary: "Xác nhận đối soát mã giao dịch VietQR",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["bookingId", "transactionCode"],
              properties: {
                bookingId: { type: "string", example: "BOOK-202610-001" },
                transactionCode: { type: "string", example: "FT26100912" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Xác nhận thanh toán thành công" },
      },
    },
  },

  "/api/payment/status/{bookingId}": {
    get: {
      tags: ["Payments"],
      summary: "Kiểm tra tình trạng thanh toán của đơn giặt",
      parameters: [
        {
          name: "bookingId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Trạng thái thanh toán (paid, pending, ...)" },
      },
    },
  },

  "/api/payment/calculate-price": {
    post: {
      tags: ["Payments"],
      summary: "Tính toán trước cước phí giặt và phí ship giao nhận",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["service", "weight"],
              properties: {
                service: { type: "string", example: "wash" },
                weight: { type: "number", example: 5 },
                distanceKm: { type: "number", example: 3.2 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Bảng chi tiết tạm tính cước phí" },
      },
    },
  },

  "/api/payment/products/vnpay/create": {
    post: {
      tags: ["Payments"],
      summary: "Thanh toán VNPay cho đơn hàng mua sản phẩm",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["orderId", "amount"],
              properties: {
                orderId: { type: "string", example: "ORD-202610-001" },
                amount: { type: "number", example: 250000 },
                orderInfo: { type: "string", example: "Mua nuoc giat OMO" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Trả về URL thanh toán VNPay" },
      },
    },
  },

  "/api/payment/products/payos/create": {
    post: {
      tags: ["Payments"],
      summary: "Thanh toán PayOS cho đơn hàng mua sản phẩm",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["orderId", "amount"],
              properties: {
                orderId: { type: "string", example: "ORD-202610-001" },
                amount: { type: "number", example: 300000 },
                description: { type: "string", example: "Mua nuoc xai vai" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Trả về QR PayOS" },
      },
    },
  },

  "/api/payment/products/status/{orderId}": {
    get: {
      tags: ["Payments"],
      summary: "Kiểm tra thanh toán của đơn hàng mua sản phẩm",
      parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Trạng thái thanh toán sản phẩm" } },
    },
  },

  // ==========================================
  // EQUIPMENT (QUẢN LÝ MÁY MÓC & THIẾT BỊ)
  // ==========================================
  "/api/equipment": {
    get: {
      tags: ["Equipment"],
      summary: "Danh sách máy giặt, máy sấy trong hệ thống (Admin)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Danh sách thiết bị và tình trạng hoạt động" },
      },
    },
    post: {
      tags: ["Equipment"],
      summary: "Khai báo máy giặt/máy sấy mới (Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateEquipmentRequest",
            },
          },
        },
      },
      responses: {
        201: { description: "Đăng ký thiết bị thành công" },
      },
    },
  },

  "/api/equipment/{id}": {
    get: {
      tags: ["Equipment"],
      summary: "Xem thông tin máy giặt/sấy theo ID",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Chi tiết thiết bị" } },
    },
    patch: {
      tags: ["Equipment"],
      summary: "Cập nhật trạng thái máy: Đang chạy, Bảo trì, Lỗi",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  enum: ["working", "maintenance", "broken"],
                  example: "maintenance",
                },
                location: { type: "string" },
                notes: { type: "string" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Cập nhật thành công" } },
    },
    delete: {
      tags: ["Equipment"],
      summary: "Thanh lý / xóa thiết bị khỏi hệ thống",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Đã xóa thiết bị" } },
    },
  },

  // ==========================================
  // USERS (QUẢN TRỊ TÀI KHOẢN NGƯỜI DÙNG)
  // ==========================================
  "/api/users": {
    get: {
      tags: ["Users"],
      summary: "Danh sách tài khoản người dùng trong hệ thống (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "role", in: "query", schema: { type: "string", enum: ["user", "admin"] } },
      ],
      responses: {
        200: { description: "Danh sách tài khoản" },
      },
    },
    post: {
      tags: ["Users"],
      summary: "Tạo tài khoản người dùng mới bởi Quản trị viên (Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateUserRequest",
            },
          },
        },
      },
      responses: {
        201: { description: "Tạo tài khoản thành công" },
      },
    },
  },

  "/api/users/stats": {
    get: {
      tags: ["Users"],
      summary: "Thống kê người dùng: Tổng số, số lượng đang hoạt động",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Số liệu thống kê người dùng" },
      },
    },
  },

  "/api/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Xem thông tin người dùng theo ID (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Thông tin tài khoản" } },
    },
    patch: {
      tags: ["Users"],
      summary: "Cập nhật tài khoản người dùng (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateUserRequest",
            },
          },
        },
      },
      responses: { 200: { description: "Cập nhật thành công" } },
    },
    delete: {
      tags: ["Users"],
      summary: "Xóa tài khoản người dùng (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Đã xóa người dùng" } },
    },
  },

  "/api/users/{id}/toggle-active": {
    patch: {
      tags: ["Users"],
      summary: "Khóa hoặc Mở khóa tài khoản người dùng (Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Thay đổi trạng thái thành công" } },
    },
  },

  // ==========================================
  // LAUNDRY ORDERS (ĐƠN GIẶT SẤY, LIVE GPS, CHAT 3 BÊN & VIETQR/PAYOS/VNPAY)
  // ==========================================
  "/api/laundry-orders/stream": {
    get: {
      tags: ["Laundry Orders"],
      summary: "Luồng Server-Sent Events (SSE) đồng bộ thời gian thực",
      description:
        "Phát trực tiếp sự kiện DRIVER_GPS_UPDATED, ORDER_CHAT_MESSAGE, ORDER_PAYMENT_RECONCILED và ORDER_UPDATED tới Khách hàng, Shipper và Chủ tiệm.",
      responses: {
        200: { description: "Kết nối text/event-stream thành công" },
      },
    },
  },

  "/api/laundry-orders": {
    get: {
      tags: ["Laundry Orders"],
      summary: "Lấy danh sách đơn giặt sấy",
      parameters: [
        { name: "userId", in: "query", schema: { type: "string" } },
        { name: "phone", in: "query", schema: { type: "string" } },
        { name: "storeId", in: "query", schema: { type: "string" } },
        { name: "status", in: "query", schema: { type: "string" } },
      ],
      responses: { 200: { description: "Danh sách đơn giặt sấy" } },
    },
    post: {
      tags: ["Laundry Orders"],
      summary: "Tạo đơn giặt sấy mới & tự động phát sóng tìm Shipper bán kính 1km",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["customerName", "phoneNumber", "address"],
              properties: {
                customerName: { type: "string", example: "Nguyễn Minh Anh" },
                phoneNumber: { type: "string", example: "0988123456" },
                address: { type: "string", example: "24 Phố Hàng Bài, Hoàn Kiếm, Hà Nội" },
                storeId: { type: "string", example: "store-hn-hoankiem" },
                estimatedWeight: { type: "number", example: 4.5 },
                paymentMethod: { type: "string", example: "vietqr" },
                notes: { type: "string", example: "Giặt kỹ cổ áo sơ mi trắng" },
              },
            },
          },
        },
      },
      responses: { 201: { description: "Tạo đơn giặt sấy thành công" } },
    },
  },

  "/api/laundry-orders/{id}": {
    get: {
      tags: ["Laundry Orders"],
      summary: "Xem chi tiết đơn giặt sấy",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Chi tiết đơn hàng" }, 404: { description: "Không tìm thấy" } },
    },
    delete: {
      tags: ["Laundry Orders"],
      summary: "Xóa đơn giặt sấy (Chủ tiệm / Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Đã xóa đơn hàng" }, 401: { description: "Chưa xác thực" } },
    },
  },

  "/api/laundry-orders/{id}/status": {
    patch: {
      tags: ["Laundry Orders"],
      summary: "Cập nhật trạng thái đơn giặt hoặc hủy đơn (khách chỉ hủy trước khi tài xế lấy đồ)",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string", example: "cancelled" },
                paymentStatus: { type: "string", example: "paid" },
                byRole: { type: "string", example: "customer" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Cập nhật trạng thái thành công" } },
    },
  },

  "/api/laundry-orders/{id}/weigh": {
    patch: {
      tags: ["Laundry Orders"],
      summary: "Chủ tiệm cân đồ thực tế, nhập phụ phí vết bẩn và ảnh minh chứng",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                actualWeightKg: { type: "number", example: 5.2 },
                extraFee: { type: "number", example: 15000 },
                extraFeeReason: { type: "string", example: "Tẩy vết mực cổ áo" },
                evidencePhotoUrl: { type: "string" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Đã cập nhật cân nặng & gửi yêu cầu khách duyệt" } },
    },
  },

  "/api/laundry-orders/{id}/confirm-weight": {
    post: {
      tags: ["Laundry Orders"],
      summary: "Khách hàng đồng ý hoặc từ chối cân nặng/giá mới",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["decision"],
              properties: {
                decision: { type: "string", enum: ["approved", "rejected"], example: "approved" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Đã xác nhận quyết định cân đồ" } },
    },
  },

  "/api/laundry-orders/{id}/messages": {
    get: {
      tags: ["Laundry Orders"],
      summary: "Lấy lịch sử Kênh Chat Nội Bộ 3 bên của đơn hàng",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Danh sách tin nhắn đơn hàng" } },
    },
    post: {
      tags: ["Laundry Orders"],
      summary: "Gửi tin nhắn hoặc câu trả lời nhanh 1 chạm (yêu cầu đã có tài xế nhận chuyến)",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["senderRole", "text"],
              properties: {
                senderRole: { type: "string", enum: ["customer", "driver", "store"], example: "driver" },
                senderName: { type: "string", example: "Nguyễn Văn Hùng" },
                text: { type: "string", example: "Tôi đang đứng dưới sảnh chờ nhận đồ" },
                isQuickReply: { type: "boolean", example: true },
              },
            },
          },
        },
      },
      responses: { 201: { description: "Đã gửi tin nhắn & phát SSE realtime" } },
    },
  },

  "/api/laundry-orders/{id}/driver-location": {
    post: {
      tags: ["Laundry Orders"],
      summary: "Stream tọa độ Live GPS của tài xế lên bản đồ Khách hàng & Chủ tiệm",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["lat", "lng"],
              properties: {
                lat: { type: "number", example: 21.028511 },
                lng: { type: "number", example: 105.854165 },
                heading: { type: "number", example: 90 },
                speedKmh: { type: "number", example: 28 },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Đã đồng bộ Live GPS thành công" } },
    },
  },

  "/api/laundry-orders/{id}/payment-link": {
    post: {
      tags: ["Laundry Orders"],
      summary: "Khởi tạo mã QR thanh toán đa cổng (VietQR / PayOS / VNPay) cho đơn giặt",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                gateway: { type: "string", enum: ["vietqr", "payos", "vnpay"], example: "vietqr" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Trả về ảnh VietQR và thông tin chuyển khoản" } },
    },
  },

  "/api/laundry-orders/{id}/payment-webhook": {
    post: {
      tags: ["Laundry Orders"],
      summary: "Webhook tự động đối soát thanh toán điện tử (VietQR / PayOS / VNPay)",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                gateway: { type: "string", example: "payos" },
                transactionId: { type: "string", example: "FT-PAYOS-20269988" },
                amount: { type: "number", example: 120000 },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Đã đối soát tự động & phát SSE ORDER_PAYMENT_RECONCILED" } },
    },
  },

  "/api/laundry-orders/customer-care-note": {
    patch: {
      tags: ["Laundry Orders"],
      summary: "Lưu ghi chú chăm sóc vải riêng cho khách quen (Chủ tiệm / Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["phone", "note"],
              properties: {
                phone: { type: "string", example: "0988123456" },
                note: { type: "string", example: "Khách dị ứng nước xả mùi nồng, chỉ dùng nước xả dịu nhẹ" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Đã lưu ghi chú chăm sóc vải" } },
    },
  },

  // ==========================================
  // AI CHATBOT ASSISTANT (KHÁCH HÀNG & SHIPPER)
  // ==========================================
  "/api/assistant/chat": {
    post: {
      tags: ["AI Assistant"],
      summary: "Trợ lý Chatbot Hỏi Đáp AI Gemini đồng bộ dữ liệu thực tế (Khách hàng & Shipper)",
      description:
        "Kết hợp mô hình gemini-4-hydrogen với dữ liệu thực tế từ hệ thống (bảng giá, chi nhánh Hà Nội, đơn giặt, quy trình 4 bước Shipper, ví thu nhập và tuyến đường).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["role", "message"],
              properties: {
                role: { type: "string", enum: ["customer", "driver"], example: "customer" },
                message: { type: "string", example: "Bảng giá dịch vụ giặt sấy hiện tại bao nhiêu?" },
                userName: { type: "string", example: "Nguyễn Minh Anh" },
                phone: { type: "string", example: "0988123456" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Phản hồi của Trợ lý AI kèm số liệu tóm tắt trực tuyến" } },
    },
  },

  // ==========================================
  // REVIEWS (ĐÁNH GIÁ 2 CHIỀU TIỆM & TÀI XẾ)
  // ==========================================
  "/api/reviews": {
    get: {
      tags: ["Reviews"],
      summary: "Lấy danh sách đánh giá tiệm giặt & tài xế",
      parameters: [
        { name: "storeId", in: "query", schema: { type: "string" } },
        { name: "shipperId", in: "query", schema: { type: "string" } },
        { name: "orderId", in: "query", schema: { type: "string" } },
      ],
      responses: { 200: { description: "Danh sách đánh giá" } },
    },
    post: {
      tags: ["Reviews"],
      summary: "Khách hàng gửi đánh giá 2 chiều (Cửa hàng & Shipper)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["orderId", "storeId", "storeRating", "shipperRating"],
              properties: {
                orderId: { type: "string", example: "ORD-4766" },
                storeId: { type: "string", example: "store-hn-hoankiem" },
                storeRating: { type: "number", example: 5 },
                storeComment: { type: "string", example: "Quần áo thơm sạch, giao đúng hẹn" },
                shipperRating: { type: "number", example: 5 },
                shipperComment: { type: "string", example: "Tài xế thân thiện" },
              },
            },
          },
        },
      },
      responses: { 201: { description: "Lưu đánh giá thành công" } },
    },
  },

  "/api/reviews/{id}/reply": {
    patch: {
      tags: ["Reviews"],
      summary: "Chủ tiệm phản hồi đánh giá khách hàng",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["storeReply"],
              properties: {
                storeReply: { type: "string", example: "Cảm ơn quý khách đã tin tưởng tiệm!" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Đã lưu phản hồi chủ tiệm" } },
    },
  },

  "/api/reviews/{id}/visibility": {
    patch: {
      tags: ["Reviews"],
      summary: "Admin ẩn/hiện đánh giá vi phạm tiêu chuẩn cộng đồng",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Đã cập nhật trạng thái hiển thị đánh giá" } },
    },
  },

  // ==========================================
  // CONTACT INQUIRIES (LIÊN HỆ & ĐỐI TÁC)
  // ==========================================
  "/api/contact": {
    post: {
      tags: ["Contact"],
      summary: "Khách hàng / đối tác gửi biểu mẫu liên hệ tư vấn",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "phone", "message"],
              properties: {
                name: { type: "string", example: "Trần Thu Hà" },
                phone: { type: "string", example: "0912345678" },
                email: { type: "string", example: "ha@example.com" },
                message: { type: "string", example: "Tư vấn giặt rèm cửa và hợp tác mở chi nhánh" },
              },
            },
          },
        },
      },
      responses: { 201: { description: "Tiếp nhận yêu cầu thành công" } },
    },
    get: {
      tags: ["Contact"],
      summary: "Lấy danh sách yêu cầu liên hệ (Admin)",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Danh sách liên hệ từ khách hàng/đối tác" } },
    },
  },

  // ==========================================
  // SYSTEM & HEALTH
  // ==========================================
  "/api/health": {
    get: {
      tags: ["System"],
      summary: "Kiểm tra tình trạng hoạt động của Server",
      responses: {
        200: {
          description: "Server đang online và hoạt động bình thường",
        },
      },
    },
  },

  "/api/debug-status": {
    get: {
      tags: ["System"],
      summary: "Kiểm tra kết nối Cơ sở dữ liệu MongoDB",
      responses: {
        200: {
          description: "Thông tin trạng thái kết nối Mongoose Database",
        },
      },
    },
  },
};
