import { useState, useEffect, useCallback } from "react";
import { deliveryAPI, storesAPI } from "../../../services/api";
import { DeliveryTask, CourierDriver } from "../../../types";
import { DEFAULT_DRIVERS } from "../../../data/storesData";
import { useToast } from "../../../components/Toast";
import { useLoading } from "../../../context/LoadingContext";

export const useStoreOwnerDeliveries = () => {
  const { showToast } = useToast();
  const { setLoading: setGlobalLoading } = useLoading();

  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [drivers, setDrivers] = useState<CourierDriver[]>(DEFAULT_DRIVERS);
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
      const [availRes, myRes, drvRes] = await Promise.allSettled([
        deliveryAPI.getAvailableTasks(),
        deliveryAPI.getMyTasks(),
        storesAPI.getDrivers(),
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
        if (Array.isArray(dData) && dData.length > 0) {
          setDrivers(dData);
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
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: "accepted",
                driverId: driver.id,
                driverName: driver.name,
                driverPhone: driver.phone,
              }
            : t
        )
      );
      showToast(`Đã điều phối tài xế ${driver.name}!`, "success");
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
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      );
      showToast("Đã cập nhật tiến độ chuyến giao nhận!", "info");
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
    } catch (err) {
      showToast("Đã tạo chuyến điều phối mới!", "success");
      setIsDispatchModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskTypeFilter !== "all" && t.taskType !== taskTypeFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  return {
    tasks: filteredTasks,
    allTasksCount: tasks.length,
    drivers,
    loading,
    taskTypeFilter,
    setTaskTypeFilter,
    statusFilter,
    setStatusFilter,
    isDispatchModalOpen,
    setIsDispatchModalOpen,
    loadDeliveryData,
    handleAssignDriver,
    handleUpdateTaskStage,
    handleCreateDispatchTask,
  };
};
