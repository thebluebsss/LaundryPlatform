import React from "react";
import { useLocation } from "react-router-dom";
import { Bike, X, Banknote, Phone } from "lucide-react";
import { useMobileDriverRadar } from "../pages/MobileDriver/BroadcastRadar/hook";
import { getScopedToken } from "../utils/authStorage";

export const DriverIncomingOrderModal: React.FC = () => {
  const location = useLocation();
  const {
    isOnline,
    incomingAlertTask,
    acceptCountdown,
    acceptingId,
    handleAcceptTask,
    handleSkipTask,
  } = useMobileDriverRadar();

  const isDriverPage =
    location.pathname.startsWith("/mobile-driver") &&
    location.pathname !== "/mobile-driver/login";
  const isAuthenticated = Boolean(getScopedToken("driver"));

  if (!isDriverPage || !isAuthenticated || !isOnline || !incomingAlertTask) {
    return null;
  }

  const isPickupFromCustomer =
    incomingAlertTask.taskType !== "deliver_to_customer";

  const directionalDispatchKm = Number(
    isPickupFromCustomer
      ? (incomingAlertTask as any).customerToDriverKm ??
          (incomingAlertTask as any).driverToPickupKm ??
          0.35
      : (incomingAlertTask as any).storeToDriverKm ??
          (incomingAlertTask as any).driverToPickupKm ??
          0.35,
  ).toFixed(2);

  const routeDistanceKm = Number(incomingAlertTask.distanceKm || 1.2).toFixed(
    2,
  );

  const firstStopTitle = isPickupFromCustomer
    ? `Điểm lấy đồ — ${incomingAlertTask.customerName}`
    : incomingAlertTask.storeName;

  const firstStopAddress =
    incomingAlertTask.pickupAddress || incomingAlertTask.customerAddress;

  const secondStopTitle = isPickupFromCustomer
    ? incomingAlertTask.storeName
    : `Giao trả đồ sạch — ${incomingAlertTask.customerName}`;

  const secondStopAddress =
    incomingAlertTask.deliveryAddress || incomingAlertTask.storeAddress;

  const paymentLabel =
    (incomingAlertTask as any)?.paymentMethod === "vietqr"
      ? "VietQR"
      : "Tiền mặt";

  return (
    <div className="fixed top-0 left-0 right-0 bottom-[60px] z-50 bg-slate-950/35 backdrop-blur-2xs flex justify-center p-2 pointer-events-auto">
      <div className="w-full max-w-md h-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 select-none">
        {/* Top Header Bar: Service Icon + Name on Left, Close 'X' on Right */}
        <div className="bg-[#f1f3f2] px-4 py-3 flex items-center justify-between border-b border-slate-200/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#d3ece6] flex items-center justify-center text-[#00796b] shadow-2xs shrink-0">
              <Bike className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-base font-bold text-slate-900 block leading-tight truncate">
                Green Bike · Sạch Sẽ
              </span>
              <span className="text-[11px] font-semibold text-teal-700 block truncate">
                {isPickupFromCustomer
                  ? "Khách đặt lấy đồ giặt tận nhà (Bán kính ≤ 1km)"
                  : "Cửa hàng gọi trả đồ sạch cho khách (Bán kính ≤ 1km)"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSkipTask(incomingAlertTask.id, "manual")}
            title="Từ chối chuyến này (Chuyển cho tài xế khác)"
            className="p-2 rounded-full hover:bg-slate-200/70 text-slate-800 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <X className="w-6 h-6 stroke-[2]" />
          </button>
        </div>

        {/* Scrollable Middle Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Fare & Payment Method Block */}
          <div className="px-5 py-3.5 bg-white border-b-[6px] border-slate-100">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-base font-bold text-slate-900">
                Cước phí
              </span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {(
                  Number(incomingAlertTask.shippingFee) || 25000
                ).toLocaleString("vi-VN")}
                đ
              </span>
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs font-mono font-bold text-slate-400">
                Mã đơn: #{incomingAlertTask.orderId}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#4a4f55] text-white text-xs font-bold flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-white" />
                <span>{paymentLabel}</span>
              </span>
            </div>
          </div>

          {/* Directional Distance & 1 Stop Header */}
          <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-base sm:text-lg font-extrabold text-slate-900">
                {directionalDispatchKm}km • 1 điểm đến
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {isPickupFromCustomer
                  ? `Khoảng cách từ Khách đặt đơn tới bạn: ${directionalDispatchKm}km (Lộ trình giao: ${routeDistanceKm}km)`
                  : `Khoảng cách từ Cửa hàng tới bạn: ${directionalDispatchKm}km (Lộ trình giao: ${routeDistanceKm}km)`}
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Trong bán kính 1km
            </span>
          </div>

          {/* Route Timeline (Stop A -> Stop B) */}
          <div className="px-5 py-3.5 space-y-4">
            {/* Stop 1: Pickup Location */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-1 shrink-0">
                <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="w-[2px] h-12 bg-slate-300 my-1" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-extrabold text-slate-900 leading-snug break-words">
                  {firstStopTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed break-words">
                  {firstStopAddress}
                </p>
                {incomingAlertTask.customerPhone && (
                  <p className="text-xs font-mono font-bold text-teal-700 mt-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>LH: {incomingAlertTask.customerPhone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Stop 2: Dropoff Location */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-1 shrink-0">
                <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-extrabold text-slate-900 leading-snug break-words">
                  {secondStopTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed break-words">
                  {secondStopAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Teal "Nhận chuyến [20]" Button */}
        <div className="p-3.5 bg-white border-t border-slate-100 shrink-0">
          <button
            type="button"
            disabled={acceptingId === incomingAlertTask.id}
            onClick={() => handleAcceptTask(incomingAlertTask.id)}
            className="w-full py-3.5 px-6 rounded-full bg-[#1b858b] hover:bg-[#146e73] disabled:bg-slate-300 text-white font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>
              {acceptingId === incomingAlertTask.id
                ? "Đang nhận chuyến..."
                : "Nhận chuyến"}
            </span>
            <span className="px-3 py-0.5 rounded-full bg-white text-slate-900 text-base font-black min-w-[40px] text-center">
              {acceptCountdown}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
