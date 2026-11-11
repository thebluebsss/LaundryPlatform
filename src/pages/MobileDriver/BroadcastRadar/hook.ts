import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { deliveryAPI, storesAPI, reviewsAPI } from "../../../services/api";
import { DeliveryTask, CourierDriver } from "../../../types";
import { useToast } from "../../../components/Toast";
import {
  getScopedToken,
  getScopedProfile,
  clearScopedSession,
} from "../../../utils/authStorage";

const computeHaversineKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Number(
    (6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2),
  );
};

const GLOBAL_SKIPPED_STORAGE_KEY = "sachse_driver_skipped_tasks_v2";
const SAVED_DRIVER_GPS_KEY = "sachse_driver_last_gps";
const SAVED_DRIVER_ONLINE_KEY = "sachse_driver_is_online";

const useMobileDriverRadarInternal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [availableTasks, setAvailableTasks] = useState<DeliveryTask[]>([]);
  const [myTasks, setMyTasks] = useState<DeliveryTask[]>([]);
  const [drivers, setDrivers] = useState<CourierDriver[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [reviewCount, setReviewCount] = useState<number>(0);

  const [selectedDriver, setSelectedDriver] = useState<{
    id: string;
    username?: string;
    name: string;
    phone: string;
    vehiclePlate?: string;
  }>(() => {
    const parsed = getScopedProfile("driver");
    if (parsed) {
      return {
        id: parsed.id || parsed._id || parsed.username || "drv-1",
        username: parsed.username || "driver",
        name: parsed.fullName || parsed.username || "Nguyễn Văn Hùng",
        phone: parsed.phone || "0911222333",
        vehiclePlate:
          parsed.vehiclePlate || parsed.licensePlate || "29-B1 888.99",
      };
    }
    return {
      id: "drv-1",
      username: "driver",
      name: "Nguyễn Văn Hùng",
      phone: "0911222333",
      vehiclePlate: "29-B1 888.99",
    };
  });

  // Sync driver profile whenever route changes (e.g. after logging in on /mobile-driver/login)
  useEffect(() => {
    const parsed = getScopedProfile("driver");
    if (parsed) {
      const nextId = parsed.id || parsed._id || parsed.username || "drv-1";
      setSelectedDriver((prev) => {
        if (
          prev.id === nextId &&
          prev.username === (parsed.username || "driver") &&
          prev.phone === (parsed.phone || "0911222333")
        ) {
          return prev;
        }
        return {
          id: nextId,
          username: parsed.username || "driver",
          name: parsed.fullName || parsed.username || "Nguyễn Văn Hùng",
          phone: parsed.phone || "0911222333",
          vehiclePlate:
            parsed.vehiclePlate || parsed.licensePlate || "29-B1 888.99",
        };
      });
    }
  }, [location.pathname]);

  const driverStorageKey = `sachse_skipped_tasks_${selectedDriver.id}`;

  const [skippedTaskIds, setSkippedTaskIds] = useState<string[]>(() => {
    try {
      const globalSaved = localStorage.getItem(GLOBAL_SKIPPED_STORAGE_KEY);
      const driverSaved = localStorage.getItem(
        `sachse_skipped_tasks_${selectedDriver.id}`,
      );
      const set = new Set<string>();
      if (globalSaved) {
        const parsed = JSON.parse(globalSaved);
        if (Array.isArray(parsed)) parsed.forEach((k) => set.add(String(k)));
      }
      if (driverSaved) {
        const parsed = JSON.parse(driverSaved);
        if (Array.isArray(parsed)) parsed.forEach((k) => set.add(String(k)));
      }
      return Array.from(set);
    } catch {
      return [];
    }
  });

  const skippedTaskIdsRef = useRef<string[]>(skippedTaskIds);
  useEffect(() => {
    skippedTaskIdsRef.current = skippedTaskIds;
    try {
      localStorage.setItem(
        GLOBAL_SKIPPED_STORAGE_KEY,
        JSON.stringify(skippedTaskIds),
      );
      localStorage.setItem(driverStorageKey, JSON.stringify(skippedTaskIds));
    } catch {
      // ignore
    }
  }, [skippedTaskIds, driverStorageKey]);

  const activePopupTaskIdRef = useRef<string | null>(null);
  const acceptingIdRef = useRef<string | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SAVED_DRIVER_ONLINE_KEY);
      return saved === null ? true : saved === "1";
    } catch {
      return true;
    }
  });

  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [taskTypeFilter, setTaskTypeFilter] = useState<
    "all" | "pickup_from_customer" | "deliver_to_customer"
  >("all");
  const [vehiclePlate, setVehiclePlate] = useState(
    selectedDriver.vehiclePlate || "29-B1 888.99",
  );
  const [vehicleType, setVehicleType] = useState<"motorbike" | "van">(
    "motorbike",
  );

  // Initialize GPS from saved localStorage or profile so switching tabs never resets GPS to 21.0285, 105.8542
  const [driverGps, setDriverGps] = useState<{ lat: number; lng: number }>(
    () => {
      try {
        const savedGps = localStorage.getItem(SAVED_DRIVER_GPS_KEY);
        if (savedGps) {
          const parsedGps = JSON.parse(savedGps);
          if (parsedGps?.lat && parsedGps?.lng) {
            return {
              lat: Number(parsedGps.lat),
              lng: Number(parsedGps.lng),
            };
          }
        }
      } catch {
        // ignore
      }
      const parsed = getScopedProfile("driver");
      if (parsed?.currentLocation?.lat && parsed?.currentLocation?.lng) {
        return {
          lat: Number(parsed.currentLocation.lat),
          lng: Number(parsed.currentLocation.lng),
        };
      }
      return {
        lat: 21.0285,
        lng: 105.8542,
      };
    },
  );

  // Track whether real GPS has been resolved at least once so we don't pop up false 0.00km matches on initial mount
  const [isGpsReady, setIsGpsReady] = useState<boolean>(() => {
    try {
      const savedGps = localStorage.getItem(SAVED_DRIVER_GPS_KEY);
      if (savedGps) return true;
    } catch {
      // ignore
    }
    const parsed = getScopedProfile("driver");
    return Boolean(
      parsed?.currentLocation?.lat && parsed?.currentLocation?.lng,
    );
  });

  const [locatingGps, setLocatingGps] = useState(false);

  const driverAliasCsv = [
    selectedDriver.id,
    selectedDriver.username,
    selectedDriver.phone,
    selectedDriver.name,
  ]
    .filter(Boolean)
    .join(",");

  const isTaskSkipped = useCallback((t: any, skippedList: string[]) => {
    const taskId = String(t.id || t._id || "");
    const rawId = String(t._id || "");
    const stageKey = `${t.orderId}_${t.taskType}`;
    const orderKey = String(t.orderId || "");
    return (
      (taskId && skippedList.includes(taskId)) ||
      (rawId && skippedList.includes(rawId)) ||
      (t.orderId && skippedList.includes(stageKey)) ||
      (orderKey && skippedList.includes(`order_${orderKey}`))
    );
  }, []);

  const isDriverAuthenticated = Boolean(getScopedToken("driver"));
  const isOnDriverApp =
    location.pathname.startsWith("/mobile-driver") &&
    location.pathname !== "/mobile-driver/login";

  const fetchRadarData = useCallback(
    async (silent = false) => {
      if (!getScopedToken("driver")) return;
      if (!silent) setLoading(true);
      try {
        const [tasksRes, myTasksRes, driversRes, reviewsRes] =
          await Promise.all([
            deliveryAPI.getAvailableTasks({
              driverId: driverAliasCsv,
              driverLat: driverGps.lat,
              driverLng: driverGps.lng,
              radiusKm: 1.0,
            }),
            deliveryAPI
              .getMyTasks({ driverId: driverAliasCsv })
              .catch(() => ({ data: { data: [] } })),
            storesAPI.getDrivers().catch(() => ({ data: { data: [] } })),
            reviewsAPI.getAll().catch(() => ({ data: { data: [] } })),
          ]);

        const rawTasks = tasksRes.data?.data;
        const listTasks: DeliveryTask[] = Array.isArray(rawTasks)
          ? rawTasks
          : rawTasks?.tasks || [];

        const driverIdsLower = [
          selectedDriver.id,
          selectedDriver.username,
          selectedDriver.phone,
          selectedDriver.name,
        ]
          .filter(Boolean)
          .map((s) => String(s).toLowerCase());

        // Enrich with directional Haversine distance:
        // - pickup_from_customer: customerCoordinates <-> driverGps (customerToDriverKm)
        // - deliver_to_customer: storeCoordinates <-> driverGps (storeToDriverKm)
        const enrichedAndFiltered = listTasks
          .filter((t: any) => {
            const rejectedList: string[] = Array.isArray(t.rejectedDriverIds)
              ? t.rejectedDriverIds.map((r: any) => String(r).toLowerCase())
              : [];
            const rejectedOnServer = rejectedList.some((r) =>
              driverIdsLower.includes(r),
            );
            if (rejectedOnServer) return false;
            if (isTaskSkipped(t, skippedTaskIdsRef.current)) return false;
            return true;
          })
          .map((t: any) => {
            const isDeliverToCustomer = t.taskType === "deliver_to_customer";

            const custCoord =
              t.customerCoordinates?.lat && t.customerCoordinates?.lng
                ? t.customerCoordinates
                : isDeliverToCustomer
                  ? t.deliveryCoordinates || t.pickupCoordinates
                  : t.pickupCoordinates;

            const storeCoord =
              t.storeCoordinates?.lat && t.storeCoordinates?.lng
                ? t.storeCoordinates
                : isDeliverToCustomer
                  ? t.pickupCoordinates
                  : t.deliveryCoordinates || t.pickupCoordinates;

            const exactCustomerToDriverKm =
              custCoord?.lat && custCoord?.lng
                ? computeHaversineKm(
                    driverGps.lat,
                    driverGps.lng,
                    Number(custCoord.lat),
                    Number(custCoord.lng),
                  )
                : Number(t.customerToDriverKm ?? t.driverToPickupKm ?? 999);

            const exactStoreToDriverKm =
              storeCoord?.lat && storeCoord?.lng
                ? computeHaversineKm(
                    driverGps.lat,
                    driverGps.lng,
                    Number(storeCoord.lat),
                    Number(storeCoord.lng),
                  )
                : Number(t.storeToDriverKm ?? t.driverToPickupKm ?? 999);

            const dispatchDistanceKm = isDeliverToCustomer
              ? exactStoreToDriverKm
              : exactCustomerToDriverKm;

            return {
              ...t,
              id: t.id || t._id,
              customerToDriverKm: exactCustomerToDriverKm,
              storeToDriverKm: exactStoreToDriverKm,
              driverToPickupKm: dispatchDistanceKm,
            };
          })
          .filter((t: any) => Number(t.driverToPickupKm) <= 1.0);

        // Detect if the currently ringing task was cancelled by the customer
        const prevPopupId = activePopupTaskIdRef.current;
        if (
          prevPopupId &&
          !skippedTaskIdsRef.current.includes(prevPopupId) &&
          acceptingIdRef.current !== prevPopupId
        ) {
          const stillExists = enrichedAndFiltered.some(
            (t: any) => t.id === prevPopupId,
          );
          if (!stillExists) {
            activePopupTaskIdRef.current = null;
            showToast(
              "Đơn hàng vừa bị hủy hoặc không còn khả dụng — Đã đóng thông báo nhận chuyến.",
              "info",
            );
          }
        }

        setAvailableTasks(enrichedAndFiltered);

        const rawMyTasks = myTasksRes.data?.data;
        setMyTasks(
          Array.isArray(rawMyTasks) ? rawMyTasks : rawMyTasks?.tasks || [],
        );

        const rawDrivers = driversRes.data?.data;
        const driverList: CourierDriver[] = Array.isArray(rawDrivers)
          ? rawDrivers
          : rawDrivers?.drivers || [];
        setDrivers(driverList);

        const rawReviews = reviewsRes.data?.data;
        const reviewList = Array.isArray(rawReviews)
          ? rawReviews
          : rawReviews?.reviews || [];
        const shipperRatings = reviewList
          .map((r: any) => Number(r.shipperRating || r.rating || 0))
          .filter((n: number) => n > 0);

        if (shipperRatings.length > 0) {
          const sum = shipperRatings.reduce((a: number, b: number) => a + b, 0);
          setAvgRating(Number((sum / shipperRatings.length).toFixed(1)));
          setReviewCount(shipperRatings.length);
        } else {
          setAvgRating(5.0);
          setReviewCount(0);
        }
      } catch {
        if (!silent) {
          showToast("Không thể tải sàn chuyến phát sóng", "error");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [
      driverAliasCsv,
      selectedDriver.id,
      selectedDriver.username,
      selectedDriver.phone,
      selectedDriver.name,
      driverGps.lat,
      driverGps.lng,
      isTaskSkipped,
      showToast,
    ],
  );

  // Get real GPS location on mount when on Driver App and persist to localStorage
  useEffect(() => {
    if (!isDriverAuthenticated || !isOnDriverApp) return;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          };
          setDriverGps(coords);
          setIsGpsReady(true);
          try {
            localStorage.setItem(SAVED_DRIVER_GPS_KEY, JSON.stringify(coords));
          } catch {
            // ignore
          }
        },
        () => {
          setIsGpsReady(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 },
      );
    } else {
      setIsGpsReady(true);
    }
  }, [isDriverAuthenticated, isOnDriverApp]);

  useEffect(() => {
    if (!isDriverAuthenticated || !isOnDriverApp) return;
    fetchRadarData(true);
  }, [isDriverAuthenticated, isOnDriverApp, fetchRadarData]);

  // Real-time polling every 2 seconds across ALL Driver App pages when Shipper is Online
  useEffect(() => {
    if (!isOnline || !isDriverAuthenticated || !isOnDriverApp) return;
    const interval = setInterval(() => {
      fetchRadarData(true);
    }, 2000);
    return () => clearInterval(interval);
  }, [isOnline, isDriverAuthenticated, isOnDriverApp, fetchRadarData]);

  const handleDriverGpsChange = async (lat: number, lng: number) => {
    const nextLoc = {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    };
    setDriverGps(nextLoc);
    setIsGpsReady(true);
    try {
      localStorage.setItem(SAVED_DRIVER_GPS_KEY, JSON.stringify(nextLoc));
    } catch {
      // ignore
    }
    try {
      await deliveryAPI.updateLocation({
        driverId: selectedDriver.id,
        lat: nextLoc.lat,
        lng: nextLoc.lng,
      });
    } catch {
      // non-blocking
    }
  };

  const handleLocateMe = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      showToast("Thiết bị không hỗ trợ định vị GPS", "warning");
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await handleDriverGpsChange(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        setLocatingGps(false);
        showToast("Đã định vị GPS vị trí hiện tại của bạn!", "success");
      },
      () => {
        setLocatingGps(false);
        showToast(
          "Không thể lấy GPS hiện tại. Vui lòng bật quyền vị trí trên trình duyệt.",
          "warning",
        );
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleToggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    try {
      localStorage.setItem(SAVED_DRIVER_ONLINE_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
    if (next) {
      try {
        await deliveryAPI.updateLocation({
          driverId: selectedDriver.id,
          lat: driverGps.lat,
          lng: driverGps.lng,
        });
      } catch {
        // non-blocking
      }
      await fetchRadarData(true);
      showToast("Đã bật nhận chuyến trực tuyến (Bán kính 1km)!", "success");
    } else {
      showToast("Đã tắt nhận chuyến (Tạm nghỉ)", "info");
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    if (!isOnline) {
      showToast("Vui lòng bấm 'Mở nhận chuyến' trước khi nhận đơn", "warning");
      return;
    }
    setAcceptingId(taskId);
    acceptingIdRef.current = taskId;
    activePopupTaskIdRef.current = null;
    try {
      await deliveryAPI.acceptTask({
        taskId,
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
        driverPhone: selectedDriver.phone,
      });
      // Immediately remove from availableTasks so popup closes right away
      setAvailableTasks((prev) =>
        prev.filter((t: any) => t.id !== taskId && t._id !== taskId),
      );
      window.dispatchEvent(new CustomEvent("sachse-driver-task-updated"));
      showToast(
        "Đã nhận chuyến thành công! Chuyển sang màn hình điều hướng Google Maps.",
        "success",
      );
      navigate("/mobile-driver/active-task");
      await fetchRadarData(true);
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
          "Chuyến này đã có tài xế khác nhận hoặc khách đã hủy",
        "error",
      );
      await fetchRadarData(true);
    } finally {
      setAcceptingId(null);
      acceptingIdRef.current = null;
    }
  };

  const handleSkipTask = useCallback(
    (taskId: string, reason?: "timeout" | "manual") => {
      const targetTask = availableTasks.find(
        (t: any) => t.id === taskId || t._id === taskId,
      );

      const keysToSkip = [taskId];
      if (targetTask) {
        if ((targetTask as any)._id)
          keysToSkip.push(String((targetTask as any)._id));
        if (targetTask.orderId) {
          keysToSkip.push(`${targetTask.orderId}_${targetTask.taskType}`);
          keysToSkip.push(`order_${targetTask.orderId}`);
        }
      }

      const alreadySkipped = keysToSkip.every((k) =>
        skippedTaskIdsRef.current.includes(k),
      );
      if (alreadySkipped) return;

      const updated = Array.from(
        new Set([...skippedTaskIdsRef.current, ...keysToSkip]),
      );
      skippedTaskIdsRef.current = updated;
      setSkippedTaskIds(updated);

      try {
        localStorage.setItem(
          GLOBAL_SKIPPED_STORAGE_KEY,
          JSON.stringify(updated),
        );
        localStorage.setItem(driverStorageKey, JSON.stringify(updated));
      } catch {
        // ignore
      }

      if (activePopupTaskIdRef.current === taskId) {
        activePopupTaskIdRef.current = null;
      }

      // Immediately remove from current availableTasks state so modal closes without waiting
      setAvailableTasks((prev) =>
        prev.filter(
          (t: any) =>
            t.id !== taskId &&
            t._id !== taskId &&
            (!targetTask?.orderId || t.orderId !== targetTask.orderId),
        ),
      );

      // Notify backend to record rejectedDriverIds so this driver never receives this task again
      deliveryAPI
        .rejectTask({
          taskId,
          orderId: targetTask?.orderId,
          driverId: driverAliasCsv,
          reason,
        })
        .catch(() => {
          // non-blocking
        });

      const displayCode = targetTask?.orderId || taskId;
      showToast(
        reason === "timeout"
          ? `Hết 20 giây nhận chuyến — Đơn #${displayCode} đã chuyển cho tài xế khác.`
          : `Đã từ chối đơn #${displayCode}. Hệ thống đã chuyển đơn cho tài xế khác.`,
        "info",
      );
    },
    [availableTasks, driverAliasCsv, driverStorageKey, showToast],
  );

  const handleUpdateDriverProfile = (patch: {
    name: string;
    phone: string;
    vehiclePlate: string;
    vehicleType: "motorbike" | "van";
  }) => {
    setSelectedDriver((prev) => ({
      ...prev,
      name: patch.name,
      phone: patch.phone,
      vehiclePlate: patch.vehiclePlate,
    }));
    setVehiclePlate(patch.vehiclePlate);
    setVehicleType(patch.vehicleType);
    showToast(
      "Đã cập nhật thông tin tài khoản & phương tiện Shipper!",
      "success",
    );
  };

  const handleDriverLogout = () => {
    clearScopedSession("driver");
    showToast("Đã đăng xuất khỏi App Tài Xế!", "info");
    navigate("/mobile-driver/login", { replace: true });
  };

  // All unskipped broadcast tasks within 1km (for global incoming alert across all pages)
  const unskippedTasks = availableTasks.filter(
    (t) => !isTaskSkipped(t, skippedTaskIds),
  );

  const filteredTasks = unskippedTasks.filter((t) =>
    taskTypeFilter === "all" ? true : t.taskType === taskTypeFilter,
  );

  // Calculate total earnings from completed delivery tasks (shippingFee + tipAmount, matching Ví Thu Nhập)
  const completedTasks = myTasks.filter((t) => t.status === "completed");
  const totalEarnings = completedTasks.reduce(
    (sum, t) =>
      sum + (Number(t.shippingFee) || 25000) + (Number(t.tipAmount) || 0),
    0,
  );

  // Count active ongoing tasks
  const activeTasksCount = myTasks.filter((t) =>
    [
      "accepted",
      "picking_up",
      "arrived_pickup",
      "picked_up",
      "in_transit",
    ].includes(t.status),
  ).length;

  // Automatic incoming order popup: triggers on ANY Driver App page when online, GPS is ready, and task is not skipped
  const incomingAlertTask =
    isOnline &&
    isGpsReady &&
    isDriverAuthenticated &&
    isOnDriverApp &&
    unskippedTasks.length > 0
      ? unskippedTasks[0]
      : null;

  useEffect(() => {
    activePopupTaskIdRef.current = incomingAlertTask?.id || null;
  }, [incomingAlertTask?.id]);

  // Shared 20-second countdown across all pages so switching tabs never resets the countdown
  const [acceptCountdown, setAcceptCountdown] = useState<number>(20);

  useEffect(() => {
    if (!isOnline || !incomingAlertTask?.id) {
      setAcceptCountdown(20);
      return;
    }
    setAcceptCountdown(20);
  }, [isOnline, incomingAlertTask?.id]);

  useEffect(() => {
    if (!isOnline || !incomingAlertTask?.id) return;
    if (acceptCountdown <= 0) return;

    const timer = setInterval(() => {
      setAcceptCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOnline, incomingAlertTask?.id, acceptCountdown]);

  useEffect(() => {
    if (isOnline && incomingAlertTask?.id && acceptCountdown === 0) {
      handleSkipTask(incomingAlertTask.id, "timeout");
    }
  }, [isOnline, incomingAlertTask?.id, acceptCountdown, handleSkipTask]);

  return {
    tasks: filteredTasks,
    myTasks,
    completedCount: completedTasks.length,
    activeTasksCount,
    totalEarnings,
    avgRating,
    reviewCount,
    incomingAlertTask,
    acceptCountdown,
    drivers,
    driverGps,
    handleDriverGpsChange,
    locatingGps,
    handleLocateMe,
    selectedDriver,
    setSelectedDriver,
    vehiclePlate,
    vehicleType,
    handleUpdateDriverProfile,
    handleDriverLogout,
    isOnline,
    handleToggleOnline,
    loading,
    acceptingId,
    taskTypeFilter,
    setTaskTypeFilter,
    fetchRadarData: () => fetchRadarData(false),
    handleAcceptTask,
    handleSkipTask,
  };
};

type DriverRadarContextType = ReturnType<typeof useMobileDriverRadarInternal>;

const DriverRadarContext = createContext<DriverRadarContextType | null>(null);

export const DriverRadarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const radarState = useMobileDriverRadarInternal();
  return React.createElement(
    DriverRadarContext.Provider,
    { value: radarState },
    children,
  );
};

export const useMobileDriverRadar = (): DriverRadarContextType => {
  const ctx = useContext(DriverRadarContext);
  if (!ctx) {
    throw new Error(
      "useMobileDriverRadar must be used within a DriverRadarProvider",
    );
  }
  return ctx;
};
