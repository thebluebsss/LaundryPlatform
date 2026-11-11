import React, { useState } from "react";
import {
  Phone,
  MapPin,
  CheckCircle2,
  Bike,
  Store,
  User,
  Navigation,
  Banknote,
  ExternalLink,
} from "lucide-react";
import { DeliveryTask } from "../../../../types";
import { ButtonCustom } from "../../../../components/ButtonCustom";
import { GoogleMapCanvas } from "../../../../components/GoogleMapCanvas";

interface DriverStepControlProps {
  task: DeliveryTask;
  updatingId: string | null;
  onAdvanceStatus: (
    task: DeliveryTask,
    nextStatus: string,
    codCollected?: boolean,
  ) => void;
}

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

const getStepConfig = (status: string, isPickup: boolean) => {
  if (status === "accepted" || status === "picking_up") {
    return {
      currentText: isPickup
        ? "Bước 1/3: Đã nhận chuyến · Đang di chuyển tới nhà khách lấy đồ"
        : "Bước 1/3: Đã nhận chuyến · Đang di chuyển tới tiệm nhận đồ sạch",
      nextStatus: "arrived_pickup",
      buttonLabel: isPickup
        ? "Xác Nhận Đã Tới Nhà Khách Hàng"
        : "Xác Nhận Đã Tới Tiệm Giặt Sấy",
    };
  }
  if (status === "arrived_pickup") {
    return {
      currentText: isPickup
        ? "Bước 2/3: Đã tới nhà khách · Chờ nhận túi đồ giặt"
        : "Bước 2/3: Đã tới tiệm giặt · Chờ nhận túi đồ sạch đi giao",
      nextStatus: "in_transit",
      buttonLabel: isPickup
        ? "Xác Nhận Đã Lấy Đồ Từ Khách · Bắt Đầu Về Tiệm"
        : "Xác Nhận Đã Nhận Đồ Sạch Từ Tiệm · Bắt Đầu Giao",
    };
  }
  return {
    currentText: isPickup
      ? "Bước 3/3: Đang vận chuyển đồ giặt về bàn giao cho tiệm"
      : "Bước 3/3: Đang trên đường giao trả đồ sạch tận nhà khách",
    nextStatus: "completed",
    buttonLabel: isPickup
      ? "Xác Nhận Đã Bàn Giao Đồ Cho Tiệm Giặt"
      : "Xác Nhận Đã Giao Trả Đồ Sạch Cho Khách Hàng",
  };
};

export const DriverStepControl: React.FC<DriverStepControlProps> = ({
  task,
  updatingId,
  onAdvanceStatus,
}) => {
  const isPickup = task.taskType === "pickup_from_customer";
  const stepConfig = getStepConfig(task.status, isPickup);
  const [codCollected, setCodCollected] = useState(true);
  const [showNavMap, setShowNavMap] = useState(true);

  const pickupCoords =
    task.pickupCoordinates?.lat && task.pickupCoordinates?.lng
      ? {
          lat: Number(task.pickupCoordinates.lat),
          lng: Number(task.pickupCoordinates.lng),
        }
      : { lat: 21.0285, lng: 105.8542 };

  const deliveryCoords =
    task.deliveryCoordinates?.lat && task.deliveryCoordinates?.lng
      ? {
          lat: Number(task.deliveryCoordinates.lat),
          lng: Number(task.deliveryCoordinates.lng),
        }
      : { lat: 21.0245, lng: 105.8515 };

  const calculatedRouteKm = computeHaversineKm(
    pickupCoords.lat,
    pickupCoords.lng,
    deliveryCoords.lat,
    deliveryCoords.lng,
  );
  const routeKm =
    calculatedRouteKm > 0 ? calculatedRouteKm : Number(task.distanceKm || 1.2);
  const estMinutes = Math.max(3, Math.round(routeKm * 3.5));

  // Google Maps turn-by-turn navigation URLs
  const navToPickupUrl = `https://www.google.com/maps/dir/?api=1&destination=${pickupCoords.lat},${pickupCoords.lng}&travelmode=two-wheeler`;
  const navFullRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${pickupCoords.lat},${pickupCoords.lng}&destination=${deliveryCoords.lat},${deliveryCoords.lng}&travelmode=two-wheeler`;

  const destinationMarkerStore: any = {
    id: task.storeId || `dest-${task.id}`,
    name: isPickup
      ? task.storeName
      : `Giao khách: ${task.customerName}`,
    address: isPickup ? task.storeAddress : task.customerAddress,
    district: "TP. Hà Nội",
    lat: deliveryCoords.lat,
    lng: deliveryCoords.lng,
    status: "open",
    distanceKm: routeKm,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`font-black ${
                isPickup ? "text-blue-600" : "text-emerald-600"
              }`}
            >
              {isPickup
                ? "Chiều thu gom (Nhà khách → Tiệm)"
                : "Chiều giao trả (Tiệm → Nhà khách)"}
            </span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span className="font-mono font-bold text-slate-600">
              #{task.orderId}
            </span>
          </div>
          <h4 className="font-black text-slate-900 text-sm mt-0.5">
            {stepConfig.currentText}
          </h4>
        </div>

        <div className="text-right font-mono shrink-0">
          <div className="text-xs text-slate-400">Cước phí chuyến</div>
          <div className="text-base font-black text-emerald-600">
            +
            {(task.shippingFee + (task.tipAmount || 0)).toLocaleString("vi-VN")}
            đ
          </div>
        </div>
      </div>

      {/* SP-UC4.2: Bản đồ điều hướng Google Maps trực tiếp & Nút mở Google Maps dẫn đường */}
      <div className="rounded-2xl bg-slate-900 text-white p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Navigation className="w-4 h-4" />
            <span>Bản Đồ Điều Hướng Google Maps ({routeKm} km)</span>
          </div>
          <button
            type="button"
            onClick={() => setShowNavMap(!showNavMap)}
            className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer font-bold"
          >
            {showNavMap ? "Thu gọn bản đồ" : "Mở bản đồ Google Maps"}
          </button>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between text-[11px] gap-2">
          <div className="truncate">
            <span className="text-slate-400">Lộ trình: </span>
            <span className="font-bold text-white">
              {isPickup
                ? `${task.customerAddress} → ${task.storeName}`
                : `${task.storeName} → ${task.customerAddress}`}
            </span>
          </div>
          <span className="font-mono text-emerald-400 font-bold shrink-0">
            ~{estMinutes} phút
          </span>
        </div>

        {showNavMap && (
          <div className="space-y-2.5 pt-0.5">
            <GoogleMapCanvas
              stores={[destinationMarkerStore]}
              selectedStore={destinationMarkerStore}
              userLoc={pickupCoords}
              center={
                task.status === "in_transit" ? deliveryCoords : pickupCoords
              }
              zoom={14}
              heightClassName="h-[250px]"
              showRouteToSelected={true}
            />

            {/* Direct 1-Tap Google Maps Turn-by-Turn Navigation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={navToPickupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Chỉ Đường Điểm Lấy Đồ (GG Maps)</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={navFullRouteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Chỉ Đường Điểm Giao Trả (GG Maps)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Pickup & Dropoff Stops */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            {isPickup ? (
              <User className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <Store className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>1. Điểm lấy giỏ đồ:</span>
          </div>
          <div className="font-black text-slate-900">
            {isPickup ? task.customerName : task.storeName}
          </div>
          <div className="text-slate-600 flex items-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{isPickup ? task.customerAddress : task.storeAddress}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            {isPickup ? (
              <Store className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <User className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>2. Điểm bàn giao:</span>
          </div>
          <div className="font-black text-slate-900">
            {isPickup ? task.storeName : task.customerName}
          </div>
          <div className="text-slate-600 flex items-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{isPickup ? task.storeAddress : task.customerAddress}</span>
          </div>
        </div>
      </div>

      {/* Liên hệ khách hàng hoặc chủ tiệm giặt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-100">
          <div>
            <span className="text-slate-600">Khách: </span>
            <strong className="text-slate-900">{task.customerName}</strong>
          </div>
          <a
            href={`tel:${task.customerPhone}`}
            className="font-mono font-black text-blue-600 flex items-center gap-1 hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{task.customerPhone}</span>
          </a>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <div>
            <span className="text-slate-600">Tiệm: </span>
            <strong className="text-slate-900">{task.storeName}</strong>
          </div>
          <a
            href="tel:0909123456"
            className="font-mono font-black text-emerald-700 flex items-center gap-1 hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Gọi Chủ Tiệm</span>
          </a>
        </div>
      </div>

      {/* SP-UC5.4: Xác nhận thu tiền mặt (COD) từ khách hàng */}
      {!isPickup && (
        <label className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer text-xs">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold text-slate-800">
              Xác nhận đã thu tiền mặt (COD) / Kiểm tra trạng thái thanh toán của
              khách
            </span>
          </div>
          <input
            type="checkbox"
            checked={codCollected}
            onChange={(e) => setCodCollected(e.target.checked)}
            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
          />
        </label>
      )}

      {/* Primary 1-Tap Progression Button */}
      <ButtonCustom
        type="button"
        loading={updatingId === task.id}
        onClick={() =>
          onAdvanceStatus(task, stepConfig.nextStatus, codCollected)
        }
        iconStart={
          stepConfig.nextStatus === "completed" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Bike className="w-4 h-4" />
          )
        }
        label={stepConfig.buttonLabel}
        className={`!h-11 !text-xs ${
          stepConfig.nextStatus === "completed"
            ? "!bg-emerald-600 hover:!bg-emerald-700"
            : ""
        }`}
        textClassName="!text-xs"
      />
    </div>
  );
};
