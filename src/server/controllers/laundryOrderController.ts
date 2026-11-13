import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import LaundryOrder from "../models/LaundryOrder";
import { realtimeHub } from "../services/realtimeHub";

const findOrderByIdOrCustomId = async (rawId: string) => {
  let order = await (LaundryOrder as any).findOne({ id: rawId });
  if (!order) {
    try {
      order = await (LaundryOrder as any).findById(rawId);
    } catch {}
  }
  return order;
};

/**
 * @desc    Tạo đơn hàng mới
 * @route   POST /api/laundry-orders
 * @access  Public
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const orderData = { ...req.body };
  if (!orderData.id) {
    orderData.id = "ORD-" + Math.floor(1000 + Math.random() * 9000);
  }
  if (!orderData.status) {
    orderData.status = "pending";
  }
  if (!orderData.weightConfirmStatus) {
    orderData.weightConfirmStatus = "not_weighed";
  }

  let computedSubtotal = 0;
  if (Array.isArray(orderData.items)) {
    orderData.items = orderData.items.map((item: any) => {
      const estQty = Number(item.estimatedQuantity ?? item.quantity ?? 1);
      const unitPrice = Number(item.unitPrice ?? 20000);
      const lineTotal = Number(item.estimatedLineTotal ?? estQty * unitPrice);
      computedSubtotal += lineTotal;
      return {
        ...item,
        quantity: estQty,
        estimatedQuantity: estQty,
        actualQuantity: item.actualQuantity !== undefined ? item.actualQuantity : null,
        estimatedLineTotal: lineTotal,
        actualLineTotal: item.actualLineTotal !== undefined ? item.actualLineTotal : null,
      };
    });
  }

  const computedProductsTotal = Array.isArray(orderData.products)
    ? orderData.products.reduce(
        (sum: number, p: any) =>
          sum + Number(p.quantity || 0) * Number(p.unitPrice || 0),
        0
      )
    : Number(orderData.productsTotal || 0);

  const subtotal = Number(orderData.subtotal ?? computedSubtotal);
  const estimatedSubtotal = Number(orderData.estimatedSubtotal ?? subtotal);
  const deliveryFee = Number(orderData.deliveryFee ?? 25000);
  const discountAmount = Number(orderData.discountAmount ?? 0);
  const extraFee = Number(orderData.extraFee ?? 0);
  const totalPrice = Number(
    orderData.totalPrice ??
      Math.max(
        0,
        subtotal + computedProductsTotal + deliveryFee + extraFee - discountAmount
      )
  );

  orderData.subtotal = subtotal;
  orderData.estimatedSubtotal = estimatedSubtotal;
  orderData.productsTotal = computedProductsTotal;
  orderData.deliveryFee = deliveryFee;
  orderData.discountAmount = discountAmount;
  orderData.extraFee = extraFee;
  orderData.extraFeeReason = orderData.extraFeeReason || "";
  orderData.customerSpecialRequest = orderData.customerSpecialRequest || "";
  orderData.totalPrice = totalPrice;

  const HANOI_DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
    "Quận Hoàn Kiếm": { lat: 21.0285, lng: 105.8542 },
    "Quận Ba Đình": { lat: 21.0341, lng: 105.8372 },
    "Quận Đống Đa": { lat: 21.0181, lng: 105.8292 },
    "Quận Hai Bà Trưng": { lat: 21.0091, lng: 105.8535 },
    "Quận Cầu Giấy": { lat: 21.0362, lng: 105.7906 },
    "Quận Thanh Xuân": { lat: 20.9938, lng: 105.8114 },
    "Quận Tây Hồ": { lat: 21.0687, lng: 105.8224 },
    "Quận Hoàng Mai": { lat: 20.9741, lng: 105.8564 },
    "Quận Long Biên": { lat: 21.0381, lng: 105.8861 },
    "Quận Hà Đông": { lat: 20.9714, lng: 105.7788 },
    "Quận Nam Từ Liêm": { lat: 21.0156, lng: 105.7647 },
    "Quận Bắc Từ Liêm": { lat: 21.0645, lng: 105.7556 },
    "Huyện Gia Lâm": { lat: 21.0185, lng: 105.9382 },
    "Huyện Thanh Trì": { lat: 20.9412, lng: 105.8482 },
    "Huyện Đông Anh": { lat: 21.1394, lng: 105.8469 },
  };

  const districtCoord =
    HANOI_DISTRICT_COORDS[orderData.district] || { lat: 21.0285, lng: 105.8542 };

  const customerCoords =
    orderData.customerCoordinates &&
    typeof orderData.customerCoordinates.lat === "number" &&
    typeof orderData.customerCoordinates.lng === "number"
      ? {
          lat: Number(orderData.customerCoordinates.lat),
          lng: Number(orderData.customerCoordinates.lng),
        }
      : districtCoord;

  orderData.customerCoordinates = customerCoords;

  let storeCoords = {
    lat: Number((customerCoords.lat + 0.008).toFixed(6)),
    lng: Number((customerCoords.lng + 0.006).toFixed(6)),
  };

  try {
    const Store = (await import("../models/Store")).default;
    if (orderData.storeId) {
      const storeDoc: any = await (Store as any).findOne({
        $or: [{ customId: orderData.storeId }, { id: orderData.storeId }],
      });
      if (storeDoc && storeDoc.lat && storeDoc.lng) {
        storeCoords = {
          lat: Number(storeDoc.lat),
          lng: Number(storeDoc.lng),
        };
      }
    }
  } catch {}

  orderData.storeCoordinates = storeCoords;

  // Seed initial welcome chat message if customer has a special request
  if (!Array.isArray(orderData.messages)) {
    orderData.messages = [];
  }
  if (orderData.customerSpecialRequest) {
    orderData.messages.push({
      id: "msg-init-" + Date.now(),
      orderId: orderData.id,
      senderRole: "customer",
      senderName: orderData.customerName || "Khách hàng",
      text: `Yêu cầu đặc biệt: ${orderData.customerSpecialRequest}`,
      isQuickReply: false,
      createdAt: new Date().toISOString(),
    });
  }

  const order = await (LaundryOrder as any).create(orderData);

  // Broadcast pickup task within 1km radius of customer's Google Maps pin to online drivers
  if (orderData.autoBroadcast !== false) {
    try {
      const DeliveryTask = (await import("../models/DeliveryTask")).default;
      const Store = (await import("../models/Store")).default;

      let storeDoc: any = null;
      if (order.storeId) {
        storeDoc = await (Store as any).findOne({
          $or: [{ customId: order.storeId }, { id: order.storeId }],
        });
      }

      const storeAddressFull =
        storeDoc?.address ||
        `${order.storeName || "Tiệm Giặt Sạch Sẽ"}, ${order.district || "Quận Hoàn Kiếm"}, Thành Phố Hà Nội, Việt Nam`;

      const customerAddressFull = `${order.address}${
        order.district ? `, ${order.district}` : ""
      }, Thành Phố Hà Nội, Việt Nam`;

      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const dLat = toRad(storeCoords.lat - customerCoords.lat);
      const dLng = toRad(storeCoords.lng - customerCoords.lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(customerCoords.lat)) *
          Math.cos(toRad(storeCoords.lat)) *
          Math.sin(dLng / 2) ** 2;
      const routeKm = Number(
        Math.max(0.15, 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2)
      );

      await (DeliveryTask as any).create({
        id: "task-" + (order.id || Math.random().toString(36).substring(2, 8)),
        orderId: order.id,
        taskType: "pickup_from_customer",
        storeId: order.storeId || "store-hn-hoankiem",
        storeName: order.storeName || "Tiệm Giặt Sạch Sẽ Hoàn Kiếm",
        customerName: order.customerName,
        customerPhone: order.phoneNumber,
        customerAddress: customerAddressFull,
        storeAddress: storeAddressFull,
        pickupAddress: customerAddressFull,
        deliveryAddress: storeAddressFull,
        customerCoordinates: customerCoords,
        storeCoordinates: storeCoords,
        pickupCoordinates: customerCoords,
        deliveryCoordinates: storeCoords,
        broadcastRadiusKm: 1.0,
        distanceKm: routeKm,
        shippingFee: Number(order.deliveryFee) > 0 ? Number(order.deliveryFee) : 25000,
        paymentMethod: order.paymentMethod || "cod",
        pickupDate: order.pickupDate || "",
        pickupTime: order.pickupTime || "09:00 - 11:00",
        deliveryDate: order.deliveryDate || "",
        deliveryTime: order.deliveryTime || "16:00 - 18:00",
        rejectedDriverIds: [],
        status: "broadcasting",
        notes: order.notes || "Đơn hàng mới cần thu gom trong bán kính 1km",
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      // non-blocking
    }
  }

  realtimeHub.broadcast("ORDER_UPDATED", order, order.id);

  successResponse(res, order, "Đặt lịch dịch vụ giặt sấy thành công", 201);
});

/**
 * @desc    Lấy danh sách đơn hàng (hỗ trợ filter theo userId, phone, storeId, status)
 * @route   GET /api/laundry-orders
 * @access  Public
 */
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const { userId, phone, storeId, status } = req.query;
  const query: any = {};
  if (userId) query.userId = userId;
  if (phone) query.phoneNumber = phone;
  if (storeId && storeId !== "all") query.storeId = storeId;
  if (status && status !== "all") query.status = status;

  const orders = await (LaundryOrder as any).find(query).sort({ createdAt: -1 });

  successResponse(res, orders || [], "Lấy danh sách đơn hàng thành công");
});

/**
 * @desc    Lấy chi tiết đơn hàng
 * @route   GET /api/laundry-orders/:id
 * @access  Public
 */
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await findOrderByIdOrCustomId(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }
  successResponse(res, order, "Lấy chi tiết đơn hàng thành công");
});

/**
 * @desc    Cập nhật trạng thái đơn hàng
 * @route   PATCH /api/laundry-orders/:id/status
 * @access  Public
 */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, paymentStatus, weightConfirmStatus } = req.body;
  const order = await findOrderByIdOrCustomId(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  const updateFields: any = {};
  if (status) updateFields.status = status;
  if (paymentStatus) {
    updateFields.paymentStatus = paymentStatus;
    if (paymentStatus === "paid" && !order.paidAt) {
      updateFields.paidAt = new Date().toISOString();
    }
  }
  if (weightConfirmStatus) updateFields.weightConfirmStatus = weightConfirmStatus;
  if (status === "completed") updateFields.completedAt = new Date().toISOString();

  const updatedOrder = await (LaundryOrder as any).findByIdAndUpdate(
    order._id || order.id,
    updateFields,
    { new: true }
  );

  // If customer or store cancels the order while it is broadcasting to drivers, immediately cancel its DeliveryTasks
  if (status === "cancelled") {
    try {
      const DeliveryTask = (await import("../models/DeliveryTask")).default;
      const tasksToCancel = await (DeliveryTask as any).find({
        orderId: order.id,
      });
      if (Array.isArray(tasksToCancel)) {
        for (const t of tasksToCancel) {
          if (t.status === "broadcasting" || t.status === "accepted") {
            await (DeliveryTask as any).findOneAndUpdate(
              { id: t.id },
              { status: "cancelled" }
            );
          }
        }
      }
    } catch (e) {
      // non-blocking
    }
  }

  realtimeHub.broadcast("ORDER_UPDATED", updatedOrder, order.id);

  successResponse(res, updatedOrder, "Cập nhật trạng thái đơn hàng thành công");
});

/**
 * @desc    Cập nhật cân đo thực tế, dòng đồ giặt (Order_Details) & phụ phí yêu cầu đặc biệt của chủ tiệm
 * @route   PATCH /api/laundry-orders/:id/weigh
 * @access  Public / Store Owner
 */
export const weighAndInspectOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    items,
    weightConfirmStatus,
    status,
    notes,
    customerSpecialRequest,
    extraFee,
    extraFeeReason,
    paymentStatus,
    shipperId,
    shipperName,
    shipperPhone,
  } = req.body;

  const order = await findOrderByIdOrCustomId(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  const updatedItems = Array.isArray(items) ? items : order.items || [];
  const estimatedSubtotal = updatedItems.reduce((sum: number, item: any) => {
    const estQty = Number(item.estimatedQuantity ?? item.quantity ?? 0);
    const price = Number(item.unitPrice || 0);
    return sum + estQty * price;
  }, 0);

  const actualSubtotal = updatedItems.reduce((sum: number, item: any) => {
    const qty =
      item.actualQuantity !== undefined && item.actualQuantity !== null
        ? Number(item.actualQuantity)
        : Number(item.quantity || item.estimatedQuantity || 0);
    const price = Number(item.unitPrice || 0);
    return sum + qty * price;
  }, 0);

  const productsTotal = Number(order.productsTotal ?? 0);
  const deliveryFee = Number(order.deliveryFee ?? 20000);
  const discountAmount = Number(order.discountAmount ?? 0);
  const resolvedExtraFee =
    extraFee !== undefined && extraFee !== null
      ? Math.max(0, Number(extraFee) || 0)
      : Number(order.extraFee ?? 0);
  const totalPrice = Math.max(
    0,
    actualSubtotal + productsTotal + deliveryFee + resolvedExtraFee - discountAmount
  );

  const diffRatio =
    estimatedSubtotal > 0
      ? Math.abs(actualSubtotal - estimatedSubtotal) / estimatedSubtotal
      : 0;
  const exceedsThreshold =
    (actualSubtotal > estimatedSubtotal && diffRatio > 0.05) ||
    resolvedExtraFee > Number(order.extraFee ?? 0);

  const resolvedWeightStatus =
    weightConfirmStatus ||
    (exceedsThreshold ? "waiting_customer" : "accepted");
  const resolvedOrderStatus =
    status || (resolvedWeightStatus === "waiting_customer" ? "waiting_confirm" : "washing");

  const payload: any = {
    items: updatedItems.map((it: any) => {
      const actQty =
        it.actualQuantity !== undefined && it.actualQuantity !== null
          ? Number(it.actualQuantity)
          : Number(it.quantity || it.estimatedQuantity || 0);
      return {
        ...it,
        quantity: actQty,
        actualQuantity: actQty,
        actualLineTotal: actQty * Number(it.unitPrice || 0),
      };
    }),
    estimatedSubtotal: order.estimatedSubtotal || estimatedSubtotal,
    actualSubtotal,
    subtotal: actualSubtotal,
    extraFee: resolvedExtraFee,
    totalPrice,
    actualWeighedAt: new Date().toISOString(),
    weightConfirmStatus: resolvedWeightStatus,
    status: resolvedOrderStatus,
  };

  if (notes !== undefined) payload.notes = notes;
  if (customerSpecialRequest !== undefined)
    payload.customerSpecialRequest = customerSpecialRequest;
  if (extraFeeReason !== undefined) payload.extraFeeReason = extraFeeReason;
  if (paymentStatus !== undefined) payload.paymentStatus = paymentStatus;
  if (shipperId !== undefined) payload.shipperId = shipperId;
  if (shipperName !== undefined) payload.shipperName = shipperName;
  if (shipperPhone !== undefined) payload.shipperPhone = shipperPhone;

  // Regenerate dynamic VietQR URL with updated totalPrice
  const transferMemo = encodeURIComponent(`SACHSE ${order.id}`);
  const accountName = encodeURIComponent("CONG TY GIAT LA SACH SE");
  payload.vietQrUrl = `https://img.vietqr.io/image/MB-0988776655-compact2.png?amount=${Math.round(
    totalPrice
  )}&addInfo=${transferMemo}&accountName=${accountName}`;

  const updatedOrder = await (LaundryOrder as any).findByIdAndUpdate(
    order._id || order.id,
    payload,
    { new: true }
  );

  realtimeHub.broadcast("ORDER_UPDATED", updatedOrder, order.id);

  successResponse(
    res,
    updatedOrder,
    resolvedWeightStatus === "waiting_customer"
      ? "Đã cập nhật cân nặng & phụ phí: Đã gửi thông báo chờ Khách hàng xác nhận giá mới"
      : "Đã cập nhật đơn hàng và chuyển sang trạng thái Đang giặt sấy"
  );
});

/**
 * @desc    Khách hàng xác nhận Đồng ý hoặc Từ chối khối lượng & chi phí thực tế sau khi tiệm cân (Sequence 3)
 * @route   POST /api/laundry-orders/:id/confirm-weight
 * @access  Public / Customer
 */
export const confirmOrderWeight = asyncHandler(async (req: Request, res: Response) => {
  const { approved } = req.body;
  const order = await findOrderByIdOrCustomId(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  const isApproved = approved !== false;
  const updateFields = isApproved
    ? {
        weightConfirmStatus: "accepted",
        status: "washing",
      }
    : {
        weightConfirmStatus: "rejected_return",
        status: "returning",
      };

  const updatedOrder = await (LaundryOrder as any).findByIdAndUpdate(
    order._id || order.id,
    updateFields,
    { new: true }
  );

  realtimeHub.broadcast("ORDER_UPDATED", updatedOrder, order.id);

  successResponse(
    res,
    updatedOrder,
    isApproved
      ? "Khách hàng đã đồng ý giá mới — Đơn hàng chuyển sang Đang giặt sấy"
      : "Khách hàng từ chối giá mới — Đơn hàng chuyển sang Yêu cầu hoàn trả đồ"
  );
});

/**
 * @desc    Lấy lịch sử tin nhắn Chat nội bộ theo mã đơn
 * @route   GET /api/laundry-orders/:id/messages
 * @access  Public
 */
export const getOrderMessages = asyncHandler(async (req: Request, res: Response) => {
  const order = await findOrderByIdOrCustomId(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }
  const messages = Array.isArray(order.messages) ? order.messages : [];
  successResponse(res, { orderId: order.id, messages }, "Lấy lịch sử chat đơn hàng thành công");
});

/**
 * @desc    Gửi tin nhắn hoặc câu trả lời nhanh 1 chạm trong Kênh Chat Nội Bộ theo mã đơn
 * @route   POST /api/laundry-orders/:id/messages
 * @access  Public (Khách hàng / Tài xế / Chủ tiệm)
 */
export const sendOrderMessage = asyncHandler(async (req: Request, res: Response) => {
  const { senderRole, senderName, text, isQuickReply } = req.body;
  if (!text || !String(text).trim()) {
    return res.status(400).json({
      success: false,
      message: "Nội dung tin nhắn không được để trống",
    });
  }

  const order = await findOrderByIdOrCustomId(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  const resolvedRole: "customer" | "driver" | "store" | "system" =
    senderRole === "driver" || senderRole === "store" || senderRole === "system"
      ? senderRole
      : "customer";

  const defaultName =
    resolvedRole === "driver"
      ? order.shipperName || "Tài xế Sạch Sẽ"
      : resolvedRole === "store"
        ? order.storeName || "Chủ Tiệm Giặt Sạch Sẽ"
        : order.customerName || "Khách hàng";

  const newMessage = {
    id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    orderId: order.id,
    senderRole: resolvedRole,
    senderName: senderName || defaultName,
    text: String(text).trim(),
    isQuickReply: Boolean(isQuickReply),
    createdAt: new Date().toISOString(),
  };

  const existingMessages = Array.isArray(order.messages) ? [...order.messages] : [];
  existingMessages.push(newMessage);

  const updatedOrder = await (LaundryOrder as any).findByIdAndUpdate(
    order._id || order.id,
    { messages: existingMessages },
    { new: true }
  );

  realtimeHub.broadcast(
    "ORDER_CHAT_MESSAGE",
    {
      orderId: order.id,
      message: newMessage,
      messages: existingMessages,
    },
    order.id
  );

  successResponse(
    res,
    {
      orderId: order.id,
      message: newMessage,
      messages: existingMessages,
      order: updatedOrder,
    },
    "Đã gửi tin nhắn vào đơn hàng",
    201
  );
});

/**
 * @desc    Cập nhật tọa độ Live GPS của tài xế trực tiếp vào đơn hàng & phát SSE thời gian thực
 * @route   POST /api/laundry-orders/:id/driver-location
 * @access  Public / Driver
 */
export const updateOrderDriverLocation = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, heading, speedKmh, driverId, driverName } = req.body;
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({
      success: false,
      message: "Cần cung cấp tọa độ lat và lng",
    });
  }

  const order = await findOrderByIdOrCustomId(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  const liveLocation = {
    lat: Number(Number(lat).toFixed(6)),
    lng: Number(Number(lng).toFixed(6)),
    heading: heading !== undefined ? Number(heading) : 0,
    speedKmh: speedKmh !== undefined ? Number(speedKmh) : 28,
    updatedAt: new Date().toISOString(),
    driverId: driverId || order.shipperId || "drv-live",
    driverName: driverName || order.shipperName || "Tài xế Sạch Sẽ",
  };

  const updatedOrder = await (LaundryOrder as any).findByIdAndUpdate(
    order._id || order.id,
    { driverLocation: liveLocation },
    { new: true }
  );

  // Also sync to active DeliveryTask if any
  try {
    const DeliveryTask = (await import("../models/DeliveryTask")).default;
    const tasks = await (DeliveryTask as any).find({ orderId: order.id });
    if (Array.isArray(tasks)) {
      for (const t of tasks) {
        if (t.status !== "completed" && t.status !== "cancelled") {
          await (DeliveryTask as any).findOneAndUpdate(
            { id: t.id },
            { driverLocation: liveLocation }
          );
        }
      }
    }
  } catch {}

  realtimeHub.broadcast(
    "DRIVER_GPS_UPDATED",
    {
      orderId: order.id,
      driverLocation: liveLocation,
    },
    order.id
  );

  successResponse(
    res,
    {
      orderId: order.id,
      driverLocation: liveLocation,
      order: updatedOrder,
    },
    "Đã đồng bộ tọa độ Live GPS lên bản đồ thời gian thực"
  );
});

/**
 * @desc    Khởi tạo phiên Thanh toán Điện tử đa cổng (VietQR Napas247 / PayOS / VNPay) cho đơn giặt
 * @route   POST /api/laundry-orders/:id/payment-link
 * @access  Public
 */
export const createOrderPaymentLink = asyncHandler(async (req: Request, res: Response) => {
  const { gateway = "vietqr" } = req.body;
  const order = await findOrderByIdOrCustomId(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  const amount = Math.round(Number(order.totalPrice || 0));
  const cleanOrderCode = String(order.id).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const transferContent = `SACHSE ${cleanOrderCode}`;
  const bankId = gateway === "vnpay" ? "VCB" : gateway === "payos" ? "ACB" : "MB";
  const bankName =
    gateway === "vnpay"
      ? "Vietcombank - Cổng VNPay QR"
      : gateway === "payos"
        ? "ACB - Cổng PayOS Tự Động Đối Soát"
        : "MBBank - Cổng VietQR Napas 24/7";
  const accountNo =
    gateway === "vnpay"
      ? "0011009988776"
      : gateway === "payos"
        ? "8899668899"
        : "0988776655";
  const accountName = "CONG TY GIAT LA SACH SE";

  const qrImageUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(accountName)}`;

  await (LaundryOrder as any).findByIdAndUpdate(
    order._id || order.id,
    {
      paymentMethod: gateway,
      vietQrUrl: qrImageUrl,
    },
    { new: true }
  );

  successResponse(
    res,
    {
      orderId: order.id,
      gateway,
      amount,
      subtotal: Number(order.actualSubtotal ?? order.subtotal ?? 0),
      extraFee: Number(order.extraFee ?? 0),
      extraFeeReason: order.extraFeeReason || "",
      deliveryFee: Number(order.deliveryFee ?? 25000),
      discountAmount: Number(order.discountAmount ?? 0),
      bankId,
      bankName,
      accountNo,
      accountName,
      transferContent,
      qrImageUrl,
      webhookEndpoint: `/api/laundry-orders/${order.id}/payment-webhook`,
    },
    "Khởi tạo cổng thanh toán điện tử thành công"
  );
});

/**
 * @desc    Webhook Tự động Đối soát Thanh toán Điện tử (VietQR / PayOS / VNPay)
 * @route   POST /api/laundry-orders/:id/payment-webhook
 * @access  Public / Payment Gateway Webhook
 */
export const reconcileOrderPaymentWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { gateway = "vietqr", transactionId, amount } = req.body;
  const order = await findOrderByIdOrCustomId(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  const paidAmount = Math.round(Number(amount || order.totalPrice || 0));
  const resolvedGateway = gateway || order.paymentMethod || "vietqr";
  const gatewayPrefix = String(resolvedGateway).toUpperCase();
  const resolvedTxId =
    transactionId ||
    `FT-${gatewayPrefix}-${new Date().getFullYear()}${Math.floor(
      100000 + Math.random() * 900000
    )}`;
  const paidAt = new Date().toISOString();

  // Append an automatic system reconciliation message into the order chat log
  const existingMessages = Array.isArray(order.messages) ? [...order.messages] : [];
  const systemMessage = {
    id: "msg-pay-" + Date.now(),
    orderId: order.id,
    senderRole: "system" as const,
    senderName: `Đối soát tự động (${gatewayPrefix})`,
    text: `Hệ thống đã đối soát thanh toán thành công ${paidAmount.toLocaleString(
      "vi-VN"
    )}đ qua cổng ${gatewayPrefix}. Mã giao dịch: ${resolvedTxId}`,
    isQuickReply: false,
    createdAt: paidAt,
  };
  existingMessages.push(systemMessage);

  const updatedOrder = await (LaundryOrder as any).findByIdAndUpdate(
    order._id || order.id,
    {
      paymentStatus: "paid",
      paymentMethod: resolvedGateway,
      paymentTransactionId: resolvedTxId,
      paidAt,
      messages: existingMessages,
    },
    { new: true }
  );

  realtimeHub.broadcast(
    "ORDER_PAYMENT_RECONCILED",
    {
      orderId: order.id,
      paymentStatus: "paid",
      paymentMethod: resolvedGateway,
      paymentTransactionId: resolvedTxId,
      amount: paidAmount,
      paidAt,
      order: updatedOrder,
    },
    order.id
  );

  realtimeHub.broadcast("ORDER_UPDATED", updatedOrder, order.id);

  successResponse(
    res,
    {
      orderId: order.id,
      paymentStatus: "paid",
      paymentMethod: resolvedGateway,
      paymentTransactionId: resolvedTxId,
      amount: paidAmount,
      paidAt,
      order: updatedOrder,
    },
    `Đối soát tự động thành công ${paidAmount.toLocaleString("vi-VN")}đ (Mã GD: ${resolvedTxId})`
  );
});

/**
 * @desc    Xóa đơn hàng
 * @route   DELETE /api/laundry-orders/:id
 * @access  Public
 */
export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await findOrderByIdOrCustomId(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  try {
    await (LaundryOrder as any).findByIdAndDelete(order._id || order.id);
  } catch (err) {}

  realtimeHub.broadcast("ORDER_UPDATED", { id: order.id, deleted: true }, order.id);

  successResponse(res, null, "Xóa đơn hàng thành công");
});

