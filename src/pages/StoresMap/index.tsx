import React from "react";
import {
  Navigation,
  Phone,
  Clock,
  Search,
  ShieldCheck,
  ArrowRight,
  Compass,
  Building2,
  Store,
  PlusCircle,
} from "lucide-react";
import { GoogleMapCanvas } from "../../components/GoogleMapCanvas";
import { InputText } from "../../components/InputText";
import { ButtonCustom, ButtonOutLine } from "../../components/ButtonCustom";
import { useStoresMap } from "./hook";
import { StoreBranchCard } from "./components/StoreBranchCard";

export const StoresMapPage: React.FC = () => {
  const {
    navigate,
    stores,
    drivers,
    loading,
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
  } = useStoresMap();

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
              <span>
                Khu vực hoạt động: TP. Hà Nội ({stores.length} chi nhánh)
              </span>
            </div>

            <ButtonCustom
              type="button"
              onClick={handleLocateMe}
              loading={locating}
              iconStart={<Navigation className="w-3.5 h-3.5" />}
              label={locating ? "Đang lấy GPS..." : "Vị Trí Của Tôi"}
              className="!w-auto !h-10 !px-4 !bg-emerald-500 hover:!bg-emerald-600"
              textClassName="!text-xs !font-black"
            />
          </div>
        </div>
      </div>

      {/* Main Split Layout: Store List (Left) + Interactive Google Maps (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Store Directory */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <InputText
              placeholder="Tìm theo tên quận, tên đường hoặc chi nhánh..."
              startAdornment={<Search className="w-4 h-4 text-slate-400" />}
              endAdornment={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Xóa
                  </button>
                ) : null
              }
              inputProps={{
                value: searchQuery,
                onChange: (e: any) => setSearchQuery(e.target.value),
              }}
            />
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
                  <ButtonCustom
                    type="button"
                    onClick={() => navigate("/store-owner/login")}
                    iconStart={<PlusCircle className="w-3.5 h-3.5" />}
                    label="Cổng Chủ Tiệm (/store-owner/login)"
                    className="!w-auto !h-9 !px-3.5"
                    textClassName="!text-xs"
                  />
                  <ButtonOutLine
                    type="button"
                    onClick={() => navigate("/admin/login")}
                    label="Cổng Admin (/admin/login)"
                    className="!w-auto !h-9 !px-3.5"
                    textClassName="!text-xs"
                  />
                </div>
              </div>
            ) : (
              filteredStores.map((store, index) => (
                <StoreBranchCard
                  key={store.id}
                  store={store}
                  index={index}
                  isSelected={selectedStore?.id === store.id}
                  onSelect={() => setSelectedStore(store)}
                  onBookFromStore={handleBookFromStore}
                />
              ))
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

              <ButtonCustom
                type="button"
                onClick={() => handleBookFromStore(selectedStore)}
                label="Đặt Shipper Tới Lấy Đồ"
                className="w-full md:!w-auto !px-5 shrink-0"
                textClassName="!text-xs md:!text-sm !font-black"
              >
                <ArrowRight className="w-4 h-4" />
              </ButtonCustom>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
