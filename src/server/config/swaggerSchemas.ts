/**
 * Swagger Schemas - Định nghĩa các schemas cho Swagger documentation
 */

export const swaggerSchemas = {
  // User Schemas
  User: {
    type: "object",
    properties: {
      _id: { type: "string", example: "507f1f77bcf86cd799439011" },
      username: { type: "string", example: "john_doe" },
      email: { type: "string", example: "john@example.com" },
      fullName: { type: "string", example: "John Doe" },
      phone: { type: "string", example: "0123456789" },
      address: { type: "string", example: "123 Main St" },
      role: { type: "string", enum: ["user", "admin"], example: "user" },
      isActive: { type: "boolean", example: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  CreateUserRequest: {
    type: "object",
    required: ["username", "email", "password", "fullName", "phone"],
    properties: {
      username: { type: "string", minLength: 3, example: "john_doe" },
      email: { type: "string", format: "email", example: "john@example.com" },
      password: { type: "string", minLength: 6, example: "password123" },
      fullName: { type: "string", example: "John Doe" },
      phone: {
        type: "string",
        pattern: "^[0-9]{10,11}$",
        example: "0123456789",
      },
      address: { type: "string", example: "123 Main St" },
      role: { type: "string", enum: ["user", "admin"], default: "user" },
      isActive: { type: "boolean", default: true },
    },
  },

  UpdateUserRequest: {
    type: "object",
    properties: {
      username: { type: "string", minLength: 3 },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
      fullName: { type: "string" },
      phone: { type: "string", pattern: "^[0-9]{10,11}$" },
      address: { type: "string" },
      role: { type: "string", enum: ["user", "admin"] },
      isActive: { type: "boolean" },
    },
  },

  // Booking Schemas
  Booking: {
    type: "object",
    properties: {
      _id: { type: "string" },
      userId: { type: "string" },
      name: { type: "string", example: "John Doe" },
      phone: { type: "string", example: "0123456789" },
      address: { type: "string", example: "123 Main St" },
      service: {
        type: "string",
        enum: ["wash", "dry-clean", "iron"],
        example: "wash",
      },
      pickupDate: { type: "string", format: "date-time" },
      deliveryDate: { type: "string", format: "date-time" },
      estimatedWeight: { type: "number", example: 5 },
      totalAmount: { type: "number", example: 50000 },
      status: {
        type: "string",
        enum: ["pending", "confirmed", "processing", "completed", "cancelled"],
        example: "pending",
      },
      paymentStatus: {
        type: "string",
        enum: ["pending", "paid", "failed", "refunded"],
        example: "pending",
      },
      notes: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  CreateBookingRequest: {
    type: "object",
    required: ["name", "phone", "address", "service", "pickupDate"],
    properties: {
      name: { type: "string", example: "John Doe" },
      phone: {
        type: "string",
        pattern: "^[0-9]{10,11}$",
        example: "0123456789",
      },
      address: { type: "string", example: "123 Main St" },
      service: {
        type: "string",
        enum: ["wash", "dry-clean", "iron"],
        example: "wash",
      },
      pickupDate: {
        type: "string",
        format: "date-time",
        example: "2024-12-25T10:00:00Z",
      },
      deliveryDate: { type: "string", format: "date-time" },
      estimatedWeight: { type: "number", minimum: 0, example: 5 },
      notes: { type: "string", example: "Handle with care" },
    },
  },

  // Product Schemas
  Product: {
    type: "object",
    properties: {
      _id: { type: "string" },
      name: { type: "string", example: "Nước giặt OMO" },
      description: { type: "string", example: "Nước giặt chuyên dụng" },
      price: { type: "number", example: 150000 },
      originalPrice: { type: "number", example: 180000 },
      category: {
        type: "string",
        enum: ["detergent", "softener", "bleach", "bag", "accessory", "other"],
        example: "detergent",
      },
      image: { type: "string", example: "/img/omo.png" },
      stock: { type: "number", example: 50 },
      unit: { type: "string", example: "chai" },
      weight: { type: "string", example: "3.8kg" },
      brand: { type: "string", example: "OMO" },
      rating: { type: "number", minimum: 0, maximum: 5, example: 4.5 },
      soldCount: { type: "number", example: 120 },
      tags: {
        type: "array",
        items: { type: "string" },
        example: ["máy giặt", "giặt sạch"],
      },
      isActive: { type: "boolean", example: true },
      recommendFor: {
        type: "array",
        items: { type: "string" },
        example: ["wash", "all"],
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  CreateProductRequest: {
    type: "object",
    required: ["name", "description", "price", "category"],
    properties: {
      name: { type: "string", example: "Nước giặt OMO" },
      description: { type: "string", example: "Nước giặt chuyên dụng" },
      price: { type: "number", minimum: 0, example: 150000 },
      originalPrice: { type: "number", minimum: 0, example: 180000 },
      category: {
        type: "string",
        enum: ["detergent", "softener", "bleach", "bag", "accessory", "other"],
        example: "detergent",
      },
      image: { type: "string", example: "/img/omo.png" },
      stock: { type: "number", minimum: 0, default: 0, example: 50 },
      unit: { type: "string", default: "chai", example: "chai" },
      weight: { type: "string", example: "3.8kg" },
      brand: { type: "string", example: "OMO" },
      rating: {
        type: "number",
        minimum: 0,
        maximum: 5,
        default: 5,
        example: 4.5,
      },
      tags: {
        type: "array",
        items: { type: "string" },
        example: ["máy giặt", "giặt sạch"],
      },
      isActive: { type: "boolean", default: true },
      recommendFor: {
        type: "array",
        items: { type: "string" },
        default: ["all"],
        example: ["wash", "all"],
      },
    },
  },

  // Equipment Schemas
  Equipment: {
    type: "object",
    properties: {
      _id: { type: "string" },
      name: { type: "string", example: "Máy giặt LG 1" },
      type: {
        type: "string",
        enum: ["washing-machine", "dryer", "iron", "other"],
        example: "washing-machine",
      },
      model: { type: "string", example: "LG WD-18600" },
      serialNumber: { type: "string", example: "LG-WM-001" },
      purchaseDate: { type: "string", format: "date" },
      status: {
        type: "string",
        enum: ["working", "maintenance", "broken"],
        example: "working",
      },
      location: { type: "string", example: "Khu vực A - Tầng 1" },
      notes: { type: "string", example: "Máy giặt công suất lớn" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  CreateEquipmentRequest: {
    type: "object",
    required: ["name", "type", "model", "serialNumber", "location"],
    properties: {
      name: { type: "string", example: "Máy giặt LG 1" },
      type: {
        type: "string",
        enum: ["washing-machine", "dryer", "iron", "other"],
        example: "washing-machine",
      },
      model: { type: "string", example: "LG WD-18600" },
      serialNumber: { type: "string", example: "LG-WM-001" },
      purchaseDate: { type: "string", format: "date", example: "2024-01-15" },
      status: {
        type: "string",
        enum: ["working", "maintenance", "broken"],
        default: "working",
      },
      location: { type: "string", example: "Khu vực A - Tầng 1" },
      notes: { type: "string", example: "Máy giặt công suất lớn" },
    },
  },

  // Order Schemas
  Order: {
    type: "object",
    properties: {
      _id: { type: "string" },
      userId: { type: "string" },
      customerInfo: {
        type: "object",
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          address: { type: "string" },
        },
      },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            productId: { type: "string" },
            name: { type: "string" },
            price: { type: "number" },
            quantity: { type: "number" },
          },
        },
      },
      totalAmount: { type: "number", example: 300000 },
      shippingFee: { type: "number", example: 30000 },
      shippingAddress: { type: "string" },
      orderStatus: {
        type: "string",
        enum: [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ],
        example: "pending",
      },
      paymentStatus: {
        type: "string",
        enum: ["pending", "paid", "failed", "refunded"],
        example: "pending",
      },
      paymentMethod: {
        type: "string",
        enum: ["cod", "vnpay", "momo", "payos"],
        example: "cod",
      },
      notes: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  CreateOrderRequest: {
    type: "object",
    required: ["items", "customerInfo"],
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          required: ["productId", "quantity"],
          properties: {
            productId: { type: "string", example: "507f1f77bcf86cd799439011" },
            quantity: { type: "number", minimum: 1, example: 2 },
          },
        },
      },
      customerInfo: {
        type: "object",
        required: ["name", "phone", "address"],
        properties: {
          name: { type: "string", example: "John Doe" },
          phone: { type: "string", example: "0123456789" },
          email: { type: "string", example: "john@example.com" },
          address: { type: "string", example: "123 Main St" },
        },
      },
      shippingAddress: { type: "string", example: "456 Other St" },
      paymentMethod: {
        type: "string",
        enum: ["cod", "vnpay", "momo", "payos"],
        default: "cod",
      },
      notes: { type: "string", example: "Giao hàng buổi sáng" },
    },
  },

  // Response Schemas
  SuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation successful" },
      data: { type: "object" },
    },
  },

  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Error message" },
    },
  },

  PaginationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string" },
      data: {
        type: "object",
        properties: {
          items: { type: "array", items: { type: "object" } },
          pagination: {
            type: "object",
            properties: {
              page: { type: "number", example: 1 },
              limit: { type: "number", example: 10 },
              total: { type: "number", example: 100 },
              pages: { type: "number", example: 10 },
            },
          },
        },
      },
    },
  },
};
