import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LaundryStore, CourierDriver } from "../../types";
import { storesAPI } from "../../services/api";

const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

export const useStoresMap = () => {
  const navigate = useNavigate();

  const [stores, setStores] = useState<LaundryStore[]>([]);
  const [drivers, setDrivers] = useState<CourierDriver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState<"hcm" | "hanoi" | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<LaundryStore | null>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  const fetchStoresData = async () => {
    setLoading(true);
    try {
      const [storesRes, driversRes] = await Promise.allSettled([
        storesAPI.getAll(),
        storesAPI.getDrivers(),
      ]);

      if (storesRes.status === "fulfilled") {
        const raw = storesRes.value.data?.data;
        const list: LaundryStore[] = Array.isArray(raw)
          ? raw
          : raw?.stores || [];
        setStores(list);
        if (list.length > 0 && !selectedStore) {
          setSelectedStore(list[0]);
        }
      }

      if (driversRes.status === "fulfilled") {
        const rawDrv = driversRes.value.data?.data;
        const drvList: CourierDriver[] = Array.isArray(rawDrv)
          ? rawDrv
          : rawDrv?.drivers || [];
        setDrivers(drvList);
      }
    } catch (err) {
      console.error("Failed to fetch stores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoresData();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }
  }, []);

  const handleLocateMe = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLoc({ lat: latitude, lng: longitude });
          setLocating(false);
        },
        () => {
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocating(false);
    }
  };

  const filteredStores = useMemo(() => {
    return stores
      .filter((s) => (selectedCity === "all" ? true : s.city === selectedCity))
      .filter((s) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q)
        );
      })
      .map((s) => ({
        ...s,
        distance: userLoc
          ? getDistanceFromLatLonInKm(userLoc.lat, userLoc.lng, s.lat, s.lng)
          : undefined,
      }))
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }, [stores, selectedCity, searchQuery, userLoc]);

  useEffect(() => {
    if (
      filteredStores.length > 0 &&
      (!selectedStore || !filteredStores.some((s) => s.id === selectedStore.id))
    ) {
      setSelectedStore(filteredStores[0]);
    } else if (filteredStores.length === 0) {
      setSelectedStore(null);
    }
  }, [filteredStores]);

  const handleBookFromStore = (store: LaundryStore) => {
    sessionStorage.setItem("sachse_selected_store", JSON.stringify(store));
    navigate(`/booking?storeId=${encodeURIComponent(store.id)}`);
  };

  return {
    navigate,
    stores,
    drivers,
    loading,
    selectedCity,
    setSelectedCity,
    searchQuery,
    setSearchQuery,
    selectedStore,
    setSelectedStore,
    userLoc,
    setUserLoc,
    locating,
    filteredStores,
    handleLocateMe,
    handleBookFromStore,
  };
};
