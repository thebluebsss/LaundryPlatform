import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Search,
  Scale,
  Sparkles,
  PlusCircle,
  RefreshCw,
  Compass,
  Star,
} from "lucide-react";
import { useMobileCustomerHome } from "./hook";
import { NearbyStoreCard } from "./components/NearbyStoreCard";
import { StoreReviewsModal } from "../../../components/StoreReviewsModal";
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
                Có <span className="font-mono">{waitingWeightOrdersCount}</span> đơn đã cân thực tế tại tiệm
              </span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Vui lòng duyệt khối lượng và giá thực tế để chủ tiệm cho đồ vào lồng giặt ngay.
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

      {/* Hero Action Card: Quick Multi-Fabric & AI Order Entry */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-blue-300 font-semibold">
          <span>Ứng Dụng Đặt Giặt Thông Minh</span>
          <span className="font-mono">Shipper lấy tận cửa 30p</span>
        </div>
        <h2 className="text-lg font-black tracking-tight">
          Đặt Lịch Thu Gom Đồ Giặt Tận Nhà
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Thêm từng dòng đồ theo chất liệu vải hoặc dùng Camera AI quét nhãn mác quần áo tự động. Chủ tiệm cân thực tế minh bạch trước khi giặt.
        </p>
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <ButtonCustom
            type="button"
            onClick={() => navigate("/mobile-customer/create-order")}
            iconStart={<PlusCircle className="w-4 h-4" />}
            label="Tạo Đơn Giặt Mới"
            className="!h-11 !text-xs"
            textClassName="!text-xs"
          />
          <button
            type="button"
            onClick={() =>
              navigate("/mobile-customer/create-order?openAi=1")
            }
            className="h-11 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Quét AI Món Đồ</span>
          </button>
        </div>
      </div>

      {/* Horizontal Service Price Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900">
            Bảng Giá Dịch Vụ Tiêu Chuẩn
          </h3>
          <span className="text-[11px] text-slate-500">
            Tính theo kg hoặc từng món
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
              <div className="font-bold text-slate-900 text-xs truncate">
                {svc.name}
              </div>
              <div className="text-xs font-mono font-black text-blue-600">
                {svc.unitPrice.toLocaleString("vi-VN")}đ/{svc.unitName}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search & GPS Filter for Nearby Laundry Stores */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Cửa Hàng Giặt Là Gần Bạn ({stores.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Tìm theo khoảng cách GPS hoặc theo Ranking đánh giá (`reviews`)
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleLocateMe}
              className="h-9 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Định vị GPS</span>
            </button>
            <button
              type="button"
              onClick={fetchHomeData}
              className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <InputText
          placeholder="Tìm theo tên tiệm, đường hoặc quận..."
          startAdornment={<Search className="w-4 h-4" />}
          inputProps={{
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
          }}
        />

        {/* Interactive City Filter Segmented Control */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setCityFilter("all")}
            className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              cityFilter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả khu vực
          </button>
          <button
            type="button"
            onClick={() => setCityFilter("hcm")}
            className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              cityFilter === "hcm"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            TP. Hồ Chí Minh
          </button>
          <button
            type="button"
            onClick={() => setCityFilter("hanoi")}
            className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              cityFilter === "hanoi"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Hà Nội
          </button>
        </div>

        {/* Ranking vs Distance Sort Toggle */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setSortBy("distance")}
            className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              sortBy === "distance"
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Gần bạn nhất (km)</span>
          </button>
          <button
            type="button"
            onClick={() => setSortBy("rating")}
            className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              sortBy === "rating"
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Ranking cao nhất (★)</span>
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
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              Không tìm thấy tiệm giặt phù hợp từ khóa
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
