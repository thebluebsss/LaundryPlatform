import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Star,
  Search,
  Filter,
  Layers,
  ArrowRight,
  CheckCircle2,
  Bike,
  Building2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  RefreshCw,
  PhoneCall,
  X,
  Compass,
  Map as MapIcon,
  List as ListIcon,
  Store,
  UserCheck
} from "lucide-react";
import L from "leaflet";
import { LaundryStore, CourierDriver } from "../../types";
import { DEFAULT_STORES, DEFAULT_DRIVERS } from "../../data/storesData";
import { storesAPI } from "../../services/api";
import { StoreReviewsModal } from "../../components/StoreReviewsModal";

// Haversine formula to compute distance in km
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const StoresMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected filters
  const [selectedCity, setSelectedCity] = useState<"hcm" | "hanoi">(
    (searchParams.get("city") as "hcm" | "hanoi") || "hcm"
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open">("all");
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance");
  const [maxRadius, setMaxRadius] = useState<number>(20); // km

  // View state: 'map' | 'list'
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // Stores and Drivers state
  const [stores, setStores] = useState<LaundryStore[]>(DEFAULT_STORES);
  const [drivers, setDrivers] = useState<CourierDriver[]>(DEFAULT_DRIVERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStore, setSelectedStore] = useState<LaundryStore | null>(null);
  const [storeForReviews, setStoreForReviews] = useState<LaundryStore | null>(null);

  // User location (default: HCM center: 10.7769, 106.7009)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 10.7769,
    lng: 106.7009,
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>("Đã lấy vị trí trung tâm");

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Fetch stores from API
  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await storesAPI.getAll({ city: selectedCity });
      if (response.data && response.data.data && response.data.data.length > 0) {
        setStores(response.data.data);
      } else {
        setStores(DEFAULT_STORES);
      }
    } catch (error) {
      console.warn("Using fallback store data due to network/API state");
      setStores(DEFAULT_STORES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [selectedCity]);

  // Request user GPS location
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationStatus("Đang định vị GPS...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLoc);
          setIsLocating(false);
          setLocationStatus("Đã định vị thành công vị trí của bạn");

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([newLoc.lat, newLoc.lng], 14, {
              duration: 1.5,
            });
          }
        },
        (error) => {
          setIsLocating(false);
          setLocationStatus("Không thể lấy GPS (sử dụng vị trí mặc định)");
          console.warn("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      setLocationStatus("Trình duyệt không hỗ trợ Geolocation");
    }
  };

  // Switch City
  const handleCityChange = (city: "hcm" | "hanoi") => {
    setSelectedCity(city);
    setSelectedDistrict("all");
    const cityCenter =
      city === "hcm" ? { lat: 10.7769, lng: 106.7009 } : { lat: 21.0285, lng: 105.8542 };
    setUserLocation(cityCenter);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([cityCenter.lat, cityCenter.lng], 12);
    }
  };

  // Filtered stores list
  const filteredStores = stores
    .filter((store) => {
      if (store.city !== selectedCity) return false;
      if (selectedDistrict !== "all" && store.district !== selectedDistrict) return false;
      if (statusFilter === "open" && store.status !== "open") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = store.name.toLowerCase().includes(q);
        const matchAddress = store.address.toLowerCase().includes(q);
        const matchDistrict = store.district.toLowerCase().includes(q);
        if (!matchName && !matchAddress && !matchDistrict) return false;
      }

      const dist = calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng);
      if (dist > maxRadius) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });

  // Get distinct districts for dropdown filter
  const availableDistricts = Array.from(
    new Set(stores.filter((s) => s.city === selectedCity).map((s) => s.district))
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (viewMode !== "map") return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive or clean on unmount
    };
  }, [viewMode]);

  // Update map markers when filteredStores or drivers change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    // 1. User location marker
    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
          <div class="relative w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindPopup(`<div class="font-semibold text-xs text-slate-800">📍 Vị trí của bạn</div>`)
      .addTo(layerGroup);

    // 2. Store markers
    filteredStores.forEach((store) => {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng);
      const isOpen = store.status === "open";
      const statusBg = isOpen ? "bg-emerald-500" : store.status === "busy" ? "bg-amber-500" : "bg-rose-500";

      const storeIcon = L.divIcon({
        className: "custom-store-marker",
        html: `
          <div class="relative group cursor-pointer">
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border-2 border-blue-500 text-white rounded-xl shadow-xl hover:scale-105 transition-transform">
              <span class="w-2 h-2 rounded-full ${statusBg} animate-pulse"></span>
              <span class="font-bold text-xs whitespace-nowrap">${store.name.split("-")[0]}</span>
              <span class="text-[10px] bg-blue-600 px-1 rounded font-medium">${dist}km</span>
            </div>
            <div class="w-0 h-0 mx-auto border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-900"></div>
          </div>
        `,
        iconSize: [120, 42],
        iconAnchor: [60, 42],
      });

      const marker = L.marker([store.lat, store.lng], { icon: storeIcon });
      marker.on("click", () => {
        setSelectedStore(store);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([store.lat, store.lng], 15, { duration: 1 });
        }
      });
      marker.addTo(layerGroup);
    });

    // 3. Driver/Shipper icons moving near stores
    drivers.forEach((driver) => {
      const driverIcon = L.divIcon({
        className: "custom-driver-marker",
        html: `
          <div class="relative flex items-center justify-center p-1.5 bg-amber-500 text-slate-950 border border-amber-300 rounded-full shadow-lg hover:scale-110 transition-transform">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const dMarker = L.marker([driver.lat, driver.lng], { icon: driverIcon }).bindPopup(
        `<div class="text-xs p-1">
          <p class="font-bold text-slate-900">${driver.name} 🛵</p>
          <p class="text-slate-600 text-[11px]">${driver.storeName}</p>
          <p class="text-emerald-600 font-semibold text-[11px]">Đã hoàn thành ${driver.completedOrders} đơn</p>
        </div>`
      );
      dMarker.addTo(layerGroup);
    });
  }, [filteredStores, userLocation, viewMode, drivers]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-4">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Mạng lưới cửa hàng & Xe giao nhận trực tuyến</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bản Đồ Định Vị Tiệm Giặt Near You
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Tìm tiệm giặt gần nhất, kiểm tra trạng thái máy giặt & theo dõi tài xế lấy đồ tận nơi như đặt xe công nghệ.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                viewMode === "map"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Bản Đồ</span>
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                viewMode === "list"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ListIcon className="w-4 h-4" />
              <span>Danh Sách ({filteredStores.length})</span>
            </button>
          </div>
        </div>

        {/* Filters and Controls Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* City selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Thành Phố</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => handleCityChange("hcm")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    selectedCity === "hcm" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                  }`}
                >
                  TP. Hồ Chí Minh
                </button>
                <button
                  onClick={() => handleCityChange("hanoi")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    selectedCity === "hanoi" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Hà Nội
                </button>
              </div>
            </div>

            {/* District dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Quận / Huyện</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả Quận / Huyện</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tìm Tên / Địa Chỉ</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Nhập Nguyễn Trãi, Xuân Thủy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status & Ranking Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Sắp Xếp / Ranking</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "distance" | "rating")}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="distance">📍 Gần vị trí của bạn nhất</option>
                <option value="rating">⭐ Ranking đánh giá cao nhất</option>
              </select>
            </div>

            {/* GPS Location Trigger */}
            <div className="flex items-end">
              <button
                onClick={handleGetLocation}
                disabled={isLocating}
                className="w-full h-10 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 text-blue-400 ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? "Đang định vị..." : "Định vị vị trí tôi"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
            <span>{locationStatus}</span>
            <span>Hiển thị <strong>{filteredStores.length}</strong> cửa hàng & <strong>{drivers.length}</strong> xe giao nhận</span>
          </div>
        </div>

        {/* Main Content Area */}
        {viewMode === "map" ? (
          <div className="relative w-full h-[580px] rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-200">
            {/* Leaflet Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Quick Legend Bar */}
            <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-md text-xs space-y-1.5 hidden sm:block">
              <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Ghi chú bản đồ</p>
              <div className="flex items-center gap-2 text-slate-700 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Cửa hàng Mở Cửa</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Đang Bận / Đang Tải</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-xs">
                <span className="w-2.5 h-2.5 bg-amber-500 text-slate-950 text-[10px] rounded-full p-0.5 font-bold">🛵</span>
                <span>Xe lấy đồ di chuyển</span>
              </div>
            </div>

            {/* Selected Store Floating Drawer */}
            {selectedStore && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20 bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        selectedStore.status === "open" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    ></span>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {selectedStore.status === "open" ? "Đang Mở Cửa" : "Đang Đóng / Bận"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-3 mb-3">
                  <img
                    src={selectedStore.image}
                    alt={selectedStore.name}
                    className="w-20 h-20 object-cover rounded-2xl border border-slate-100"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {selectedStore.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{selectedStore.address}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setStoreForReviews(selectedStore)}
                        className="flex items-center gap-1 text-amber-500 hover:underline cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>
                          {selectedStore.rating} ({selectedStore.reviewCount} đánh giá)
                        </span>
                      </button>
                      <span className="text-blue-600 font-bold">
                        {calculateDistance(userLocation.lat, userLocation.lng, selectedStore.lat, selectedStore.lng)} km
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 py-2 border-y border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{selectedStore.openHours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-amber-500" />
                    <span>{selectedStore.activeShippersCount} tài xế sẵn sàng</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/booking?storeId=${selectedStore.id}`)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <span>Đặt Dịch Vụ Tại Đây</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={`tel:${selectedStore.phone}`}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl flex items-center justify-center"
                    title="Gọi cửa hàng"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* List Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => {
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                store.lat,
                store.lng
              );
              return (
                <div
                  key={store.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={store.image}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            store.status === "open" ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                        ></span>
                        <span>{store.status === "open" ? "Mở Cửa" : "Đang Bận"}</span>
                      </div>

                      <div className="absolute bottom-3 right-3 bg-white/95 text-slate-900 px-2.5 py-1 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-blue-600" />
                        <span>{distance} km</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                          {store.district}
                        </span>
                        <button
                          type="button"
                          onClick={() => setStoreForReviews(store)}
                          className="flex items-center gap-1 text-amber-500 hover:underline text-xs font-bold cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{store.rating} ({store.reviewCount} đánh giá)</span>
                        </button>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                        {store.name}
                      </h3>

                      <p className="text-xs text-slate-500 mb-4 flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{store.address}</span>
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {store.features.map((feat, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 mt-auto">
                    <div className="flex items-center justify-between text-xs text-slate-500 my-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {store.openHours}
                      </span>
                      <span className="font-semibold text-slate-800">{store.priceRange}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/booking?storeId=${store.id}`)}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
                      >
                        <span>Đặt Giặt Tại Đây</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setStoreForReviews(store)}
                        className="px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Xem Đánh Giá</span>
                      </button>

                      <a
                        href={`tel:${store.phone}`}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center"
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <StoreReviewsModal
        store={storeForReviews}
        onClose={() => setStoreForReviews(null)}
        onBookStore={(selected) => navigate(`/booking?storeId=${selected.id}`)}
      />
    </div>
  );
};

export default StoresMapPage;
