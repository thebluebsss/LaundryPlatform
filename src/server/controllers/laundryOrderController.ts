import crypto from "crypto";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import LaundryOrder from "../models/LaundryOrder";
import LaundryService from "../models/LaundryService";
import Product from "../models/Product";
import { realtimeHub } from "../services/realtimeHub";
import { normalizeRole } from "../middleware/auth";
import { config } from "../config/env";

const cleanStr = (val: unknown): string => String(val ?? "").trim().toLowerCase();

const isOrderOwner = (user: any, order: any): boolean => {
  if (!user || !order) return false;
  const uid = cleanStr(user._id || user.id);
  const phone = cleanStr(user.phone);
  return (
    (uid !== "" && cleanStr(order.userId) === uid) ||
    (phone !== "" && cleanStr(order.phoneNumber) === phone)
  );
};

const isOrderStoreOwner = (user: any, order: any): boolean => {
  if (!user || normalizeRole(user.role) !== "store_owner") return false;
  const assignedStoreId = cleanStr(user.assignedStoreId);
  if (!assignedStoreId) return true;
  return cleanStr(order?.storeId) === assignedStoreId;
};

const isOrderDriver = (user: any, order: any): boolean => {
  if (!user || normalizeRole(user.role) !== "driver") return false;
  const uid = cleanStr(user._id || user.id);
  const phone = cleanStr(user.phone);
  const shipperId = cleanStr(order?.shipperId);
  const shipperPhone = cleanStr(order?.shipperPhone);
  return (
    (uid !== "" && shipperId === uid) ||
    (phone !== "" && (shipperId === phone || shipperPhone === phone))
  );
};

const canAccessOrder = (user: any, order: any): boolean => {
  if (!user || !order) return false;
  const role = normalizeRole(user.role);
  if (role === "admin") return true;
  if (role === "store_owner") return isOrderStoreOwner(user, order);
  if (role === "driver") return isOrderDriver(user, order);
  return isOrderOwner(user, order);
};

const verifyPaymentWebhookSignature = (req: Request): boolean => {
  if (!config.paymentWebhookSecret) return false;
  const sigHeader = String(
    req.headers["x-webhook-signature"] || req.headers["x-signature"] || ""
  ).trim();
  if (!sigHeader) return false;
  const expected = crypto
    .createHmac("sha256", config.paymentWebhookSecret)
    .update(JSON.stringify(req.body || {}))
    .digest("hex");
  const sigBuf = Buffer.from(sigHeader);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
};

const orderAudience = (order: any) => ({
  userId: order?.userId,
  phoneNumber: order?.phoneNumber,
  storeId: order?.storeId,
  shipperId: order?.shipperId,
});

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
 * @desc    Tạo đơn hàng mới (tính giá từ bảng dịch vụ & sản phẩm trên server)
 * @route   POST /api/laundry-orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const role = normalizeRole(user?.role);
  const isStaff = role === "admin" || role === "store_owner";

  const orderData: any = { ...req.body };
  if (!orderData.id) {
    orderData.id = "ORD-" + Math.floor(1000 + Math.random() * 9000);
  }

  // Bind customer identity & restrict sensitive initial statuses for non-staff
  if (!isStaff) {
    orderData.userId = String(user._id || user.id);
    orderData.status = "pending";
    orderData.paymentStatus = "unpaid";
    orderData.weightConfirmStatus = "not_weighed";
  } else {
    orderData.status = orderData.status || "pending";
    orderData.weightConfirmStatus = orderData.weightConfirmStatus || "not_weighed";
    if (role === "store_owner" && user.assignedStoreId) {
      orderData.storeId = user.assignedStoreId;
    }
  }

  // Fetch authoritative prices from DB (LaundryService & Product)
  const [dbServices, dbProducts] = await Promise.all([
    (LaundryService as any).find({}).catch(() => []),
    (Product as any).find({}).catch(() => []),
  ]);

  const serviceById = new Map<string, any>();
  const serviceByName = new Map<string, any>();
  for (const s of dbServices || []) {
    if (s.customId) serviceById.set(cleanStr(s.customId), s);
    if (s.id) serviceById.set(cleanStr(s.id), s);
    if (s._id) serviceById.set(cleanStr(s._id), s);
    if (s.name) serviceByName.set(cleanStr(s.name), s);
  }

  const productById = new Map<string, any>();
  const productByName = new Map<string, any>();
  for (const p of dbProducts || []) {
    if (p.id) productById.set(cleanStr(p.id), p);
    if (p._id) productById.set(cleanStr(p._id), p);
    if (p.name) productByName.set(cleanStr(p.name), p);
  }

  let computedSubtotal = 0;
  if (Array.isArray(orderData.items)) {
    orderData.items = orderData.items.map((item: any) => {
      const estQty = Math.max(0.5, Number(item.estimatedQuantity ?? item.quantity ?? 1) || 1);
      const matchedService =
        serviceById.get(cleanStr(item.serviceId || item.id)) ||
        serviceByName.get(cleanStr(item.serviceName || item.name));
      const authoritativeUnitPrice = matchedService
        ? Number(matchedService.unitPrice ?? matchedService.price ?? 20000)
        : isStaff
          ? Math.max(0, Number(item.unitPrice ?? 20000))
          : Math.max(15000, Number(item.unitPrice ?? 20000));
      const lineTotal = Math.round(estQty * authoritativeUnitPrice);
      computedSubtotal += lineTotal;
      return {
        ...item,
        unitPrice: authoritativeUnitPrice,
        quantity: estQty,
        estimatedQuantity: estQty,
        actualQuantity: item.actualQuantity !== undefined ? item.actualQuantity : null,
        estimatedLineTotal: lineTotal,
        actualLineTotal: item.actualLineTotal !== undefined ? item.actualLineTotal : null,
      };
    });
  }

  let computedProductsTotal = 0;
  if (Array.isArray(orderData.products)) {
    orderData.products = orderData.products.map((p: any) => {
      const qty = Math.max(0, Math.round(Number(p.quantity || 0)));
      const matchedProduct =
        productById.get(cleanStr(p.productId || p.id)) ||
        productByName.get(cleanStr(p.name || p.productName));
      const unitPrice = matchedProduct
        ? Number(matchedProduct.price || 0)
        : Math.max(0, Number(p.unitPrice || 0));
      computedProductsTotal += qty * unitPrice;
      return { ...p, quantity: qty, unitPrice };
    });
  }

  const subtotal = Math.max(0, Math.round(computedSubtotal));
  const estimatedSubtotal = subtotal;
  const deliveryFee =
    isStaff && orderData.deliveryFee !== undefined
      ? Math.max(0, Math.round(Number(orderData.deliveryFee) || 0))
      : orderData.orderType === "pos"
        ? 0
        : 25000;

  // Validate promo codes server-side (prevent arbitrary client discount tampering)
  const promoCode = String(orderData.promoCode || "").trim().toUpperCase();
  let discountAmount = 0;
  if (isStaff && orderData.discountAmount !== undefined) {
    discountAmount = Math.min(subtotal, Math.max(0, Math.round(Number(orderData.discountAmount) || 0)));
  } else if (promoCode === "SACHSE10" || promoCode === "GIATLA10") {
    discountAmount = Math.min(50000, Math.round(subtotal * 0.1));
  } else if (promoCode === "FREESHIP") {
    discountAmount = deliveryFee;
  }

  const extraFee = isStaff ? Math.max(0, Math.round(Number(orderData.extraFee ?? 0))) : 0;
  const totalPrice = Math.max(
    0,
    subtotal + computedProductsTotal + deliveryFee + extraFee - discountAmount
  );

  orderData.subtotal = subtotal;
  orderData.estimatedSubtotal = estimatedSubtotal;
  orderData.productsTotal = computedProductsTotal;
  orderData.deliveryFee = deliveryFee;
  orderData.discountAmount = discountAmount;
  orderData.extraFee = extraFee;
  orderData.extraFeeReason = isStaff ? orderData.extraFeeReason || "" : "";
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

  if (!Array.isArray(orderData.messages)) {
    orderData.messages = [];
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
 * @desc    Lấy danh sách đơn hàng (tự động giới hạn theo vai trò & chủ sở hữu)
 * @route   GET /api/laundry-orders
 * @access  Private
 */
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const { userId, phone, storeId, status } = req.query;
  const user = req.user;
  const role = normalizeRole(user?.role);

  const query: any = {};
  if (status && status !== "all") query.status = status;

  if (role === "admin") {
    if (userId) query.userId = userId;
    if (phone) query.phoneNumber = phone;
    if (storeId && storeId !== "all") query.storeId = storeId;
  } else if (role === "store_owner") {
    if (user.assignedStoreId) {
      query.storeId = user.assignedStoreId;
    } else if (storeId && storeId !== "all") {
      query.storeId = storeId;
    }
    if (phone) query.phoneNumber = phone;
  }

  let orders = (await (LaundryOrder as any).find(query).sort({ createdAt: -1 })) || [];

  // Strict per-user filtering for customer and driver (handles both MongoDB and JSON fallback)
  if (role === "user" || role === "guest") {
    orders = orders.filter((o: any) => isOrderOwner(user, o));
  } else if (role === "driver") {
    orders = orders.filter((o: any) => isOrderDriver(user, o));
  }

  successResponse(res, orders, "Lấy danh sách đơn hàng thành công");
});

/**
 * @desc    Lấy chi tiết đơn hàng
 * @route   GET /api/laundry-orders/:id
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await findOrderByIdOrCustomId(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }
  if (!canAccessOrder(req.user, order)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền xem đơn hàng này",
    });
  }
  successResponse(res, order, "Lấy chi tiết đơn hàng thành công");
});

/**
 * @desc    Cập nhật trạng thái đơn hàng
 * @route   PATCH /api/laundry-orders/:id/status
 * @access  Private
 */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, paymentStatus, weightConfirmStatus } = req.body;
  const order = await findOrderByIdOrCustomId(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  const user = req.user;
  const role = normalizeRole(user?.role);
  const isStaff = role === "admin" || role === "store_owner";

  if (!canAccessOrder(user, order)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền cập nhật đơn hàng này",
    });
  }

  // Never trust client-supplied byRole: enforce strict role-based transition permissions
  if (!isStaff) {
    if (paymentStatus !== undefined) {
      return res.status(403).json({
        success: false,
        message: "Chỉ Chủ tiệm hoặc Quản trị viên mới có thể cập nhật trạng thái thanh toán thủ công",
      });
    }
    if (req.body.assignedMachineId !== undefined || req.body.assignedMachineName !== undefined) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền gán thiết bị giặt",
      });
    }
    if (role === "user" || role === "guest") {
      // Customers may only cancel their own order (or confirm/reject weight via confirm-weight)
      if (status && status !== "cancelled") {
        return res.status(403).json({
          success: false,
          message: "Khách hàng chỉ có thể hủy đơn hàng của mình",
        });
      }
    } else if (role === "driver") {
      const driverAllowedStatuses = ["picking_up", "sorting", "delivering", "completed"];
      if (status && !driverAllowedStatuses.includes(status)) {
        return res.status(403).json({
          success: false,
          message: "Tài xế không được phép chuyển đơn sang trạng thái này",
        });
      }
    }
  }

  // Kiểm tra điều kiện hủy đơn: Khách hàng chỉ được hủy đơn trước khi tài xế lấy đơn thành công
  if (status === "cancelled" && !isStaff) {
    const postPickupStatuses = [
      "sorting",
      "waiting_confirm",
      "washing",
      "ironing",
      "delivering",
      "returning",
      "completed",
    ];
    let hasDriverPickedUp =
      Boolean(order.pickedUpAt && String(order.pickedUpAt).trim()) ||
      postPickupStatuses.includes(String(order.status));

    if (!hasDriverPickedUp) {
      try {
        const DeliveryTask = (await import("../models/DeliveryTask")).default;
        const relatedTasks = await (DeliveryTask as any).find({
          orderId: order.id,
        });
        if (Array.isArray(relatedTasks)) {
          hasDriverPickedUp = relatedTasks.some(
            (t: any) =>
              t.taskType !== "deliver_to_customer" &&
              (["picked_up", "in_transit", "completed"].includes(t.status) ||
                Boolean(t.pickedUpAt))
          );
        }
      } catch {}
    }

    if (hasDriverPickedUp) {
      return res.status(400).json({
        success: false,
        message:
          "Tài xế đã lấy đơn thành công nên không thể hủy đơn hàng này",
      });
    }
  }

  const updateFields: any = {};
  if (status) updateFields.status = status;
  if (paymentStatus && isStaff) {
    updateFields.paymentStatus = paymentStatus;
    if (paymentStatus === "paid" && !order.paidAt) {
      updateFields.paidAt = new Date().toISOString();
    }
  }
  if (weightConfirmStatus && isStaff) updateFields.weightConfirmStatus = weightConfirmStatus;
  if (status === "completed") updateFields.completedAt = new Date().toISOString();
  if (status === "cancelled") {
    updateFields.cancelledAt = new Date().toISOString();
    if (req.body.cancelReason) {
      updateFields.cancelReason = String(req.body.cancelReason);
    }
  }
  if (isStaff && req.body.assignedMachineId !== undefined) {
    updateFields.assignedMachineId = String(req.body.assignedMachineId);
  }
  if (isStaff && req.body.assignedMachineName !== undefined) {
    updateFields.assignedMachineName = String(req.body.assignedMachineName);
  }

  const updatedOrder = await (LaundryOrder as any).findByIdAndUpdate(
    order._id || order.id,
    updateFields,
    { new: true }
  );

  // Khi khách hàng hoặc cửa hàng hủy đơn trước khi tài xế lấy đồ thành công -> Hủy toàn bộ chuyến giao nhận đang phát sóng hoặc tài xế đang đi lấy
  if (status === "cancelled") {
    try {
      const DeliveryTask = (await import("../models/DeliveryTask")).default;
      const tasksToCancel = await (DeliveryTask as any).find({
        orderId: order.id,
      });
      if (Array.isArray(tasksToCancel)) {
        for (const t of tasksToCancel) {
          if (
            [
              "broadcasting",
              "accepted",
              "picking_up",
              "arrived_pickup",
            ].includes(t.status)
          ) {
            await (DeliveryTask as any).findOneAndUpdate(
              { id: t.id },
              {
                status: "cancelled",
                cancelledAt: new Date().toISOString(),
              }
            );
          }
        }
      }
    } catch (e) {
      // non-blocking
    }
  }

  realtimeHub.broadcast("ORDER_UPDATED", updatedOrder, order.id, orderAudience(updatedOrder));

  successResponse(res, updatedOrder, "Cập nhật trạng thái đơn hàng thành công");
});

/**
 * @desc    Cập nhật cân đo thực tế, dòng đồ giặt (Order_Details) & phụ phí yêu cầu đặc biệt của chủ tiệm
 * @route   PATCH /api/laundry-orders/:id/weigh
 * @access  Private (Store Owner / Admin)
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

  if (normalizeRole(req.user?.role) !== "admin" && !isOrderStoreOwner(req.user, order)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền cân đo đơn hàng của cửa hàng khác",
    });
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

  const role = normalizeRole(req.user?.role);
  if (role !== "admin" && !isOrderOwner(req.user, order)) {
    return res.status(403).json({
      success: false,
      message: "Chỉ chủ đơn hàng mới có quyền xác nhận cân nặng",
    });
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

  realtimeHub.broadcast("ORDER_UPDATED", updatedOrder, order.id, orderAudience(updatedOrder));

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
 * @access  Private
 */
export const getOrderMessages = asyncHandler(async (req: Request, res: Response) => {
  const order = await findOrderByIdOrCustomId(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }
  if (!canAccessOrder(req.user, order)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền xem tin nhắn của đơn hàng này",
    });
  }
  const messages = Array.isArray(order.messages) ? order.messages : [];
  successResponse(res, { orderId: order.id, messages }, "Lấy lịch sử chat đơn hàng thành công");
});

/**
 * @desc    Gửi tin nhắn hoặc câu trả lời nhanh 1 chạm trong Kênh Chat Nội Bộ theo mã đơn
 * @route   POST /api/laundry-orders/:id/messages
 * @access  Private (Khách hàng / Tài xế / Chủ tiệm / Admin)
 */
export const sendOrderMessage = asyncHandler(async (req: Request, res: Response) => {
  const { senderName, text, isQuickReply } = req.body;
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

  if (!canAccessOrder(req.user, order)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền nhắn tin trong đơn hàng này",
    });
  }

  // Derive senderRole strictly from authenticated JWT user (never trust spoofed body.senderRole)
  const authRole = normalizeRole(req.user?.role);
  const resolvedRole: "customer" | "driver" | "store" | "system" =
    authRole === "driver"
      ? "driver"
      : authRole === "store_owner" || authRole === "admin"
        ? "store"
        : "customer";

  const hasAssignedDriver = Boolean(
    (order.shipperId && String(order.shipperId).trim()) ||
      (order.shipperName && String(order.shipperName).trim())
  );

  if (!hasAssignedDriver && resolvedRole !== "driver") {
    return res.status(400).json({
      success: false,
      message: "Chưa có tài xế nhận chuyến nên chưa thể nhắn tin trong đơn hàng này",
    });
  }

  const defaultName =
    resolvedRole === "driver"
      ? req.user?.fullName || order.shipperName || "Tài xế Sạch Sẽ"
      : resolvedRole === "store"
        ? order.storeName || req.user?.fullName || "Chủ Tiệm Giặt Sạch Sẽ"
        : req.user?.fullName || order.customerName || "Khách hàng";

  const newMessage = {
    id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    orderId: order.id,
    senderRole: resolvedRole,
    senderName: senderName || defaultName,
    text: String(text).trim().slice(0, 2000),
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
      customerName: order.customerName || "Khách hàng",
      storeName: order.storeName || "Tiệm Giặt Sạch Sẽ",
      shipperName: order.shipperName || "Tài xế Sạch Sẽ",
      userId: order.userId || "",
      phoneNumber: order.phoneNumber || "",
      storeId: order.storeId || "",
      shipperId: order.shipperId || "",
    },
    order.id,
    orderAudience(order)
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
 * @access  Private (Driver / Admin)
 */
export const updateOrderDriverLocation = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, heading, speedKmh, driverName } = req.body;
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

  const authRole = normalizeRole(req.user?.role);
  if (authRole !== "admin" && !isOrderDriver(req.user, order)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không phải tài xế đang phụ trách đơn hàng này",
    });
  }

  const liveLocation = {
    lat: Number(Number(lat).toFixed(6)),
    lng: Number(Number(lng).toFixed(6)),
    heading: heading !== undefined ? Number(heading) : 0,
    speedKmh: speedKmh !== undefined ? Number(speedKmh) : 28,
    updatedAt: new Date().toISOString(),
    driverId: String(req.user?._id || req.user?.id || order.shipperId || "drv-live"),
    driverName: driverName || req.user?.fullName || order.shipperName || "Tài xế Sạch Sẽ",
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
    order.id,
    orderAudience(order)
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
 * @access  Private
 */
export const createOrderPaymentLink = asyncHandler(async (req: Request, res: Response) => {
  const { gateway = "vietqr" } = req.body;
  const order = await findOrderByIdOrCustomId(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  if (!canAccessOrder(req.user, order)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền khởi tạo thanh toán cho đơn hàng này",
    });
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
 * @access  Signed Payment Gateway Webhook OR Authenticated Admin / Store Owner
 */
export const reconcileOrderPaymentWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { gateway = "vietqr", transactionId, amount } = req.body;
  const order = await findOrderByIdOrCustomId(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  const hasValidWebhookSignature = verifyPaymentWebhookSignature(req);
  const authRole = req.user ? normalizeRole(req.user.role) : "";
  const isAuthorizedStaff =
    authRole === "admin" || (authRole === "store_owner" && isOrderStoreOwner(req.user, order));
  const isDevOwnerDemo =
    config.allowDemoPaymentConfirm && Boolean(req.user) && isOrderOwner(req.user, order);

  if (!hasValidWebhookSignature && !isAuthorizedStaff && !isDevOwnerDemo) {
    return res.status(403).json({
      success: false,
      message:
        "Thiếu chữ ký xác thực webhook thanh toán hợp lệ (x-webhook-signature) hoặc quyền Quản trị/Chủ tiệm",
    });
  }

  const expectedOrderTotal = Math.round(Number(order.totalPrice || 0));
  if (hasValidWebhookSignature && amount !== undefined) {
    const incomingAmount = Math.round(Number(amount));
    if (!Number.isFinite(incomingAmount) || incomingAmount < expectedOrderTotal) {
      return res.status(400).json({
        success: false,
        message: "Số tiền giao dịch không khớp với tổng giá trị đơn hàng",
      });
    }
  }

  // Idempotency: if already paid, return existing state cleanly
  if (order.paymentStatus === "paid") {
    return successResponse(
      res,
      {
        orderId: order.id,
        paymentStatus: "paid",
        paymentMethod: order.paymentMethod,
        paymentTransactionId: order.paymentTransactionId,
        amount: expectedOrderTotal,
        paidAt: order.paidAt,
        order,
      },
      "Đơn hàng này đã được đối soát thanh toán trước đó"
    );
  }

  const paidAmount = expectedOrderTotal;
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

  const audience = orderAudience(updatedOrder || order);
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
    order.id,
    audience
  );

  realtimeHub.broadcast("ORDER_UPDATED", updatedOrder, order.id, audience);

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
 * @access  Private (Admin / Store Owner)
 */
export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await findOrderByIdOrCustomId(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
  }

  if (normalizeRole(req.user?.role) !== "admin" && !isOrderStoreOwner(req.user, order)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền xóa đơn hàng của cửa hàng khác",
    });
  }

  try {
    await (LaundryOrder as any).findByIdAndDelete(order._id || order.id);
  } catch (err) {}

  realtimeHub.broadcast("ORDER_UPDATED", { id: order.id, deleted: true }, order.id, orderAudience(order));

  successResponse(res, null, "Xóa đơn hàng thành công");
});

/**
 * @desc    Lưu ghi chú chăm sóc vải riêng của khách quen vào CSDL (LaundryOrder & User)
 * @route   PATCH /api/laundry-orders/customer-care-note
 * @access  Public / Store Owner
 */
export const updateCustomerCareNote = asyncHandler(
  async (req: Request, res: Response) => {
    const { phone, note } = req.body;
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp số điện thoại khách hàng",
      });
    }

    const cleanPhone = String(phone).trim();
    const cleanNote = String(note || "").trim();

    // Update all orders matching this customer's phone number
    const matchingOrders =
      (await (LaundryOrder as any).find({ phoneNumber: cleanPhone })) || [];
    for (const ord of matchingOrders) {
      await (LaundryOrder as any).findByIdAndUpdate(ord._id || ord.id, {
        customerCareNote: cleanNote,
      });
    }

    // Also update User profile if registered with this phone
    try {
      const User = (await import("../models/User")).default;
      await (User as any).findOneAndUpdate(
        { phone: cleanPhone },
        { fabricCareNote: cleanNote }
      );
    } catch {}

    successResponse(
      res,
      {
        phone: cleanPhone,
        customerCareNote: cleanNote,
        updatedOrdersCount: matchingOrders.length,
      },
      "Đã lưu ghi chú chăm sóc vải riêng của khách hàng vào CSDL"
    );
  }
);


