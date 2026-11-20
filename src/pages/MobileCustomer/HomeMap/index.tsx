import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Search,
  Scale,
  PlusCircle,
  RefreshCw,
  Compass,
  Star,
} from "lucide-react";
import { useMobileCustomerHome } from "./hook";
import { NearbyStoreCard } from "./components/NearbyStoreCard";
import { StoreReviewsModal } from "../../../components/StoreReviewsModal";
import { GoogleMapCanvas } from "../../../components/GoogleMapCanvas";
import { InputText } from "../../../components/InputText";
import { ButtonCustom } from "../../../components/ButtonCustom";

export const MobileCustomerHome: React.FC = () => {
  const navigate = useNavigate();
  const {
    stores,
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
    selectedMapStore,
    setSelectedMapStore,
    userCoords,
    setUserCoords,
    waitingWeightOrdersCount,
    handleLocateMe,
    fetchHomeData,
  } = useMobileCustomerHome();

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-200">
      {/* Alert Banner if any order is waiting for customer weight confirmation */}
      {waitingWeightOrdersCount > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-800">
              <Scale className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Có <span className="font-mono">{waitingWeightOrdersCount}</span>{" "}
                đơn đã cân thực tế tại tiệm
              </span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Vui lòng duyệt khối lượng và giá thực tế để chủ tiệm cho đồ vào
              lồng giặt ngay.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/mobile-customer/weight-confirm")}
            className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs shrink-0 cursor-pointer transition-colors"
          >
            Duyệt Ngay →
          </button>
        </div>
      )}

      {/* Hero Action Card: Quick Multi-Fabric Order Entry */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-blue-300 font-medium">
          <span>Giặt sấy giao nhận tận nơi</span>
          <span className="tabular-nums">Lấy đồ sau ~30 phút</span>
        </div>
        <h2 className="text-lg font-bold tracking-tight">
          Đặt lịch lấy đồ giặt tận nhà
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Chọn dịch vụ theo từng loại vải và hẹn giờ trả đồ mong muốn. Tiệm cân
          thực tế và báo giá rõ ràng trước khi giặt.
        </p>
        <div className="pt-1">
          <ButtonCustom
            type="button"
            onClick={() => navigate("/mobile-customer/create-order")}
            iconStart={<PlusCircle className="w-4 h-4" />}
            label="Đặt giặt ngay"
            className="!h-11 !text-xs"
            textClassName="!text-xs !font-semibold"
          />
        </div>
      </div>

      {/* Interactive Map View on Mobile */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Bản đồ cửa hàng gần bạn
            </h3>
            <p className="text-[11px] text-slate-500">
              Chạm vào điểm ghim trên bản đồ để chọn nhanh tiệm giặt
            </p>
          </div>
          <button
            type="button"
            onClick={handleLocateMe}
            className="h-8 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Vị trí của tôi</span>
          </button>
        </div>

        <GoogleMapCanvas
          stores={stores}
          selectedStore={selectedMapStore || stores[0] || null}
          onSelectStore={(st) => setSelectedMapStore(st)}
          userLoc={userCoords}
          onUserLocate={(lat, lng) => setUserCoords({ lat, lng })}
          center={
            selectedMapStore
              ? { lat: selectedMapStore.lat, lng: selectedMapStore.lng }
              : userCoords || { lat: 21.0285, lng: 105.8542 }
          }
          zoom={13}
          heightClassName="h-[260px]"
          showRouteToSelected={true}
        />
      </div>

      {/* Horizontal Service Price Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">
            Bảng giá dịch vụ phổ biến
          </h3>
          <span className="text-[11px] text-slate-500">
            Theo kg hoặc từng món
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {services.slice(0, 4).map((svc) => (
            <button
              key={svc.id}
              type="button"
              onClick={() =>
                navigate(
                  `/mobile-customer/create-order?serviceId=${encodeURIComponent(
                    svc.id
                  )}`
                )
              }
              className="text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 transition-colors cursor-pointer space-y-1"
            >
              <div className="font-semibold text-slate-900 text-xs truncate">
                {svc.name}
              </div>
              <div className="text-xs font-bold text-blue-600 tabular-nums">
                {svc.unitPrice.toLocaleString("vi-VN")}đ/{svc.unitName}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Distance/Rating Filter for Nearby Laundry Stores */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Cửa hàng quanh bạn ({stores.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Sắp xếp theo khoảng cách hoặc mức độ hài lòng của khách hàng
            </p>
          </div>
          <button
            type="button"
            onClick={fetchHomeData}
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
            title="Làm mới"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <InputText
          placeholder="Tìm theo tên tiệm, đường hoặc quận..."
          startAdornment={<Search className="w-4 h-4" />}
          inputProps={{
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
          }}
        />

        {/* Area Info Badge */}
        <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs">
          <span className="font-semibold text-blue-900">
            Khu vực phục vụ: Hà Nội
          </span>
          <span className="tabular-nums text-[11px] text-blue-700 font-medium">
            {stores.length} chi nhánh
          </span>
        </div>

        {/* Rating vs Distance Sort Toggle */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setSortBy("distance")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              sortBy === "distance"
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Gần bạn nhất</span>
          </button>
          <button
            type="button"
            onClick={() => setSortBy("rating")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              sortBy === "rating"
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Đánh giá cao nhất</span>
          </button>
        </div>
      </div>

      {/* Store Cards List */}
      <div className="space-y-3">
        {stores.map((store) => (
          <NearbyStoreCard
            key={store.id}
            store={store}
            onSelectStore={(selected) =>
              navigate(
                `/mobile-customer/create-order?storeId=${encodeURIComponent(
                  selected.id
                )}`
              )
            }
            onViewReviews={(selected) => setSelectedStoreForReviews(selected)}
          />
        ))}

        {!loading && stores.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-2">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              Hiện chưa có cửa hàng nào được khởi tạo trong CSDL
            </p>
            <p className="text-[11px] text-slate-500">
              Vui lòng đăng nhập Cổng Chủ Tiệm (/store-owner/login) hoặc Admin
              (/admin/login) để tạo chi nhánh đầu tiên.
            </p>
          </div>
        )}
      </div>

      <StoreReviewsModal
        store={selectedStoreForReviews}
        onClose={() => setSelectedStoreForReviews(null)}
        onBookStore={(selected) =>
          navigate(
            `/mobile-customer/create-order?storeId=${encodeURIComponent(
              selected.id
            )}`
          )
        }
      />
    </div>
  );
};
