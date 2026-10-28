import { useState, useEffect, useCallback, useMemo } from "react";
import { deliveryAPI, reviewsAPI } from "../../../services/api";
import { DeliveryTask, OrderReview } from "../../../types";
import { useToast } from "../../../components/Toast";

export const useMobileDriverWallet = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [driverReviews, setDriverReviews] = useState<OrderReview[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWalletTasks = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, reviewsRes] = await Promise.allSettled([
        deliveryAPI.getMyTasks(),
        reviewsAPI.getAll(),
      ]);

      if (tasksRes.status === "fulfilled") {
        const rawTasks =
          tasksRes.value.data?.data?.tasks ||
          (Array.isArray(tasksRes.value.data?.data)
            ? tasksRes.value.data.data
            : []);
        setTasks(rawTasks);
      }

      if (reviewsRes.status === "fulfilled") {
        const rawReviews = reviewsRes.value.data?.data?.reviews || [];
        setDriverReviews(Array.isArray(rawReviews) ? rawReviews : []);
      }
    } catch {
      showToast("Không thể tải dữ liệu ví tài xế", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWalletTasks();
  }, [fetchWalletTasks]);

  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === "completed"),
    [tasks]
  );

  const stats = useMemo(() => {
    const totalShippingFee = completedTasks.reduce(
      (s, t) => s + (t.shippingFee || 0),
      0
    );
    const totalTips = completedTasks.reduce(
      (s, t) => s + (t.tipAmount || 0),
      0
    );
    const totalDistanceKm = Number(
      completedTasks
        .reduce((s, t) => s + (t.distanceKm || 0), 0)
        .toFixed(1)
    );
    const avgShipperRating =
      driverReviews.length > 0
        ? Number(
            (
              driverReviews.reduce(
                (s, r) => s + Number(r.shipperRating || 5),
                0
              ) / driverReviews.length
            ).toFixed(1)
          )
        : 5.0;

    return {
      completedCount: completedTasks.length,
      totalShippingFee,
      totalTips,
      totalEarnings: totalShippingFee + totalTips,
      totalDistanceKm,
      avgShipperRating,
      reviewCount: driverReviews.length,
    };
  }, [completedTasks, driverReviews]);

  return {
    completedTasks,
    driverReviews,
    stats,
    loading,
    fetchWalletTasks,
  };
};
