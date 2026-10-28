// @ts-nocheck
import { Request, Response } from "express";
import DeliveryTask from "../models/DeliveryTask";
import LaundryOrder from "../models/LaundryOrder";
import User from "../models/User";
import { DEFAULT_DRIVERS, DEFAULT_STORES } from "../../data/storesData";
import logger from "../utils/logger";

import mongoose from "mongoose";

/**
 * Lấy danh sách nhiệm vụ giao nhận đang chờ tài xế nhận (broadcasting)
 * @route GET /api/delivery/available-tasks
 */
export const getAvailableTasks = async (req: Request, res: Response) => {
  try {
    const { storeId, driverLat, driverLng } = req.query;

    const query: any = { status: "broadcasting" };
    if (storeId) {
      query.storeId = storeId;
    }

    let tasks = await DeliveryTask.find(query);

    // If no tasks exist in DB, provide sample live broadcast tasks
    if (!tasks || tasks.length === 0) {
      tasks = [
        {
          id: "task-live-1",
          orderId: "ORD-9821",
          taskType: "pickup_from_customer",
          storeId: "store-hcm-q1",
          storeName: "Tiệm Giặt Sấy Vô Trùng Q1 - Nguyễn Trãi",
          customerName: "Nguyễn Hoàng Nam",
          customerPhone: "0908 999 111",
          customerAddress: "45 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM",
          storeAddress: "185 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM",
          pickupCoordinates: { lat: 10.7769, lng: 106.7009 },
          deliveryCoordinates: { lat: 10.7682, lng: 106.6912 },
          distanceKm: 2.1,
          shippingFee: 25000,
          tipAmount: 5000,
          status: "broadcasting",
          notes: "Gom 3kg đồ vest và sơ mi, khách gửi ở lễ tân tòa nhà",
          createdAt: new Date().toISOString(),
        },
        {
          id: "task-live-2",
          orderId: "ORD-9825",
          taskType: "pickup_from_customer",
          storeId: "store-hcm-bt",
          storeName: "Tiệm Giặt Nhanh 24/7 Bình Thạnh - Đinh Bộ Lĩnh",
          customerName: "Trần Mai Anh",
          customerPhone: "0912 345 678",
          customerAddress: "Landmark 81, Vinhomes Central Park, Bình Thạnh",
          storeAddress: "240 Đinh Bộ Lĩnh, Phường 26, Quận Bình Thạnh",
          pickupCoordinates: { lat: 10.7951, lng: 106.7218 },
          deliveryCoordinates: { lat: 10.8031, lng: 106.7115 },
          distanceKm: 3.4,
          shippingFee: 30000,
          tipAmount: 10000,
          status: "broadcasting",
          notes: "Giặt drap nệm lớn, có thang máy",
          createdAt: new Date().toISOString(),
        },
      ];
    }

    res.json({
      success: true,
      total: tasks.length,
      data: tasks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách đơn chờ giao nhận",
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

    const assignedDriverName = driverName || "Tài xế ProLaundry";
    const assignedDriverPhone = driverPhone || "0911 222 333";
    const assignedDriverId = driverId || "drv-default";

    if (task) {
      if (task.status !== "broadcasting") {
        return res.status(400).json({
          success: false,
          message: "Đơn này đã được tài xế khác tiếp nhận",
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
    } else {
      // Create new accepted task record
      task = await DeliveryTask.create({
        id: taskId,
        orderId: taskId.replace("task-", "ORD-"),
        taskType: "pickup_from_customer",
        storeId: "store-hcm-q1",
        storeName: "Tiệm Giặt Sấy Vô Trùng Q1",
        driverId: assignedDriverId,
        driverName: assignedDriverName,
        driverPhone: assignedDriverPhone,
        customerName: "Khách hàng",
        customerPhone: "0908 123 456",
        customerAddress: "Địa chỉ nhận hàng",
        storeAddress: "185 Nguyễn Trãi, Quận 1",
        pickupCoordinates: { lat: 10.77, lng: 106.69 },
        deliveryCoordinates: { lat: 10.768, lng: 106.691 },
        distanceKm: 2.0,
        shippingFee: 25000,
        status: "accepted",
        acceptedAt: new Date().toISOString(),
      });
    }

    // Sync status with LaundryOrder if orderId exists
    if (task && task.orderId) {
      try {
        await LaundryOrder.findOneAndUpdate(
          { id: task.orderId },
          {
            status: "sorting",
            shipperId: assignedDriverId,
            shipperName: assignedDriverName,
            shipperPhone: assignedDriverPhone,
          }
        );
      } catch (e) {}
    }

    res.json({
      success: true,
      message: "Nhận đơn giao nhận thành công! Vui lòng di chuyển đến điểm lấy đồ.",
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
    const { taskId, status, notes } = req.body;

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
    if (status === "picked_up") updatePayload.pickedUpAt = new Date().toISOString();
    if (status === "completed") updatePayload.completedAt = new Date().toISOString();

    const updatedTask = await DeliveryTask.findOneAndUpdate(
      { id: task.id || taskId },
      updatePayload,
      { new: true }
    );

    // Sync order status
    if (task.orderId) {
      let orderStatus = "pending";
      if (status === "picked_up") orderStatus = "washing";
      if (status === "in_transit") orderStatus = "delivering";
      if (status === "completed") orderStatus = "completed";

      try {
        await LaundryOrder.findOneAndUpdate(
          { id: task.orderId },
          { status: orderStatus }
        );
      } catch (e) {}
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
 * Lấy danh sách nhiệm vụ của tài xế hiện tại
 * @route GET /api/delivery/my-tasks
 */
export const getMyTasks = async (req: Request, res: Response) => {
  try {
    const { driverId, status } = req.query;

    const query: any = {};
    if (driverId) query.driverId = driverId;
    if (status) query.status = status;

    let tasks = await DeliveryTask.find(query);

    if (!tasks || tasks.length === 0) {
      // Default sample task list for UI demo
      tasks = [
        {
          id: "task-my-1",
          orderId: "ORD-9801",
          taskType: "pickup_from_customer",
          storeId: "store-hcm-q1",
          storeName: "Tiệm Giặt Sấy Vô Trùng Q1",
          driverId: driverId || "drv-1",
          driverName: "Nguyễn Văn Hùng",
          driverPhone: "0911 222 333",
          customerName: "Lê Thu Hà",
          customerPhone: "0909 888 777",
          customerAddress: "125 Lê Lợi, Phường Bến Thành, Quận 1",
          storeAddress: "185 Nguyễn Trãi, Quận 1",
          distanceKm: 1.8,
          shippingFee: 25000,
          status: "in_transit",
          createdAt: new Date().toISOString(),
        },
      ];
    }

    res.json({
      success: true,
      total: tasks.length,
      data: tasks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách đơn của tài xế",
    });
  }
};

/**
 * Tài xế cập nhật tọa độ GPS trực tiếp
 * @route POST /api/delivery/update-location
 */
export const updateDriverLocation = async (req: Request, res: Response) => {
  try {
    const { driverId, lat, lng } = req.body;

    if (!driverId || lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp driverId, lat và lng",
      });
    }

    // Update in User model if driver exists
    try {
      await User.findByIdAndUpdate(driverId, {
        currentLocation: { lat, lng },
        lastLogin: new Date(),
      });
    } catch (e) {}

    res.json({
      success: true,
      message: "Cập nhật vị trí GPS tài xế thành công",
      data: { driverId, lat, lng, timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật tọa độ GPS",
    });
  }
};

/**
 * Chủ cửa hàng tạo chuyến điều phối giao/nhận mới
 * @route POST /api/delivery/create-task
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const taskId = body.id || "task-" + Math.floor(1000 + Math.random() * 9000);
    const newTask = await DeliveryTask.create({
      id: taskId,
      orderId: body.orderId || "ORD-" + Math.floor(1000 + Math.random() * 9000),
      taskType: body.taskType || "pickup_from_customer",
      storeId: body.storeId || "store-hcm-q1",
      storeName: body.storeName || "Tiệm Giặt Sấy Vô Trùng Q1",
      driverId: body.driverId || "",
      driverName: body.driverName || "",
      driverPhone: body.driverPhone || "",
      customerName: body.customerName || "Khách hàng",
      customerPhone: body.customerPhone || "0900000000",
      customerAddress: body.customerAddress || "Quận 1, TP.HCM",
      storeAddress: body.storeAddress || "185 Nguyễn Trãi, Quận 1, TP.HCM",
      pickupCoordinates: body.pickupCoordinates || { lat: 10.7769, lng: 106.7009 },
      deliveryCoordinates: body.deliveryCoordinates || { lat: 10.7682, lng: 106.6912 },
      distanceKm: Number(body.distanceKm || 2.5),
      shippingFee: Number(body.shippingFee || 20000),
      tipAmount: Number(body.tipAmount || 0),
      status: body.driverId ? "accepted" : "broadcasting",
      notes: body.notes || "",
      acceptedAt: body.driverId ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Đã khởi tạo chuyến giao nhận thành công",
      data: newTask,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tạo nhiệm vụ giao nhận",
    });
  }
};

