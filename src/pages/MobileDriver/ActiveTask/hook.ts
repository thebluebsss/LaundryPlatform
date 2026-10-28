import { useState, useEffect, useCallback, useMemo } from "react";
import { deliveryAPI } from "../../../services/api";
import { DeliveryTask } from "../../../types";
import { useToast } from "../../../components/Toast";

export const useMobileDriverActiveTask = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchActiveTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await deliveryAPI.getMyTasks();
      setTasks(res.data?.data?.tasks || []);
    } catch {
      showToast("Không thể tải chuyến đang thực hiện", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchActiveTasks();
  }, [fetchActiveTasks]);

  const handleAdvanceStatus = async (task: DeliveryTask, nextStatus: string) => {
    setUpdatingId(task.id);
    try {
      await deliveryAPI.updateTaskStatus({
        taskId: task.id,
        status: nextStatus,
      });

      if (nextStatus === "completed") {
        if (task.taskType === "pickup_from_customer") {
          showToast(
            `Đã bàn giao giỏ đồ #${task.orderId} cho Chủ cửa hàng cân thực tế!`,
            "success"
          );
        } else {
          showToast(
            `Đã giao trả đồ sạch #${task.orderId} cho khách hàng thành công!`,
            "success"
          );
        }
      } else {
        showToast("Đã cập nhật tiến độ chuyến đi!", "info");
      }

      await fetchActiveTasks();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Lỗi cập nhật trạng thái chuyến",
        "error"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const activeTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status !== "broadcasting" &&
          t.status !== "completed" &&
          t.status !== "cancelled"
      ),
    [tasks]
  );

  return {
    activeTasks,
    loading,
    updatingId,
    fetchActiveTasks,
    handleAdvanceStatus,
  };
};
