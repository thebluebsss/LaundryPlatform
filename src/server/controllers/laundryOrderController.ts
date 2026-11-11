import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import LaundryOrder from "../models/LaundryOrder";

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

  // Ensure each item in Order_Details has estimatedQuantity and estimatedLineTotal per Sequence 1
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

  // Step 22 of Sequence 1: Tính giá tạm tính (estimated_subtotal, total_price)
  const subtotal = Number(orderData.subtotal ?? computedSubtotal);
  const estimatedSubtotal = Number(orderData.estimatedSubtotal ?? subtotal);
  const deliveryFee = Number(orderData.deliveryFee ?? 25000);
  const discountAmount = Number(orderData.discountAmount ?? 0);
  const totalPrice = Number(
    orderData.totalPrice ??
      Math.max(0, subtotal + computedProductsTotal + deliveryFee - discountAmount)
  );

  orderData.subtotal = subtotal;
  orderData.estimatedSubtotal = estimatedSubtotal;
  orderData.productsTotal = computedProductsTotal;
  orderData.deliveryFee = deliveryFee;
  orderData.discountAmount = discountAmount;
  orderData.totalPrice = totalPrice;

  // Resolve customer Google Maps coordinates in Hanoi
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

      const storeCoords =
        storeDoc && storeDoc.lat && storeDoc.lng
          ? { lat: Number(storeDoc.lat), lng: Number(storeDoc.lng) }
          : {
              lat: Number((customerCoords.lat + 0.008).toFixed(6)),
              lng: Number((customerCoords.lng + 0.006).toFixed(6)),
            };

      const storeAddressFull =
        storeDoc?.address ||
        `${order.storeName || "Tiệm Giặt Sạch Sẽ"}, ${order.district || "Quận Hoàn Kiếm"}, Thành Phố Hà Nội, Việt Nam`;

      const customerAddressFull = `${order.address}${
        order.district ? `, ${order.district}` : ""
      }, Thành Phố Hà Nội, Việt Nam`;

      // Calculate route distance between customer and store
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
  let order = await (LaundryOrder as any).findOne({ id: req.params.id });
  if (!order) {
    order = await (LaundryOrder as any).findById(req.params.id);
  }
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
  let order = await (LaundryOrder as any).findOne({ id: req.params.id });
  if (!order) {
    order = await (LaundryOrder as any).findById(req.params.id);
  }

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  const updateFields: any = {};
  if (status) updateFields.status = status;
  if (paymentStatus) updateFields.paymentStatus = paymentStatus;
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

  successResponse(res, updatedOrder, "Cập nhật trạng thái đơn hàng thành công");
});

/**
 * @desc    Cập nhật cân đo thực tế, dòng đồ giặt (Order_Details) & kết quả AI của chủ tiệm
 * @route   PATCH /api/laundry-orders/:id/weigh
 * @access  Public / Store Owner
 */
export const weighAndInspectOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    items,
    weightConfirmStatus,
    status,
    notes,
    aiInspection,
    paymentStatus,
    shipperId,
    shipperName,
    shipperPhone,
  } = req.body;

  let order = await (LaundryOrder as any).findOne({ id: req.params.id });
  if (!order) {
    order = await (LaundryOrder as any).findById(req.params.id);
  }

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
  const totalPrice = Math.max(
    0,
    actualSubtotal + productsTotal + deliveryFee - discountAmount
  );

  // Sequence 3 discrepancy check: compare actualSubtotal vs estimatedSubtotal
  const diffRatio =
    estimatedSubtotal > 0
      ? Math.abs(actualSubtotal - estimatedSubtotal) / estimatedSubtotal
      : 0;
  const exceedsThreshold = actualSubtotal > estimatedSubtotal && diffRatio > 0.05;

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
    totalPrice,
    actualWeighedAt: new Date().toISOString(),
    weightConfirmStatus: resolvedWeightStatus,
    status: resolvedOrderStatus,
  };

  if (notes !== undefined) payload.notes = notes;
  if (aiInspection !== undefined) payload.aiInspection = aiInspection;
  if (paymentStatus !== undefined) payload.paymentStatus = paymentStatus;
  if (shipperId !== undefined) payload.shipperId = shipperId;
  if (shipperName !== undefined) payload.shipperName = shipperName;
  if (shipperPhone !== undefined) payload.shipperPhone = shipperPhone;

  const updatedOrder = await (LaundryOrder as any).findByIdAndUpdate(
    order._id || order.id,
    payload,
    { new: true }
  );

  successResponse(
    res,
    updatedOrder,
    resolvedWeightStatus === "waiting_customer"
      ? "Khối lượng chênh lệch vượt ngưỡng: Đã gửi thông báo chờ Khách hàng xác nhận giá mới"
      : "Khối lượng khớp ngưỡng cho phép: Đã chuyển đơn sang trạng thái Đang giặt sấy"
  );
});

/**
 * @desc    Khách hàng xác nhận Đồng ý hoặc Từ chối khối lượng & chi phí thực tế sau khi tiệm cân (Sequence 3)
 * @route   POST /api/laundry-orders/:id/confirm-weight
 * @access  Public / Customer
 */
export const confirmOrderWeight = asyncHandler(async (req: Request, res: Response) => {
  const { approved } = req.body;
  let order = await (LaundryOrder as any).findOne({ id: req.params.id });
  if (!order) {
    order = await (LaundryOrder as any).findById(req.params.id);
  }

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

  successResponse(
    res,
    updatedOrder,
    isApproved
      ? "Khách hàng đã đồng ý giá mới — Đơn hàng chuyển sang Đang giặt sấy"
      : "Khách hàng từ chối giá mới — Đơn hàng chuyển sang Yêu cầu hoàn trả đồ"
  );
});

/**
 * @desc    Xóa đơn hàng
 * @route   DELETE /api/laundry-orders/:id
 * @access  Public
 */
export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  let order = await (LaundryOrder as any).findOne({ id: req.params.id });
  if (!order) {
    order = await (LaundryOrder as any).findById(req.params.id);
  }

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  try {
    await (LaundryOrder as any).findByIdAndDelete(order._id || order.id);
  } catch (err) {}

  successResponse(res, null, "Xóa đơn hàng thành công");
});
