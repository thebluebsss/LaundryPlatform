// @ts-nocheck
import Order from "../models/Order";
import Product from "../models/Product";
import { NotFoundError, ValidationError } from "../utils/errorHandler";

/**
 * Tạo order mới
 */
export const createOrder = async (orderData: any, userId: string) => {
  const { items, customerInfo, shippingAddress, notes, paymentMethod } =
    orderData;

  // Lấy thông tin products
  const productIds = items.map((item: any) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== items.length) {
    throw new ValidationError("Một số sản phẩm không tồn tại");
  }

  // Tính toán giá và kiểm tra stock
  const orderItems = items.map((item: any) => {
    const product = products.find((p) => p._id.toString() === item.productId);

    if (!product) {
      throw new NotFoundError(`Sản phẩm ${item.productId} không tồn tại`);
    }

    if (product.stock < item.quantity) {
      throw new ValidationError(`Sản phẩm ${product.name} không đủ số lượng`);
    }

    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    };
  });

  // Tính tổng tiền
  const totalAmount = orderItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0,
  );

  // Tạo order
  const order = await Order.create({
    userId,
    customerInfo,
    items: orderItems,
    totalAmount,
    shippingFee: 30000, // Phí ship cố định
    shippingAddress: shippingAddress || customerInfo.address,
    notes,
    paymentMethod: paymentMethod || "cod",
    paymentStatus: "unpaid",
    orderStatus: "pending",
    orderType: "product_purchase",
  });

  // Cập nhật stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  return order;
};

/**
 * Lấy danh sách orders của user
 */
export const getUserOrders = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments({ userId }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy tất cả orders (admin)
 */
export const getAllOrders = async (filters: any = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const query: any = {};
  if (filters.orderStatus) query.orderStatus = filters.orderStatus;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("userId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy chi tiết order
 */
export const getOrderById = async (orderId: string) => {
  const order = await Order.findById(orderId).populate(
    "userId",
    "fullName email phone",
  );
  if (!order) {
    throw new NotFoundError("Order không tồn tại");
  }
  return order;
};

/**
 * Cập nhật trạng thái order
 */
export const updateOrderStatus = async (orderId: string, orderStatus: string) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus },
    { new: true, runValidators: true },
  );

  if (!order) {
    throw new NotFoundError("Order không tồn tại");
  }

  // Nếu delivered, cập nhật deliveredAt
  if (orderStatus === "delivered") {
    order.deliveredAt = new Date();
    await order.save();
  }

  return order;
};

/**
 * Cập nhật trạng thái thanh toán
 */
export const updateOrderPaymentStatus = async (
  orderId: string,
  paymentStatus: string,
  paymentDetails: any = {},
) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      paymentStatus,
      $set: {
        "paymentDetails.transactionId": paymentDetails.transactionId,
        "paymentDetails.gateway": paymentDetails.gateway,
        "paymentDetails.amount": paymentDetails.amount,
        "paymentDetails.paidAt": paymentDetails.paidAt || new Date(),
      },
    },
    { new: true, runValidators: true },
  );

  if (!order) {
    throw new NotFoundError("Order không tồn tại");
  }

  return order;
};

/**
 * Hủy order
 */
export const cancelOrder = async (orderId: string, userId: string, isAdmin = false) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order không tồn tại");
  }

  // Kiểm tra quyền hủy
  if (!isAdmin && order.userId.toString() !== userId.toString()) {
    throw new ValidationError("Bạn không có quyền hủy order này");
  }

  // Chỉ cho phép hủy order pending hoặc confirmed
  if (!["pending", "confirmed"].includes(order.orderStatus)) {
    throw new ValidationError("Không thể hủy order ở trạng thái này");
  }

  // Hoàn lại stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  order.orderStatus = "cancelled";
  await order.save();

  return order;
};
