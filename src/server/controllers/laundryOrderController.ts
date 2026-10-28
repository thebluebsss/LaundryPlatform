import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import LaundryOrder from "../models/LaundryOrder";

const DEFAULT_LAUNDRY_ORDERS = [
  {
    id: "ORD-8821",
    userId: "user-demo-1",
    customerName: "Nguyễn Minh Tâm",
    phoneNumber: "0908112233",
    address: "45 Lê Thánh Tôn, Phường Bến Nghé",
    district: "Quận 1",
    storeId: "store-hcm-q1",
    storeName: "Tiệm Giặt Sấy Vô Trùng Q1 - Nguyễn Trãi",
    shipperId: "drv-1",
    shipperName: "Nguyễn Văn Hùng",
    shipperPhone: "0911 222 333",
    pickupDate: "2026-10-22",
    pickupTime: "08:00 - 10:00",
    deliveryDate: "2026-10-23",
    deliveryTime: "16:00 - 18:00",
    notes: "Áo sơ mi trắng xin giặt riêng, không dùng chất tẩy mạnh",
    promoCode: "GIATMOI15",
    discountAmount: 22500,
    estimatedSubtotal: 150000,
    actualSubtotal: null,
    subtotal: 150000,
    deliveryFee: 20000,
    totalPrice: 147500,
    weightConfirmStatus: "not_weighed",
    status: "sorting",
    paymentMethod: "vietqr",
    paymentStatus: "pending",
    items: [
      {
        serviceId: "wf-regular",
        serviceName: "Giặt Sấy Thường (Wash & Fold)",
        fabricType: "Cotton / Đồ mặc hàng ngày",
        garmentDescription: "Quần áo thun, đồ mặc nhà",
        careInstructions: "Sấy nhiệt độ vừa 60°C",
        pricingType: "per_kg",
        unitName: "kg",
        unitPrice: 20000,
        quantity: 4,
        estimatedQuantity: 4,
        actualQuantity: null,
        estimatedLineTotal: 80000,
        actualLineTotal: null,
        aiInspectionResult: "",
      },
      {
        serviceId: "dc-suit",
        serviceName: "Giặt Khô Cao Cấp (Dry Clean)",
        fabricType: "Lụa / Sơ mi trắng & Âu phục",
        garmentDescription: "2 áo sơ mi lụa trắng + 1 quần âu",
        careInstructions: "Giặt khô dung môi hữu cơ, ủi hơi treo",
        pricingType: "per_item",
        unitName: "bộ",
        unitPrice: 70000,
        quantity: 1,
        estimatedQuantity: 1,
        actualQuantity: null,
        estimatedLineTotal: 70000,
        actualLineTotal: null,
        aiInspectionResult: "AI phát hiện lụa tơ tằm tự nhiên, khuyến nghị không vắt ly tâm.",
      },
    ],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-8822",
    userId: "user-demo-2",
    customerName: "Trần Bảo Ngọc",
    phoneNumber: "0912345678",
    address: "Landmark 81, Vinhomes Central Park",
    district: "Quận Bình Thạnh",
    storeId: "store-hcm-q1",
    storeName: "Tiệm Giặt Sấy Vô Trùng Q1 - Nguyễn Trãi",
    shipperId: "drv-2",
    shipperName: "Trần Quốc Tuấn",
    shipperPhone: "0933 444 555",
    pickupDate: "2026-10-22",
    pickupTime: "10:00 - 12:00",
    deliveryDate: "2026-10-23",
    deliveryTime: "18:00 - 20:00",
    notes: "Chăn lông vũ cần sấy phồng khử khuẩn UV",
    discountAmount: 0,
    estimatedSubtotal: 160000,
    actualSubtotal: 190000,
    subtotal: 190000,
    deliveryFee: 20000,
    totalPrice: 210000,
    weightConfirmStatus: "waiting_customer",
    actualWeighedAt: new Date(Date.now() - 1800 * 1000).toISOString(),
    status: "waiting_confirm",
    paymentMethod: "vietqr",
    paymentStatus: "pending",
    items: [
      {
        serviceId: "hi-blanket",
        serviceName: "Giặt Chăn Mền / Đồ Nặng",
        fabricType: "Lông vũ / Chăn bông dày",
        garmentDescription: "1 chăn Đông King Size + 2 vỏ gối",
        careInstructions: "Sấy đảo chiều kèm bóng tennis làm phồng lông vũ",
        pricingType: "per_kg",
        unitName: "kg",
        unitPrice: 30000,
        quantity: 5,
        estimatedQuantity: 4,
        actualQuantity: 5,
        estimatedLineTotal: 120000,
        actualLineTotal: 150000,
        aiInspectionResult: "Tem mác: Down 80% / Feather 20% - Chế độ Delicate Wash.",
      },
      {
        serviceId: "wf-regular",
        serviceName: "Giặt Sấy Thường (Wash & Fold)",
        fabricType: "Cotton hỗn hợp",
        garmentDescription: "Đồ thể thao & khăn tắm",
        careInstructions: "Nước xả hương Lavender",
        pricingType: "per_kg",
        unitName: "kg",
        unitPrice: 20000,
        quantity: 2,
        estimatedQuantity: 2,
        actualQuantity: 2,
        estimatedLineTotal: 40000,
        actualLineTotal: 40000,
        aiInspectionResult: "",
      },
    ],
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-8825",
    userId: "user-demo-3",
    customerName: "Lê Hoàng Phúc",
    phoneNumber: "0988776655",
    address: "120 Nguyễn Đình Chiểu, Phường Đa Kao",
    district: "Quận 1",
    storeId: "store-hcm-q1",
    storeName: "Tiệm Giặt Sấy Vô Trùng Q1 - Nguyễn Trãi",
    shipperId: "drv-1",
    shipperName: "Nguyễn Văn Hùng",
    shipperPhone: "0911 222 333",
    pickupDate: "2026-10-21",
    pickupTime: "14:00 - 16:00",
    deliveryDate: "2026-10-22",
    deliveryTime: "14:00 - 16:00",
    notes: "Khách đã xác nhận cân nặng qua App",
    discountAmount: 0,
    estimatedSubtotal: 100000,
    actualSubtotal: 110000,
    subtotal: 110000,
    deliveryFee: 20000,
    totalPrice: 130000,
    weightConfirmStatus: "accepted",
    actualWeighedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    status: "washing",
    paymentMethod: "vietqr",
    paymentStatus: "paid",
    items: [
      {
        serviceId: "wf-regular",
        serviceName: "Giặt Sấy Thường (Wash & Fold)",
        fabricType: "Cotton / Đồ công sở",
        garmentDescription: "Quần tây, áo polo",
        careInstructions: "Gấp phẳng chống nhăn",
        pricingType: "per_kg",
        unitName: "kg",
        unitPrice: 20000,
        quantity: 5.5,
        estimatedQuantity: 5,
        actualQuantity: 5.5,
        estimatedLineTotal: 100000,
        actualLineTotal: 110000,
        aiInspectionResult: "Chất liệu Cotton pha Spandex co giãn, nhiệt độ sấy < 55°C.",
      },
    ],
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-8820",
    userId: "user-default-id",
    customerName: "Phạm Khánh Linh",
    phoneNumber: "0911111111",
    address: "88 Đồng Khởi, Phường Bến Nghé",
    district: "Quận 1",
    storeId: "store-hcm-q1",
    storeName: "Tiệm Giặt Sấy Vô Trùng Q1 - Nguyễn Trãi",
    shipperId: "drv-1",
    shipperName: "Nguyễn Văn Hùng",
    shipperPhone: "0911 222 333",
    pickupDate: "2026-10-20",
    pickupTime: "08:00 - 10:00",
    deliveryDate: "2026-10-21",
    deliveryTime: "16:00 - 18:00",
    notes: "Ủi hơi phẳng vest công sở và gấp gọn đồ mặc nhà",
    discountAmount: 0,
    estimatedSubtotal: 140000,
    actualSubtotal: 140000,
    subtotal: 140000,
    deliveryFee: 20000,
    totalPrice: 160000,
    weightConfirmStatus: "accepted",
    actualWeighedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    status: "completed",
    paymentMethod: "vietqr",
    paymentStatus: "paid",
    items: [
      {
        serviceId: "wf-premium",
        serviceName: "Giặt Ủi Cao Cấp (Có Là Hơi)",
        fabricType: "Cotton & Sơ mi công sở",
        garmentDescription: "3kg đồ công sở + 1 bộ vest",
        careInstructions: "Là hơi treo móc chống nhăn",
        pricingType: "per_kg",
        unitName: "kg",
        unitPrice: 25000,
        quantity: 3,
        estimatedQuantity: 3,
        actualQuantity: 3,
        estimatedLineTotal: 75000,
        actualLineTotal: 75000,
        aiInspectionResult: "Vải Cotton Ai Cập mật độ sợi cao, ủi hơi ở 150°C.",
      },
      {
        serviceId: "dc-vest",
        serviceName: "Giặt Hấp Áo Vest / Blazer",
        fabricType: "Dạ / Wool Pha Cao Cấp",
        garmentDescription: "1 áo Vest đen công sở",
        careInstructions: "Giặt hấp hữu cơ giữ phom vai",
        pricingType: "per_item",
        unitName: "cái",
        unitPrice: 65000,
        quantity: 1,
        estimatedQuantity: 1,
        actualQuantity: 1,
        estimatedLineTotal: 65000,
        actualLineTotal: 65000,
        aiInspectionResult: "Len Wool 70%, tuyệt đối không giặt nước.",
      },
    ],
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-8819",
    userId: "user-default-id",
    customerName: "Hoàng Minh Khôi",
    phoneNumber: "0911111111",
    address: "210 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu",
    district: "Quận 3",
    storeId: "store-hcm-bt",
    storeName: "Tiệm Giặt Nhanh 24/7 Bình Thạnh - Đinh Bộ Lĩnh",
    shipperId: "drv-3",
    shipperName: "Phạm Hoàng Nam",
    shipperPhone: "0913 444 555",
    pickupDate: "2026-10-19",
    pickupTime: "09:00 - 11:00",
    deliveryDate: "2026-10-20",
    deliveryTime: "15:00 - 17:00",
    notes: "Giặt bộ chăn ga gối Cotton Hàn Quốc",
    discountAmount: 0,
    estimatedSubtotal: 110000,
    actualSubtotal: 110000,
    subtotal: 110000,
    deliveryFee: 20000,
    totalPrice: 130000,
    weightConfirmStatus: "accepted",
    actualWeighedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: "completed",
    paymentMethod: "cod",
    paymentStatus: "paid",
    items: [
      {
        serviceId: "hv-blanket",
        serviceName: "Giặt Chăn Bông Dày",
        fabricType: "Cotton chần bông",
        garmentDescription: "1 chăn bông + 1 bộ ga giường",
        careInstructions: "Sấy diệt khuẩn UV Nano",
        pricingType: "per_item",
        unitName: "cái",
        unitPrice: 60000,
        quantity: 1,
        estimatedQuantity: 1,
        actualQuantity: 1,
        estimatedLineTotal: 60000,
        actualLineTotal: 60000,
        aiInspectionResult: "",
      },
      {
        serviceId: "hv-bedsheet",
        serviceName: "Giặt Bộ Drap Giường (Ga + Gối)",
        fabricType: "Cotton Tencel",
        garmentDescription: "1 bộ Drap 1m8",
        careInstructions: "Xả hương hoa trắng tự nhiên",
        pricingType: "per_item",
        unitName: "bộ",
        unitPrice: 50000,
        quantity: 1,
        estimatedQuantity: 1,
        actualQuantity: 1,
        estimatedLineTotal: 50000,
        actualLineTotal: 50000,
        aiInspectionResult: "",
      },
    ],
    createdAt: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
  },
];

/**
 * @desc    Tạo đơn hàng mới
 * @route   POST /api/laundry-orders
 * @access  Public
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const orderData = req.body;
  if (!orderData.id) {
    orderData.id = "ORD-" + Math.floor(1000 + Math.random() * 9000);
  }
  const order = await (LaundryOrder as any).create(orderData);

  // Auto create broadcast DeliveryTask for nearby drivers/shippers
  try {
    const DeliveryTask = (await import("../models/DeliveryTask")).default;
    await (DeliveryTask as any).create({
      id: "task-" + (order.id || Math.random().toString(36).substring(2, 8)),
      orderId: order.id,
      taskType: "pickup_from_customer",
      storeId: order.storeId || "store-hcm-q1",
      storeName: order.storeName || "Tiệm Giặt Sấy Vô Trùng Q1",
      customerName: order.customerName,
      customerPhone: order.phoneNumber,
      customerAddress: order.address + (order.district ? `, ${order.district}` : ""),
      storeAddress: "185 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM",
      pickupCoordinates: order.customerCoordinates || { lat: 10.7682, lng: 106.6912 },
      deliveryCoordinates: { lat: 10.7682, lng: 106.6912 },
      distanceKm: 2.2,
      shippingFee: order.deliveryFee || 20000,
      status: "broadcasting",
      notes: order.notes || "Đơn hàng mới từ ứng dụng ProLaundry",
    });
  } catch (err) {}

  successResponse(res, order, "Đặt lịch hẹn giặt là thành công", 201);
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

  let orders = await (LaundryOrder as any).find(query).sort({ createdAt: -1 });

  // Seed default orders if missing in database
  if (!userId && !phone && !status && !storeId) {
    const existingIds = new Set((orders || []).map((o: any) => o.id));
    let added = false;
    for (const sample of DEFAULT_LAUNDRY_ORDERS) {
      if (!existingIds.has(sample.id)) {
        try {
          await (LaundryOrder as any).create(sample);
          added = true;
        } catch (e) {}
      }
    }
    if (added) {
      orders = await (LaundryOrder as any).find(query).sort({ createdAt: -1 });
    }
    if (!orders || orders.length === 0) {
      orders = DEFAULT_LAUNDRY_ORDERS;
    }
  }

  successResponse(res, orders, "Lấy danh sách đơn hàng thành công");
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
  const actualSubtotal = updatedItems.reduce((sum: number, item: any) => {
    const qty =
      item.actualQuantity !== undefined && item.actualQuantity !== null
        ? Number(item.actualQuantity)
        : Number(item.quantity || item.estimatedQuantity || 0);
    const price = Number(item.unitPrice || 0);
    return sum + qty * price;
  }, 0);

  const deliveryFee = Number(order.deliveryFee ?? 20000);
  const discountAmount = Number(order.discountAmount ?? 0);
  const totalPrice = Math.max(0, actualSubtotal + deliveryFee - discountAmount);

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
    actualSubtotal,
    subtotal: actualSubtotal,
    totalPrice,
    actualWeighedAt: new Date().toISOString(),
  };

  if (weightConfirmStatus) payload.weightConfirmStatus = weightConfirmStatus;
  if (status) payload.status = status;
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
    "Đã cập nhật khối lượng thực tế và chi tiết dòng đồ thành công"
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
