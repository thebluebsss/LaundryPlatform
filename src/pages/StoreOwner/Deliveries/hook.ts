import { useState, useEffect, useCallback } from "react";
import { deliveryAPI, storesAPI, laundryOrdersAPI } from "../../../services/api";
import { DeliveryTask, CourierDriver, LaundryOrder } from "../../../types";
import { useToast } from "../../../components/Toast";
import { useLoading } from "../../../context/LoadingContext";

export const useStoreOwnerDeliveries = () => {
  const { showToast } = useToast();
  const { setLoading: setGlobalLoading } = useLoading();

  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [drivers, setDrivers] = useState<CourierDriver[]>([]);
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loading, setLoadingState] = useState<boolean>(true);
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);

  const setLoading = (val: boolean) => {
    setLoadingState(val);
    setGlobalLoading(val);
  };

  const loadDeliveryData = useCallback(async () => {
    setLoadingState(true);
    try {
      const [availRes, myRes, drvRes, ordRes] = await Promise.allSettled([
        deliveryAPI.getAvailableTasks(),
        deliveryAPI.getMyTasks(),
        storesAPI.getDrivers(),
        laundryOrdersAPI.getAll(),
      ]);

      const merged: DeliveryTask[] = [];
      if (availRes.status === "fulfilled") {
        const aData = availRes.value.data?.data || [];
        if (Array.isArray(aData)) merged.push(...aData);
      }
      if (myRes.status === "fulfilled") {
        const mData = myRes.value.data?.data || [];
        if (Array.isArray(mData)) {
          mData.forEach((t: DeliveryTask) => {
            if (!merged.some((existing) => existing.id === t.id)) {
              merged.push(t);
            }
          });
        }
      }

      setTasks(merged);

      if (drvRes.status === "fulfilled") {
        const dData = drvRes.value.data?.data || [];
        if (Array.isArray(dData)) {
          setDrivers(dData);
        }
      }

      if (ordRes.status === "fulfilled") {
        const oData = ordRes.value.data?.data || [];
        if (Array.isArray(oData)) {
          setOrders(oData);
        }
      }
    } catch (error) {
      console.error("Failed to load delivery tasks:", error);
    } finally {
      setLoadingState(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveryData();
  }, [loadDeliveryData]);

  const handleBroadcastOrder = async (
    order: LaundryOrder,
    taskType: "pickup_from_customer" | "deliver_to_customer"
  ) => {
    setLoading(true);
    try {
      const res = await deliveryAPI.broadcastTask({
        orderId: order.id,
        taskType,
        storeId: order.storeId || "store-hn-hoankiem",
        storeName: order.storeName || "Tiệm Giặt Sạch Sẽ Hoàn Kiếm",
        customerName: order.customerName,
        customerPhone: order.phoneNumber,
        customerAddress: `${order.address}, ${order.district}`,
        shippingFee: order.deliveryFee || 25000,
        notes:
          taskType === "deliver_to_customer"
            ? `Giao trả đồ sạch đã hoàn tất giặt đơn #${order.id} cho khách`
            : `Thu gom đồ bẩn đơn #${order.id} về tiệm`,
      });
      await laundryOrdersAPI.updateStatus(order.id, {
        status: taskType === "deliver_to_customer" ? "delivering" : "picking_up",
      });
      showToast(
        res.data?.message ||
          (taskType === "deliver_to_customer"
            ? `Đã phát sóng tìm Shipper giao trả đồ sạch đơn #${order.id} tới App Tài Xế!`
            : `Đã phát sóng tìm Shipper lấy đồ bẩn đơn #${order.id} tới App Tài Xế!`),
        "success"
      );
      await loadDeliveryData();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Không thể phát sóng chuyến giao nhận!",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (task: DeliveryTask, driver: CourierDriver) => {
    setLoading(true);
    try {
      await deliveryAPI.acceptTask({
        taskId: task.id,
        driverId: driver.id,
        driverName: driver.name,
        driverPhone: driver.phone,
      });
      showToast(
        `Đã gán chuyến #${task.id} cho tài xế ${driver.name} (${driver.phone})`,
        "success"
      );
      await loadDeliveryData();
    } catch {
      showToast(`Không thể điều phối tài xế ${driver.name}!`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStage = async (
    task: DeliveryTask,
    nextStatus: DeliveryTask["status"]
  ) => {
    setLoading(true);
    try {
      await deliveryAPI.updateTaskStatus({
        taskId: task.id,
        status: nextStatus,
      });
      showToast(`Đã cập nhật trạng thái chuyến #${task.id}`, "info");
      await loadDeliveryData();
    } catch {
      showToast("Không thể cập nhật tiến độ chuyến giao nhận!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDispatchTask = async (payload: any) => {
    setLoading(true);
    try {
      const res = await deliveryAPI.createTask(payload);
      const created = res.data?.data;
      if (created) {
        setTasks((prev) => [created, ...prev]);
      }
      showToast(
        "Đã phát sóng chuyến giao nhận mới tới ứng dụng Tài xế!",
        "success"
      );
      setIsDispatchModalOpen(false);
      await loadDeliveryData();
    } catch {
      showToast("Không thể tạo chuyến điều phối mới!", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskTypeFilter !== "all" && t.taskType !== taskTypeFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  // Orders waiting for pickup broadcast or clean-laundry delivery broadcast
  const ordersReadyForBroadcast = orders.filter((o) =>
    ["pending", "washing", "ironing", "delivering", "returning"].includes(
      o.status
    )
  );

  return {
    tasks: filteredTasks,
    allTasksCount: tasks.length,
    drivers,
    ordersReadyForBroadcast,
    loading,
    taskTypeFilter,
    setTaskTypeFilter,
    statusFilter,
    setStatusFilter,
    isDispatchModalOpen,
    setIsDispatchModalOpen,
    loadDeliveryData,
    handleBroadcastOrder,
    handleAssignDriver,
    handleUpdateTaskStage,
    handleCreateDispatchTask,
  };
};
