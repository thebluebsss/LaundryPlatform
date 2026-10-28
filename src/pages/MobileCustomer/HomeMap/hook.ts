import { useState, useEffect, useCallback, useMemo } from "react";
import { storesAPI, servicesAPI, laundryOrdersAPI } from "../../../services/api";
import { LaundryStore, LaundryService, LaundryOrder } from "../../../types";
import { DEFAULT_STORES } from "../../../data/storesData";
import { LAUNDRY_SERVICES } from "../../../data";
import { useToast } from "../../../components/Toast";

export const useMobileCustomerHome = () => {
  const { showToast } = useToast();
  const [stores, setStores] = useState<LaundryStore[]>(DEFAULT_STORES);
  const [services, setServices] = useState<LaundryService[]>(LAUNDRY_SERVICES);
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [cityFilter, setCityFilter] = useState<"all" | "hcm" | "hanoi">("all");
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoreForReviews, setSelectedStoreForReviews] =
    useState<LaundryStore | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 10.7769,
    lng: 106.7009,
  });

  const calculateDistanceKm = useCallback(
    (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Number((R * c).toFixed(1));
    },
    []
  );

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    try {
      const [storesRes, servicesRes, ordersRes] = await Promise.allSettled([
        storesAPI.getAll(),
        servicesAPI.getAll(),
        laundryOrdersAPI.getAll(),
      ]);
      if (storesRes.status === "fulfilled") {
        const sList =
          storesRes.value.data?.data?.stores ||
          (Array.isArray(storesRes.value.data?.data)
            ? storesRes.value.data.data
            : DEFAULT_STORES);
        setStores(sList.length > 0 ? sList : DEFAULT_STORES);
      }
      if (servicesRes.status === "fulfilled") {
        const svcList =
          servicesRes.value.data?.data?.services ||
          (Array.isArray(servicesRes.value.data?.data)
            ? servicesRes.value.data.data
            : LAUNDRY_SERVICES);
        if (svcList.length > 0) setServices(svcList);
      }
      if (ordersRes.status === "fulfilled") {
        const ordList =
          ordersRes.value.data?.data?.orders ||
          (Array.isArray(ordersRes.value.data?.data)
            ? ordersRes.value.data.data
            : []);
        setOrders(ordList);
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Không thể tải danh sách cửa hàng gần bạn",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          showToast("Đã cập nhật vị trí GPS hiện tại của bạn", "success");
        },
        () => {
          showToast(
            "Đang sử dụng tọa độ mặc định trung tâm (Quận 1 / Hoàn Kiếm)",
            "info"
          );
        }
      );
    }
  };

  const filteredStores = useMemo(() => {
    return stores
      .filter((s) => {
        if (cityFilter !== "all" && s.city !== cityFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            s.name.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q) ||
            s.district.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .map((s) => ({
        ...s,
        distanceKm: calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          s.lat,
          s.lng
        ),
      }))
      .sort((a, b) => {
        if (sortBy === "rating") {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        }
        return a.distanceKm - b.distanceKm;
      });
  }, [stores, cityFilter, searchQuery, userCoords, calculateDistanceKm, sortBy]);

  const waitingWeightOrdersCount = useMemo(() => {
    return orders.filter(
      (o) =>
        o.weightConfirmStatus === "waiting_customer" ||
        o.status === "waiting_confirm"
    ).length;
  }, [orders]);

  return {
    stores: filteredStores,
    services,
    loading,
    cityFilter,
    setCityFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    selectedStoreForReviews,
    setSelectedStoreForReviews,
    waitingWeightOrdersCount,
    handleLocateMe,
    fetchHomeData,
  };
};
