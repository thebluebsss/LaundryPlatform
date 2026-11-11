import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Banknote,
  Star,
  Power,
  X,
  Bike,
  Truck,
  Wallet,
  CircleUser,
  LogOut,
  MapPin,
  BellRing,
  Navigation,
} from "lucide-react";
import { useMobileDriverRadar } from "./hook";
import { BroadcastTaskCard } from "./components/BroadcastTaskCard";
import { GoogleMapCanvas } from "../../../components/GoogleMapCanvas";

export const MobileDriverRadar: React.FC = () => {
  const navigate = useNavigate();
  const {
    tasks,
    completedCount,
    activeTasksCount,
    totalEarnings,
    avgRating,
    reviewCount,
    drivers,
    driverGps,
    handleDriverGpsChange,
    selectedDriver,
    vehiclePlate,
    isOnline,
    handleToggleOnline,
    acceptingId,
    taskTypeFilter,
    setTaskTypeFilter,
    handleAcceptTask,
    handleSkipTask,
    handleDriverLogout,
  } = useMobileDriverRadar();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);

  return (
    <div className="relative w-full h-full flex-1 rounded-3xl overflow-hidden overscroll-none shadow-lg border border-slate-200/80 bg-slate-100 select-none">
      {/* FULL-SCREEN INTERACTIVE GOOGLE MAP (Isolated Stacking Context, Locked Viewport) */}
      <div className="absolute inset-0 z-0">
        <GoogleMapCanvas
          drivers={drivers}
          userLoc={driverGps}
          onUserLocate={(lat, lng) => handleDriverGpsChange(lat, lng)}
          onPickLocation={(lat, lng) => handleDriverGpsChange(lat, lng)}
          center={driverGps}
          zoom={15}
          heightClassName="h-full"
          showRouteToSelected={false}
          hideTopControls={true}
          hideInstructionPill={true}
        />
      </div>

      {/* TOP FLOATING CONTROLS BAR (Left Hamburger Menu, Center Driver Revenue Pill, Right Star Rating Circle) */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
        {/* Top-Left: Hamburger Menu Circle Button */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Mở menu tài xế"
          className="pointer-events-auto w-12 h-12 shrink-0 rounded-full bg-white/95 backdrop-blur-md shadow-[0_6px_20px_rgba(15,23,42,0.16)] border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer relative"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
          {(activeTasksCount > 0 || tasks.length > 0) && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
              {activeTasksCount || tasks.length}
            </span>
          )}
        </button>

        {/* Top-Center: Money Icon & Driver Revenue Pill */}
        <button
          type="button"
          onClick={() => navigate("/mobile-driver/wallet")}
          title={`Doanh thu tài xế (${completedCount} chuyến đã hoàn thành) — Chạm để xem Ví Thu Nhập`}
          className="pointer-events-auto px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-[0_6px_20px_rgba(15,23,42,0.16)] border border-slate-100 flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer min-w-0"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Banknote className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 block leading-none">
              Doanh thu
            </span>
            <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate block leading-tight mt-0.5">
              {totalEarnings.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </button>

        {/* Top-Right: Average Star Rating Circle Badge */}
        <button
          type="button"
          onClick={() => navigate("/mobile-driver/profile")}
          title={`Điểm đánh giá trung bình (${reviewCount} đánh giá)`}
          className="pointer-events-auto w-12 h-12 shrink-0 rounded-full bg-white/95 backdrop-blur-md shadow-[0_6px_20px_rgba(15,23,42,0.16)] border-2 border-slate-100 flex flex-col items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-0.5">
            <span className="text-[11px] font-black text-slate-900">
              {avgRating.toFixed(1)}
            </span>
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[9px] font-bold text-slate-400 leading-none mt-0.5">
            {completedCount}/8
          </span>
        </button>
      </div>

      {/* ACTIVE ONGOING TASK FLOATING BANNER (Positioned cleanly below top bar so it never collides with bottom controls) */}
      {activeTasksCount > 0 && (
        <div className="absolute top-19 left-3.5 right-3.5 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={() => navigate("/mobile-driver/active-task")}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-emerald-600/95 backdrop-blur-md text-white shadow-lg flex items-center justify-between gap-2 hover:bg-emerald-700 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0 text-left">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 leading-tight">
                  Đang thực hiện {activeTasksCount} chuyến giao nhận
                </p>
                <p className="text-xs font-black truncate">
                  Chạm để mở điều hướng Google Maps
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-white text-emerald-700 text-[11px] font-black shrink-0">
              Mở ngay
            </span>
          </button>
        </div>
      )}

      {/* BOTTOM-CENTER POWER BUTTON PILL ("Mở nhận chuyến" / "Đang nhận chuyến") */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={handleToggleOnline}
          className={`px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(15,23,42,0.35)] flex items-center gap-2 font-black text-sm sm:text-base transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
            isOnline
              ? "bg-[#1e232a] text-white border border-emerald-500/40"
              : "bg-[#1e232a] text-white hover:bg-slate-800"
          }`}
        >
          <Power
            className={`w-4 h-4 ${
              isOnline ? "text-emerald-400" : "text-white"
            }`}
          />
          <span>{isOnline ? "Đang nhận chuyến" : "Mở nhận chuyến"}</span>
          {isOnline && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          )}
        </button>
      </div>

      {/* SLIDE-OUT LEFT MENU DRAWER (Opened from Top-Left Hamburger Button) */}
      {isDrawerOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex animate-in fade-in duration-200">
          <div className="w-4/5 max-w-[300px] bg-white h-full shadow-2xl flex flex-col justify-between p-5 animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div className="space-y-5">
              {/* Driver Profile Header */}
              <div className="flex items-start justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 truncate">
                      {selectedDriver.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-500">
                      {selectedDriver.phone}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] border border-emerald-200">
                      {vehiclePlate}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Stats Summary */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 block">
                    Doanh thu
                  </span>
                  <span className="text-sm font-black text-emerald-900">
                    {totalEarnings.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-700 block">
                    Đánh giá sao
                  </span>
                  <span className="text-sm font-black text-amber-900 flex items-center gap-1">
                    {avgRating.toFixed(1)}
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </span>
                </div>
              </div>

              {/* Navigation Menu Items */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsTaskSheetOpen(true);
                  }}
                  className="w-full px-3.5 py-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <BellRing className="w-4 h-4 text-emerald-600" />
                    Đơn Đang Phát Sóng (≤ 1km)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                    {tasks.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate("/mobile-driver/active-task");
                  }}
                  className="w-full px-3.5 py-3 rounded-xl hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-blue-600" />
                    Chuyến Đang Giao Nhận
                  </span>
                  {activeTasksCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                      {activeTasksCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate("/mobile-driver/wallet");
                  }}
                  className="w-full px-3.5 py-3 rounded-xl hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2.5 cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  Ví Thu Nhập & Đối Soát Cước
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate("/mobile-driver/profile");
                  }}
                  className="w-full px-3.5 py-3 rounded-xl hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2.5 cursor-pointer"
                >
                  <CircleUser className="w-4 h-4 text-indigo-600" />
                  Hồ Sơ Cá Nhân & Phương Tiện
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleDriverLogout}
              className="w-full py-3 mt-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs flex items-center justify-center gap-2 border border-rose-200 cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng Xuất Tài Khoản Shipper</span>
            </button>
          </div>
          <div
            className="flex-1 h-full"
            onClick={() => setIsDrawerOpen(false)}
          />
        </div>
      )}

      {/* AVAILABLE BROADCAST ORDERS BOTTOM SHEET (Accessible from Menu Drawer) */}
      {isTaskSheetOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-slate-50 rounded-t-3xl max-h-[82%] flex flex-col shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200">
            <div className="p-4 bg-white rounded-t-3xl border-b border-slate-200 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Đơn Đang Phát Sóng Bán Kính 1km ({tasks.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Chiều lấy đồ: Khách ↔ Tài xế ≤ 1km · Chiều trả đồ: Cửa hàng ↔ Tài xế ≤ 1km
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTaskSheetOpen(false)}
                  className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTaskTypeFilter("all")}
                  className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                    taskTypeFilter === "all"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  Tất cả ({tasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskTypeFilter("pickup_from_customer")}
                  className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                    taskTypeFilter === "pickup_from_customer"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  Đi lấy đồ bẩn
                </button>
                <button
                  type="button"
                  onClick={() => setTaskTypeFilter("deliver_to_customer")}
                  className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                    taskTypeFilter === "deliver_to_customer"
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  Giao trả đồ sạch
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {tasks.map((task) => (
                <BroadcastTaskCard
                  key={task.id}
                  task={task}
                  acceptingId={acceptingId}
                  onAcceptTask={handleAcceptTask}
                  onSkipTask={(id) => handleSkipTask(id, "manual")}
                />
              ))}

              {tasks.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-black text-slate-900">
                    Hiện chưa có đơn mới trong bán kính 1km quanh bạn
                  </p>
                  <p className="text-xs text-slate-500">
                    Vị trí GPS hiện tại của bạn: {driverGps.lat.toFixed(4)}, {driverGps.lng.toFixed(4)}. Khi có đơn phát sóng cách bạn ≤ 1km, thông báo sẽ bật lên ngay lập tức.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
