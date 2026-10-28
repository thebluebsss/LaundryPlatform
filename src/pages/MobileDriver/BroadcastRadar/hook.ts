import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { deliveryAPI, storesAPI } from "../../../services/api";
import { DeliveryTask, CourierDriver } from "../../../types";
import { useToast } from "../../../components/Toast";

export const useMobileDriverRadar = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [availableTasks, setAvailableTasks] = useState<DeliveryTask[]>([]);
  const [drivers, setDrivers] = useState<CourierDriver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<{
    id: string;
    name: string;
    phone: string;
  }>({
    id: "drv-1",
    name: "Nguyễn Văn Hùng",
    phone: "0903111222",
  });
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [taskTypeFilter, setTaskTypeFilter] = useState<
    "all" | "pickup_from_customer" | "deliver_to_customer"
  >("all");

  const fetchRadarData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, driversRes] = await Promise.all([
        deliveryAPI.getAvailableTasks(),
        storesAPI.getDrivers(),
      ]);
      setAvailableTasks(tasksRes.data?.data?.tasks || []);
      const driverList: CourierDriver[] =
        driversRes.data?.data?.drivers || [];
      setDrivers(driverList);
      if (driverList.length > 0 && selectedDriver.id === "drv-1") {
        setSelectedDriver({
          id: driverList[0].id,
          name: driverList[0].name,
          phone: driverList[0].phone,
        });
      }
    } catch {
      showToast("Không thể tải sàn chuyến phát sóng", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, selectedDriver.id]);

  useEffect(() => {
    fetchRadarData();
  }, [fetchRadarData]);

  const handleToggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    if (next) {
      try {
        await deliveryAPI.updateLocation({
          driverId: selectedDriver.id,
          lat: 10.7769,
          lng: 106.7009,
        });
      } catch {
        // non-blocking
      }
      showToast("Đã bật trực tuyến & cập nhật tọa độ GPS", "success");
    } else {
      showToast("Đã chuyển sang chế độ Tạm nghỉ", "info");
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    if (!isOnline) {
      showToast("Vui lòng bật Trực tuyến trước khi nhận chuyến", "warning");
      return;
    }
    setAcceptingId(taskId);
    try {
      await deliveryAPI.acceptTask({
        taskId,
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
        driverPhone: selectedDriver.phone,
      });
      showToast(
        "Đã nhận chuyến thành công! Chuyển sang màn hình điều hướng.",
        "success"
      );
      navigate("/mobile-driver/active-task");
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Chuyến này đã có tài xế khác nhận",
        "error"
      );
      await fetchRadarData();
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredTasks = availableTasks.filter((t) =>
    taskTypeFilter === "all" ? true : t.taskType === taskTypeFilter
  );

  return {
    tasks: filteredTasks,
    drivers,
    selectedDriver,
    setSelectedDriver,
    isOnline,
    handleToggleOnline,
    loading,
    acceptingId,
    taskTypeFilter,
    setTaskTypeFilter,
    fetchRadarData,
    handleAcceptTask,
  };
};
