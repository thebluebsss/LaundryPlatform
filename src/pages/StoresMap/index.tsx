import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Star,
  Search,
  Bike,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Compass,
  Building2,
  Store,
  PlusCircle,
} from "lucide-react";
import { LaundryStore, CourierDriver } from "../../types";
import { storesAPI } from "../../services/api";
import { GoogleMapCanvas } from "../../components/GoogleMapCanvas";

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

export const StoresMapPage: React.FC = () => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Google Maps Trực Tuyến · Định Vị Cửa Hàng & Tài Xế</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Bản Đồ Hệ Thống{" "}
              <span className="text-blue-400">Cửa Hàng Giặt Sấy</span> Gần Bạn
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Tìm tiệm giặt Sạch Sẽ gần vị trí của bạn trên Google Maps, xem lộ
              trình khoảng cách thực tế và đặt lịch thu gom tận cửa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-800/90 px-3.5 py-2 rounded-2xl border border-slate-700 flex items-center gap-1.5 text-xs font-extrabold text-blue-300">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Khu vực hoạt động: TP. Hà Nội ({stores.length} chi nhánh)</span>
            </div>

            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locating}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-950/30 cursor-pointer transition-all"
            >
              <Navigation
                className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`}
              />
              {locating ? "Đang lấy GPS..." : "Vị Trí Của Tôi"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Store List (Left) + Interactive Google Maps (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Store Directory */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên quận, tên đường hoặc chi nhánh..."
              className="w-full text-xs md:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2"
              >
                Xóa
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                Đang tải danh sách cửa hàng từ Cơ sở dữ liệu...
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Store className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900">
                    Chưa có cửa hàng nào trong Cơ sở dữ liệu
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hệ thống đã được làm sạch toàn bộ dữ liệu mẫu. Chủ cửa hàng
                    hoặc Quản trị viên có thể đăng nhập cổng Web riêng để khởi
                    tạo chi nhánh tiệm giặt đầu tiên trên Google Maps.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/store-owner/login")}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Cổng Chủ Tiệm (/store-owner/login)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/login")}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cổng Admin (/admin/login)
                  </button>
                </div>
              </div>
            ) : (
              filteredStores.map((store, index) => {
                const isSelected = selectedStore?.id === store.id;
                return (
                  <div
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                        : "bg-white border-slate-200/80 hover:border-blue-300 shadow-sm"
                    }`}
                  >
                    {index === 0 && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-2xl flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        GẦN BẠN NHẤT
                      </div>
                    )}

                    <div className="flex gap-3.5">
                      <img
                        src={
                          store.image ||
                          "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=300"
                        }
                        alt={store.name}
                        className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              store.status === "open"
                                ? "bg-emerald-100 text-emerald-700"
                                : store.status === "busy"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {store.status === "open" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            {store.status === "open"
                              ? "Mở cửa đón đơn"
                              : store.status === "busy"
                              ? "Đang tải cao"
                              : "Tạm đóng"}
                          </span>

                          <span className="text-[11px] font-black text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full">
                            Cách {store.distance} km
                          </span>
                        </div>

                        <h3 className="font-black text-slate-900 text-sm md:text-base mt-1 truncate">
                          {store.name}
                        </h3>

                        <p className="text-xs text-slate-500 flex items-start gap-1 mt-1 line-clamp-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{store.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3 text-slate-600 font-semibold">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {store.rating || 5.0} ({store.reviewCount || 0})
                        </span>
                        <span className="flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5 text-blue-500" />
                          {store.activeShippersCount || 5} Shipper
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookFromStore(store);
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        Đặt Giặt Tại Đây
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Google Maps Canvas + Store Details */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <GoogleMapCanvas
            stores={filteredStores}
            drivers={drivers}
            selectedStore={selectedStore as any}
            onSelectStore={(st) => setSelectedStore(st)}
            userLoc={userLoc}
            onUserLocate={(lat, lng) => setUserLoc({ lat, lng })}
            center={
              selectedStore
                ? { lat: selectedStore.lat, lng: selectedStore.lng }
                : userLoc || { lat: 21.0285, lng: 105.8542 }
            }
            zoom={13}
            heightClassName="h-[460px] md:h-[520px]"
            showRouteToSelected={true}
          />

          {selectedStore && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-md border border-blue-100">
                    Mã chi nhánh: {selectedStore.code}
                  </span>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {selectedStore.openHours || "06:00 - 22:00"}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900">
                  {selectedStore.name}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Hotline tiệm: <strong>{selectedStore.phone}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Quản lý:{" "}
                    <strong>{selectedStore.managerName || "Chủ tiệm"}</strong>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleBookFromStore(selectedStore)}
                className="w-full md:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 cursor-pointer shrink-0 transition-all"
              >
                <span>Đặt Shipper Tới Lấy Đồ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
