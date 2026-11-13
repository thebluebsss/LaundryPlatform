// @ts-nocheck
import { Request, Response } from "express";
import DeliveryTask from "../models/DeliveryTask";
import LaundryOrder from "../models/LaundryOrder";
import User from "../models/User";
import mongoose from "mongoose";
import { realtimeHub } from "../services/realtimeHub";

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

const computeHaversineKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Number(
    (6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2)
  );
};

/**
 * Lấy danh sách nhiệm vụ giao nhận đang chờ tài xế nhận (broadcasting)
 * - Chiều khách đặt đơn (pickup_from_customer): khoảng cách Haversine giữa tọa độ khách đặt đơn (customerCoordinates) và tọa độ tài xế (driverGps) <= 1km
 * - Chiều cửa hàng trả đồ cho khách (deliver_to_customer): khoảng cách Haversine giữa tọa độ cửa hàng (storeCoordinates) và tọa độ tài xế (driverGps) <= 1km
 * - Tự động dọn dẹp các nhiệm vụ mồ côi / đã hoàn thành / đã hủy hoặc tài xế đã bỏ qua (20s timeout / dấu X)
 * @route GET /api/delivery/available-tasks
 */
export const getAvailableTasks = async (req: Request, res: Response) => {
  try {
    const { storeId, driverId, driverLat, driverLng, radiusKm } = req.query;
    const maxRadiusKm = Number(radiusKm) > 0 ? Number(radiusKm) : 1.0;

    const query: any = {};
    if (storeId) {
      query.storeId = storeId;
    }

    const allTasks = (await DeliveryTask.find(query).sort({ createdAt: -1 })) || [];
    const rawBroadcastingTasks = allTasks.filter(
      (t: any) => t.status === "broadcasting"
    );

    // Track which (orderId + taskType) already have an accepted / in_transit / completed task
    const progressedStageSet = new Set<string>();
    allTasks.forEach((t: any) => {
      if (
        t.orderId &&
        [
          "accepted",
          "picking_up",
          "arrived_pickup",
          "picked_up",
          "in_transit",
          "completed",
        ].includes(t.status)
      ) {
        progressedStageSet.add(`${t.orderId}_${t.taskType}`);
      }
    });

    // Check linked LaundryOrders to filter out any task whose order was cancelled, completed, deleted, or moved past stage
    const allOrders = (await LaundryOrder.find({})) || [];
    const orderMap: Record<string, any> = {};
    allOrders.forEach((o: any) => {
      const ordId = o?.id || o?._id?.toString();
      if (ordId) {
        orderMap[ordId] = o;
      }
    });

    // Driver identifiers to check against rejectedDriverIds
    const driverIdentifiers = String(driverId || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const seenBroadcastStage = new Set<string>();
    const activeRawTasks: any[] = [];

    for (const t of rawBroadcastingTasks) {
      const obj = typeof t.toObject === "function" ? t.toObject() : { ...t };
      const stageKey = `${obj.orderId}_${obj.taskType}`;
      const parentOrder = obj.orderId ? orderMap[obj.orderId] : null;
      const parentStatus = parentOrder?.status;

      // Determine if this broadcasting task is stale/orphan
      const isPickupTask = obj.taskType !== "deliver_to_customer";
      const isStalePickup =
        isPickupTask && parentStatus && parentStatus !== "pending";
      const isStaleDelivery =
        !isPickupTask &&
        parentStatus &&
        !["washing", "ironing", "delivering", "returning"].includes(
          parentStatus
        );
      const isAlreadyProgressed = progressedStageSet.has(stageKey);
      const isDuplicateBroadcast = seenBroadcastStage.has(stageKey);

      if (
        !parentOrder ||
        parentStatus === "cancelled" ||
        parentStatus === "completed" ||
        isStalePickup ||
        isStaleDelivery ||
        isAlreadyProgressed ||
        isDuplicateBroadcast
      ) {
        try {
          await DeliveryTask.findOneAndUpdate(
            { id: obj.id },
            { status: "cancelled" }
          );
        } catch (e) {}
        continue;
      }

      seenBroadcastStage.add(stageKey);

      // If driverId is provided and this driver already timed out (20s) or rejected this task, exclude it permanently
      if (driverIdentifiers.length > 0 && Array.isArray(obj.rejectedDriverIds)) {
        const isRejectedByDriver = obj.rejectedDriverIds.some((rid: string) =>
          driverIdentifiers.includes(String(rid))
        );
        if (isRejectedByDriver) {
          continue;
        }
      }

      activeRawTasks.push(obj);
    }

    const hasDriverGps =
      driverLat !== undefined &&
      driverLng !== undefined &&
      !Number.isNaN(Number(driverLat)) &&
      !Number.isNaN(Number(driverLng));

    const dLatNum = hasDriverGps ? Number(driverLat) : 21.0285;
    const dLngNum = hasDriverGps ? Number(driverLng) : 105.8542;

    const enrichedTasks = activeRawTasks.map((obj: any) => {
      const isDeliverToCustomer = obj.taskType === "deliver_to_customer";

      // Customer coordinates
      const customerCoord =
        obj.customerCoordinates &&
        typeof obj.customerCoordinates.lat === "number" &&
        typeof obj.customerCoordinates.lng === "number"
          ? obj.customerCoordinates
          : isDeliverToCustomer
            ? obj.deliveryCoordinates || { lat: 21.0285, lng: 105.8542 }
            : obj.pickupCoordinates || { lat: 21.0285, lng: 105.8542 };

      // Store coordinates
      const storeCoord =
        obj.storeCoordinates &&
        typeof obj.storeCoordinates.lat === "number" &&
        typeof obj.storeCoordinates.lng === "number"
          ? obj.storeCoordinates
          : isDeliverToCustomer
            ? obj.pickupCoordinates || { lat: 21.0285, lng: 105.8542 }
            : obj.deliveryCoordinates || { lat: 21.0285, lng: 105.8542 };

      const pickupCoord = isDeliverToCustomer ? storeCoord : customerCoord;
      const deliveryCoord = isDeliverToCustomer ? customerCoord : storeCoord;

      // Distance from Customer to Driver
      const customerToDriverKm = computeHaversineKm(
        dLatNum,
        dLngNum,
        Number(customerCoord.lat),
        Number(customerCoord.lng)
      );

      // Distance from Store to Driver
      const storeToDriverKm = computeHaversineKm(
        dLatNum,
        dLngNum,
        Number(storeCoord.lat),
        Number(storeCoord.lng)
      );

      // Dispatch radius distance depends on direction:
      // - pickup_from_customer: distance between Customer and Driver
      // - deliver_to_customer: distance between Store and Driver
      const dispatchDistanceKm = isDeliverToCustomer
        ? storeToDriverKm
        : customerToDriverKm;

      // Route distance between Pickup and Dropoff
      const routeDistanceKm = computeHaversineKm(
        Number(pickupCoord.lat),
        Number(pickupCoord.lng),
        Number(deliveryCoord.lat),
        Number(deliveryCoord.lng)
      );

      const parentOrder = obj.orderId ? orderMap[obj.orderId] : null;

      return {
        ...obj,
        customerCoordinates: customerCoord,
        storeCoordinates: storeCoord,
        pickupCoordinates: pickupCoord,
        deliveryCoordinates: deliveryCoord,
        distanceKm:
          routeDistanceKm > 0 ? routeDistanceKm : Number(obj.distanceKm || 1.2),
        pickupAddress:
          obj.pickupAddress ||
          (isDeliverToCustomer ? obj.storeAddress : obj.customerAddress),
        deliveryAddress:
          obj.deliveryAddress ||
          (isDeliverToCustomer ? obj.customerAddress : obj.storeAddress),
        pickupDate: obj.pickupDate || parentOrder?.pickupDate || "",
        pickupTime:
          obj.pickupTime || parentOrder?.pickupTime || "09:00 - 11:00",
        deliveryDate: obj.deliveryDate || parentOrder?.deliveryDate || "",
        deliveryTime:
          obj.deliveryTime || parentOrder?.deliveryTime || "16:00 - 18:00",
        broadcastRadiusKm: maxRadiusKm,
        customerToDriverKm,
        storeToDriverKm,
        driverToPickupKm: dispatchDistanceKm,
      };
    });

    // When called from Shipper App with driverLat & driverLng, strictly filter by dispatchDistanceKm <= maxRadiusKm (1km)
    const finalTasks = hasDriverGps
      ? enrichedTasks.filter((t: any) => t.driverToPickupKm <= maxRadiusKm)
      : enrichedTasks;

    res.json({
      success: true,
      radiusKm: maxRadiusKm,
      total: finalTasks.length,
      data: finalTasks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách đơn chờ giao nhận",
    });
  }
};

/**
 * Tài xế từ chối hoặc hết 20s nhận đơn -> Lưu driverId vào rejectedDriverIds để không bao giờ hiện lại cho tài xế này
 * @route POST /api/delivery/reject-task
 */
export const rejectTask = async (req: Request, res: Response) => {
  try {
    const { taskId, orderId, driverId, reason } = req.body;
    if (!taskId || !driverId) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp taskId và driverId",
      });
    }

    const driverIdentifiers = String(driverId)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let task: any = await DeliveryTask.findOne({ id: taskId });
    if (!task && mongoose.Types.ObjectId.isValid(taskId)) {
      task = await DeliveryTask.findById(taskId);
    }

    const targetOrderId = orderId || task?.orderId;

    // Update all broadcasting tasks matching this taskId or orderId
    const relatedTasks = await DeliveryTask.find(
      targetOrderId
        ? { $or: [{ id: taskId }, { orderId: targetOrderId }] }
        : { id: taskId }
    );

    if (Array.isArray(relatedTasks) && relatedTasks.length > 0) {
      for (const rt of relatedTasks) {
        const existingRejected: string[] = Array.isArray(rt.rejectedDriverIds)
          ? [...rt.rejectedDriverIds]
          : [];
        for (const dId of driverIdentifiers) {
          if (!existingRejected.includes(dId)) {
            existingRejected.push(dId);
          }
        }
        task = await DeliveryTask.findOneAndUpdate(
          { id: rt.id },
          { rejectedDriverIds: existingRejected },
          { new: true }
        );
      }
    }

    res.json({
      success: true,
      message:
        reason === "timeout"
          ? "Đã hết 20s nhận chuyến — Đơn đã chuyển sang phát sóng cho tài xế khác"
          : "Đã từ chối chuyến — Đơn đã chuyển sang phát sóng cho tài xế khác",
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi bỏ qua nhiệm vụ giao nhận",
    });
  }
};

/**
 * Tài xế nhận đơn giao nhận (Accept task)
 * @route POST /api/delivery/accept-task
 */
export const acceptTask = async (req: Request, res: Response) => {
  try {
    const { taskId, driverId, driverName, driverPhone } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mã nhiệm vụ (taskId)",
      });
    }

    let task = await DeliveryTask.findOne({ id: taskId });
    if (!task && mongoose.Types.ObjectId.isValid(taskId)) {
      task = await DeliveryTask.findById(taskId);
    }

    const assignedDriverName = driverName || "Tài xế Sạch Sẽ";
    const assignedDriverPhone = driverPhone || "0911222333";
    const assignedDriverId = driverId || "drv-1";

    if (task) {
      if (task.status !== "broadcasting") {
        return res.status(409).json({
          success: false,
          message: "Đơn này đã được tài xế khác tiếp nhận hoặc đã bị hủy",
        });
      }

      task = await DeliveryTask.findOneAndUpdate(
        { id: task.id || taskId },
        {
          status: "accepted",
          driverId: assignedDriverId,
          driverName: assignedDriverName,
          driverPhone: assignedDriverPhone,
          acceptedAt: new Date().toISOString(),
        },
        { new: true }
      );

      // Cancel any duplicate broadcasting tasks for the same orderId + taskType
      if (task?.orderId) {
        try {
          const otherBroadcasts = await DeliveryTask.find({
            orderId: task.orderId,
            taskType: task.taskType,
            status: "broadcasting",
          });
          for (const ob of otherBroadcasts || []) {
            if (ob.id !== task.id) {
              await DeliveryTask.findOneAndUpdate(
                { id: ob.id },
                { status: "cancelled" }
              );
            }
          }
        } catch (e) {}
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhiệm vụ giao nhận này",
      });
    }

    if (task && task.orderId) {
      const nextOrderStatus =
        task.taskType === "deliver_to_customer" ? "delivering" : "picking_up";
      const initialDriverLoc = task.pickupCoordinates
        ? {
            lat: Number((Number(task.pickupCoordinates.lat) - 0.0025).toFixed(6)),
            lng: Number((Number(task.pickupCoordinates.lng) - 0.0022).toFixed(6)),
            heading: 45,
            speedKmh: 26,
            updatedAt: new Date().toISOString(),
            driverId: assignedDriverId,
            driverName: assignedDriverName,
          }
        : undefined;
      try {
        const updatedOrd = await LaundryOrder.findOneAndUpdate(
          { id: task.orderId },
          {
            status: nextOrderStatus,
            shipperId: assignedDriverId,
            shipperName: assignedDriverName,
            shipperPhone: assignedDriverPhone,
            ...(initialDriverLoc ? { driverLocation: initialDriverLoc } : {}),
          },
          { new: true }
        );
        if (updatedOrd) {
          realtimeHub.broadcast("ORDER_UPDATED", updatedOrd, task.orderId);
          if (initialDriverLoc) {
            realtimeHub.broadcast(
              "DRIVER_GPS_UPDATED",
              { orderId: task.orderId, driverLocation: initialDriverLoc },
              task.orderId
            );
          }
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      message:
        "Nhận đơn giao nhận thành công! Vui lòng di chuyển đến điểm lấy đồ.",
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi nhận đơn giao hàng",
    });
  }
};

/**
 * Cập nhật tiến trình của tài xế (arrived_pickup, picked_up, in_transit, completed)
 * @route PATCH /api/delivery/task-status
 */
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { taskId, status, notes, codCollected } = req.body;

    let task = await DeliveryTask.findOne({ id: taskId });
    if (!task && mongoose.Types.ObjectId.isValid(taskId)) {
      task = await DeliveryTask.findById(taskId);
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhiệm vụ giao nhận",
      });
    }

    const updatePayload: any = { status };
    if (notes) updatePayload.notes = notes;
    if (status === "picked_up")
      updatePayload.pickedUpAt = new Date().toISOString();
    if (status === "completed")
      updatePayload.completedAt = new Date().toISOString();

    const updatedTask = await DeliveryTask.findOneAndUpdate(
      { id: task.id || taskId },
      updatePayload,
      { new: true }
    );

    // If completed, also ensure no lingering broadcasting tasks remain for the same orderId + taskType
    if (status === "completed" && task.orderId) {
      try {
        const lingering = await DeliveryTask.find({
          orderId: task.orderId,
          taskType: task.taskType,
          status: "broadcasting",
        });
        for (const lt of lingering || []) {
          await DeliveryTask.findOneAndUpdate(
            { id: lt.id },
            { status: "cancelled" }
          );
        }
      } catch (e) {}
    }

    if (task.orderId) {
      const isPickupTask = task.taskType !== "deliver_to_customer";
      const orderUpdate: any = {};

      if (isPickupTask) {
        if (
          status === "arrived_pickup" ||
          status === "picked_up" ||
          status === "in_transit"
        ) {
          orderUpdate.status = "picking_up";
        } else if (status === "completed") {
          orderUpdate.status = "sorting";
        }
      } else {
        if (
          status === "arrived_pickup" ||
          status === "picked_up" ||
          status === "in_transit"
        ) {
          orderUpdate.status = "delivering";
        } else if (status === "completed") {
          orderUpdate.status = "completed";
          orderUpdate.completedAt = new Date().toISOString();
          if (codCollected) {
            orderUpdate.paymentStatus = "paid";
            orderUpdate.paidAt = new Date().toISOString();
          }
        }
      }

      if (Object.keys(orderUpdate).length > 0) {
        try {
          const existingOrder = await LaundryOrder.findOne({ id: task.orderId });
          if (
            !isPickupTask &&
            status === "completed" &&
            existingOrder &&
            existingOrder.paymentMethod === "cod"
          ) {
            orderUpdate.paymentStatus = "paid";
            orderUpdate.paidAt = new Date().toISOString();
          }
          const updatedOrd = await LaundryOrder.findOneAndUpdate(
            { id: task.orderId },
            orderUpdate,
            { new: true }
          );
          if (updatedOrd) {
            realtimeHub.broadcast("ORDER_UPDATED", updatedOrd, task.orderId);
          }
        } catch (e) {}
      }
    }

    res.json({
      success: true,
      message: `Cập nhật trạng thái nhiệm vụ: ${status} thành công`,
      data: updatedTask,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật trạng thái nhiệm vụ",
    });
  }
};

/**
 * Lấy danh sách nhiệm vụ của tài xế hiện tại (dùng cho Đang Giao, Ví Thu Nhập và Doanh thu trên Sàn Chuyến)
 * @route GET /api/delivery/my-tasks
 */
export const getMyTasks = async (req: Request, res: Response) => {
  try {
    const { driverId, status } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const allTasks = (await DeliveryTask.find(query).sort({ createdAt: -1 })) || [];
    const allOrders = (await LaundryOrder.find({})) || [];
    const orderMap: Record<string, any> = {};
    allOrders.forEach((o: any) => {
      const ordId = o?.id || o?._id?.toString();
      if (ordId) orderMap[ordId] = o;
    });

    const attachOrderSchedule = (list: any[]) =>
      list.map((t: any) => {
        const obj = typeof t.toObject === "function" ? t.toObject() : { ...t };
        const parentOrder = obj.orderId ? orderMap[obj.orderId] : null;
        return {
          ...obj,
          pickupDate: obj.pickupDate || parentOrder?.pickupDate || "",
          pickupTime:
            obj.pickupTime || parentOrder?.pickupTime || "09:00 - 11:00",
          deliveryDate: obj.deliveryDate || parentOrder?.deliveryDate || "",
          deliveryTime:
            obj.deliveryTime || parentOrder?.deliveryTime || "16:00 - 18:00",
        };
      });

    if (!driverId) {
      const enrichedAll = attachOrderSchedule(allTasks);
      return res.json({
        success: true,
        total: enrichedAll.length,
        data: enrichedAll,
      });
    }

    const driverIdentifiers = String(driverId)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const matchedTasks = allTasks.filter((t: any) => {
      if (t.status === "broadcasting") return false;
      const tDriverId = String(t.driverId || "").trim().toLowerCase();
      const tDriverPhone = String(t.driverPhone || "").trim().toLowerCase();
      const tDriverName = String(t.driverName || "").trim().toLowerCase();
      return (
        driverIdentifiers.includes(tDriverId) ||
        driverIdentifiers.includes(tDriverPhone) ||
        driverIdentifiers.includes(tDriverName)
      );
    });

    // Fallback: if all non-broadcasting tasks were accepted under default driver ID ("drv-1" / "driver"), return them so the driver sees their full revenue
    const nonBroadcastingAll = allTasks.filter(
      (t: any) => t.status !== "broadcasting" && t.status !== "cancelled"
    );
    const finalTasks = attachOrderSchedule(
      matchedTasks.length > 0 ? matchedTasks : nonBroadcastingAll
    );

    res.json({
      success: true,
      total: finalTasks.length,
      data: finalTasks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách đơn của tài xế",
    });
  }
};

/**
 * Tài xế cập nhật tọa độ GPS trực tiếp & phát sóng thời gian thực tới Khách hàng và Chủ tiệm
 * @route POST /api/delivery/update-location
 */
export const updateDriverLocation = async (req: Request, res: Response) => {
  try {
    const { driverId, driverName, orderId, taskId, lat, lng, heading, speedKmh } =
      req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp tọa độ lat và lng",
      });
    }

    const liveLocation = {
      lat: Number(Number(lat).toFixed(6)),
      lng: Number(Number(lng).toFixed(6)),
      heading: heading !== undefined ? Number(heading) : 0,
      speedKmh: speedKmh !== undefined ? Number(speedKmh) : 28,
      updatedAt: new Date().toISOString(),
      driverId: driverId || "drv-live",
      driverName: driverName || "Tài xế Sạch Sẽ",
    };

    try {
      if (driverId) {
        await User.findByIdAndUpdate(driverId, {
          currentLocation: { lat: liveLocation.lat, lng: liveLocation.lng },
          lastLogin: new Date(),
        });
      }
    } catch (e) {}

    // Update active DeliveryTask(s) and linked LaundryOrder(s)
    const updatedOrderIds = new Set<string>();
    if (orderId) {
      updatedOrderIds.add(String(orderId));
    }

    try {
      const allTasks = (await DeliveryTask.find({})) || [];
      for (const t of allTasks) {
        const isActive =
          t.status !== "broadcasting" &&
          t.status !== "completed" &&
          t.status !== "cancelled";
        if (!isActive) continue;

        const matchesTask =
          (taskId && t.id === taskId) ||
          (orderId && t.orderId === orderId) ||
          (driverId && String(t.driverId) === String(driverId));

        if (matchesTask) {
          await DeliveryTask.findOneAndUpdate(
            { id: t.id },
            { driverLocation: liveLocation }
          );
          if (t.orderId) {
            updatedOrderIds.add(String(t.orderId));
          }
        }
      }

      for (const ordId of updatedOrderIds) {
        await LaundryOrder.findOneAndUpdate(
          { id: ordId },
          { driverLocation: liveLocation }
        );
        realtimeHub.broadcast(
          "DRIVER_GPS_UPDATED",
          {
            orderId: ordId,
            driverLocation: liveLocation,
          },
          ordId
        );
      }
    } catch (e) {}

    res.json({
      success: true,
      message: "Cập nhật vị trí Live GPS tài xế thành công",
      data: {
        driverId: liveLocation.driverId,
        lat: liveLocation.lat,
        lng: liveLocation.lng,
        speedKmh: liveLocation.speedKmh,
        updatedOrders: Array.from(updatedOrderIds),
        timestamp: liveLocation.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật tọa độ GPS",
    });
  }
};

/**
 * Chủ cửa hàng tạo chuyến điều phối giao/nhận mới (Broadcast hoặc chỉ định trực tiếp)
 * @route POST /api/delivery/create-task
 * @route POST /api/delivery/broadcast
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const taskId = body.id || "task-" + Math.floor(1000 + Math.random() * 9000);
    const taskType = body.taskType || "pickup_from_customer";

    let availableDriversCount = 1;
    try {
      const dbDrivers = await User.find({ role: "driver" });
      if (dbDrivers && dbDrivers.length > 0) {
        availableDriversCount = dbDrivers.length;
      }
    } catch (e) {}

    // Look up linked LaundryOrder & Store so we always use exact real coordinates
    let linkedOrder: any = null;
    if (body.orderId) {
      try {
        linkedOrder = await LaundryOrder.findOne({ id: body.orderId });
      } catch (e) {}
    }

    const resolvedStoreId =
      body.storeId || linkedOrder?.storeId || "store-hn-hoankiem";
    let storeDoc: any = null;
    try {
      const Store = (await import("../models/Store")).default;
      storeDoc = await (Store as any).findOne({
        $or: [{ customId: resolvedStoreId }, { id: resolvedStoreId }],
      });
    } catch (e) {}

    const orderDistrict =
      linkedOrder?.district || body.district || "Quận Hoàn Kiếm";
    const fallbackDistrictCoord = HANOI_DISTRICT_COORDS[orderDistrict] || {
      lat: 21.0285,
      lng: 105.8542,
    };

    const customerCoords =
      body.customerCoordinates?.lat && body.customerCoordinates?.lng
        ? {
            lat: Number(body.customerCoordinates.lat),
            lng: Number(body.customerCoordinates.lng),
          }
        : linkedOrder?.customerCoordinates?.lat &&
            linkedOrder?.customerCoordinates?.lng
          ? {
              lat: Number(linkedOrder.customerCoordinates.lat),
              lng: Number(linkedOrder.customerCoordinates.lng),
            }
          : body.pickupCoordinates?.lat &&
              body.pickupCoordinates?.lng &&
              taskType === "pickup_from_customer"
            ? {
                lat: Number(body.pickupCoordinates.lat),
                lng: Number(body.pickupCoordinates.lng),
              }
            : fallbackDistrictCoord;

    const storeCoords =
      storeDoc?.lat && storeDoc?.lng
        ? { lat: Number(storeDoc.lat), lng: Number(storeDoc.lng) }
        : body.deliveryCoordinates?.lat &&
            body.deliveryCoordinates?.lng &&
            taskType === "pickup_from_customer"
          ? {
              lat: Number(body.deliveryCoordinates.lat),
              lng: Number(body.deliveryCoordinates.lng),
            }
          : {
              lat: Number((customerCoords.lat + 0.008).toFixed(6)),
              lng: Number((customerCoords.lng + 0.006).toFixed(6)),
            };

    const pickupCoords =
      taskType === "deliver_to_customer" ? storeCoords : customerCoords;
    const deliveryCoords =
      taskType === "deliver_to_customer" ? customerCoords : storeCoords;

    const resolvedCustomerAddress =
      body.customerAddress ||
      (linkedOrder
        ? `${linkedOrder.address}, ${linkedOrder.district}, TP. Hà Nội`
        : "Quận Hoàn Kiếm, TP. Hà Nội");
    const resolvedStoreAddress =
      body.storeAddress ||
      storeDoc?.address ||
      `${body.storeName || linkedOrder?.storeName || "Tiệm Giặt Sạch Sẽ"}, TP. Hà Nội`;

    const pickupAddress =
      taskType === "deliver_to_customer"
        ? resolvedStoreAddress
        : resolvedCustomerAddress;
    const deliveryAddress =
      taskType === "deliver_to_customer"
        ? resolvedCustomerAddress
        : resolvedStoreAddress;

    const computedRouteKm = Math.max(
      0.15,
      computeHaversineKm(
        pickupCoords.lat,
        pickupCoords.lng,
        deliveryCoords.lat,
        deliveryCoords.lng
      )
    );

    // Avoid duplicate broadcasting task for the same orderId + taskType
    if (body.orderId && !body.driverId) {
      const existingBroadcast = await DeliveryTask.findOne({
        orderId: body.orderId,
        taskType,
        status: "broadcasting",
      });
      if (existingBroadcast) {
        const refreshed = await DeliveryTask.findOneAndUpdate(
          { id: existingBroadcast.id },
          {
            customerCoordinates: customerCoords,
            storeCoordinates: storeCoords,
            pickupCoordinates: pickupCoords,
            deliveryCoordinates: deliveryCoords,
            customerAddress: resolvedCustomerAddress,
            storeAddress: resolvedStoreAddress,
            pickupAddress,
            deliveryAddress,
            distanceKm: computedRouteKm,
            shippingFee: Number(
              body.shippingFee || existingBroadcast.shippingFee || 25000
            ),
            pickupDate:
              body.pickupDate ||
              linkedOrder?.pickupDate ||
              existingBroadcast.pickupDate ||
              "",
            pickupTime:
              body.pickupTime ||
              linkedOrder?.pickupTime ||
              existingBroadcast.pickupTime ||
              "09:00 - 11:00",
            deliveryDate:
              body.deliveryDate ||
              linkedOrder?.deliveryDate ||
              existingBroadcast.deliveryDate ||
              "",
            deliveryTime:
              body.deliveryTime ||
              linkedOrder?.deliveryTime ||
              existingBroadcast.deliveryTime ||
              "16:00 - 18:00",
            rejectedDriverIds: [],
            notes: body.notes || existingBroadcast.notes,
            createdAt: new Date().toISOString(),
          },
          { new: true }
        );
        return res.status(200).json({
          success: true,
          message:
            taskType === "deliver_to_customer"
              ? `Đã phát lại sóng đơn #${body.orderId} trong bán kính 1km quanh cửa hàng để giao trả đồ sạch!`
              : `Đã phát lại sóng đơn #${body.orderId} trong bán kính 1km quanh vị trí khách!`,
          availableDriversCount,
          data: refreshed,
        });
      }
    }

    const newTask = await DeliveryTask.create({
      id: taskId,
      orderId:
        body.orderId || "ORD-" + Math.floor(1000 + Math.random() * 9000),
      taskType,
      storeId: resolvedStoreId,
      storeName:
        body.storeName ||
        linkedOrder?.storeName ||
        storeDoc?.name ||
        "Tiệm Giặt Sạch Sẽ Hoàn Kiếm",
      driverId: body.driverId || "",
      driverName: body.driverName || "",
      driverPhone: body.driverPhone || "",
      customerName:
        body.customerName || linkedOrder?.customerName || "Khách hàng",
      customerPhone:
        body.customerPhone || linkedOrder?.phoneNumber || "0900000000",
      customerAddress: resolvedCustomerAddress,
      storeAddress: resolvedStoreAddress,
      pickupAddress,
      deliveryAddress,
      customerCoordinates: customerCoords,
      storeCoordinates: storeCoords,
      pickupCoordinates: pickupCoords,
      deliveryCoordinates: deliveryCoords,
      broadcastRadiusKm: 1.0,
      distanceKm: computedRouteKm,
      shippingFee: Number(body.shippingFee || 25000),
      tipAmount: Number(body.tipAmount || 0),
      paymentMethod: body.paymentMethod || linkedOrder?.paymentMethod || "cod",
      pickupDate: body.pickupDate || linkedOrder?.pickupDate || "",
      pickupTime:
        body.pickupTime || linkedOrder?.pickupTime || "09:00 - 11:00",
      deliveryDate: body.deliveryDate || linkedOrder?.deliveryDate || "",
      deliveryTime:
        body.deliveryTime || linkedOrder?.deliveryTime || "16:00 - 18:00",
      rejectedDriverIds: [],
      status: body.driverId ? "accepted" : "broadcasting",
      notes: body.notes || "",
      acceptedAt: body.driverId ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    });

    if (body.orderId) {
      const orderUpdate: any = {};
      if (body.driverId) {
        orderUpdate.shipperId = body.driverId;
        orderUpdate.shipperName = body.driverName || "Tài xế";
        orderUpdate.shipperPhone = body.driverPhone || "";
        orderUpdate.status =
          taskType === "deliver_to_customer" ? "delivering" : "picking_up";
      }
      if (Object.keys(orderUpdate).length > 0) {
        try {
          await LaundryOrder.findOneAndUpdate({ id: body.orderId }, orderUpdate);
        } catch (e) {}
      }
    }

    res.status(201).json({
      success: true,
      message: body.driverId
        ? `Đã gán chuyến giao nhận cho tài xế ${body.driverName}`
        : `Đã phát sóng chuyến giao nhận trong bán kính 1km!`,
      availableDriversCount,
      data: newTask,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tạo nhiệm vụ giao nhận",
    });
  }
};
