import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Navigation,
  Radio,
  Bike,
  Play,
  Square,
  MapPin,
  Store,
  Gauge,
} from "lucide-react";
import { LaundryOrder, DriverLiveLocation, CourierDriver } from "../types";
import { GoogleMapCanvas } from "./GoogleMapCanvas";
import { laundryOrdersAPI } from "../services/api";
import { useRealtimeOrders } from "../utils/realtimeClient";

export interface OrderLiveGpsMapProps {
  order: LaundryOrder;
  heightClassName?: string;
  compact?: boolean;
}

const computeHaversineKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Number(
    (6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2)
  );
};

export const OrderLiveGpsMap: React.FC<OrderLiveGpsMapProps> = ({
  order,
  heightClassName = "h-[260px]",
  compact = false,
}) => {
  const customerCoords =
    order.customerCoordinates?.lat && order.customerCoordinates?.lng
      ? {
          lat: Number(order.customerCoordinates.lat),
          lng: Number(order.customerCoordinates.lng),
        }
      : { lat: 21.0285, lng: 105.8542 };

  const storeCoords =
    order.storeCoordinates?.lat && order.storeCoordinates?.lng
      ? {
          lat: Number(order.storeCoordinates.lat),
          lng: Number(order.storeCoordinates.lng),
        }
      : {
          lat: Number((customerCoords.lat + 0.008).toFixed(6)),
          lng: Number((customerCoords.lng + 0.006).toFixed(6)),
        };

  const isDeliveringToCustomer =
    order.status === "delivering" || order.status === "returning";

  const startPoint = isDeliveringToCustomer ? storeCoords : customerCoords;
  const targetPoint = isDeliveringToCustomer ? customerCoords : storeCoords;

  const [driverLoc, setDriverLoc] = useState<DriverLiveLocation>(() => {
    if (order.driverLocation?.lat && order.driverLocation?.lng) {
      return order.driverLocation;
    }
    return {
      lat: Number(((startPoint.lat + targetPoint.lat) / 2).toFixed(6)),
      lng: Number(((startPoint.lng + targetPoint.lng) / 2).toFixed(6)),
      speedKmh: 28,
      updatedAt: new Date().toISOString(),
      driverId: order.shipperId || "drv-live",
      driverName: order.shipperName || "Shipper Sạch Sẽ",
    };
  });

  const [isSimulatingStream, setIsSimulatingStream] = useState(false);
  const progressRef = useRef<number>(0.15);

  useEffect(() => {
    if (order.driverLocation?.lat && order.driverLocation?.lng) {
      setDriverLoc(order.driverLocation);
    }
  }, [order.driverLocation?.lat, order.driverLocation?.lng]);

  // Listen to real-time SSE GPS coordinates from driver
  useRealtimeOrders(
    useCallback(
      (event) => {
        if (
          event.type === "DRIVER_GPS_UPDATED" &&
          event.data?.orderId === order.id &&
          event.data?.driverLocation
        ) {
          setDriverLoc(event.data.driverLocation);
        }
      },
      [order.id]
    ),
    order.id
  );

  // Smooth Live GPS stream simulator (broadcasts real coordinates to server so Customer, Driver, and Store maps all move in sync)
  useEffect(() => {
    if (!isSimulatingStream) return;

    const timer = window.setInterval(async () => {
      progressRef.current += 0.08;
      if (progressRef.current > 0.98) {
        progressRef.current = 0.08;
      }
      const t = progressRef.current;
      const nextLat = Number(
        (startPoint.lat + (targetPoint.lat - startPoint.lat) * t).toFixed(6)
      );
      const nextLng = Number(
        (startPoint.lng + (targetPoint.lng - startPoint.lng) * t).toFixed(6)
      );
      const nextSpeed = Math.floor(24 + Math.random() * 11);

      const nextLoc: DriverLiveLocation = {
        lat: nextLat,
        lng: nextLng,
        speedKmh: nextSpeed,
        updatedAt: new Date().toISOString(),
        driverId: order.shipperId || "drv-live",
        driverName: order.shipperName || "Tài xế Sạch Sẽ",
      };

      setDriverLoc(nextLoc);

      try {
        await laundryOrdersAPI.updateDriverLocation(order.id, nextLoc);
      } catch {
        // non-blocking
      }
    }, 1800);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    isSimulatingStream,
    order.id,
    order.shipperId,
    order.shipperName,
    startPoint.lat,
    startPoint.lng,
    targetPoint.lat,
    targetPoint.lng,
  ]);

  const remainingKm = computeHaversineKm(
    driverLoc.lat,
    driverLoc.lng,
    targetPoint.lat,
    targetPoint.lng
  );
  const etaMinutes = Math.max(1, Math.round(remainingKm * 2.8));

  const storeMarker: any = {
    id: order.storeId || `store-${order.id}`,
    name: order.storeName || "Tiệm Giặt Sạch Sẽ",
    address: `${order.address}, ${order.district}`,
    district: order.district || "Hà Nội",
    lat: storeCoords.lat,
    lng: storeCoords.lng,
    status: "open",
    distanceKm: remainingKm,
  };

  const liveDriverMarker: CourierDriver = {
    id: driverLoc.driverId || order.shipperId || "drv-live",
    name: driverLoc.driverName || order.shipperName || "Tài xế Sạch Sẽ",
    phone: order.shipperPhone || "0911222333",
    storeId: order.storeId || "store-hn-hoankiem",
    storeName: order.storeName || "Tiệm Giặt Sạch Sẽ",
    vehicleType: "bike",
    rating: 5.0,
    completedOrders: 128,
    lat: driverLoc.lat,
    lng: driverLoc.lng,
    status: isDeliveringToCustomer ? "delivering" : "picking",
  };

  return (
    <div className="rounded-2xl bg-slate-900 text-white p-3.5 space-y-3 border border-slate-800">
      {/* Live GPS Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>LIVE GPS STREAM</span>
          </span>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Bike className="w-4 h-4 text-teal-400" />
            <span>{liveDriverMarker.name}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSimulatingStream(!isSimulatingStream)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
            isSimulatingStream
              ? "bg-rose-600 hover:bg-rose-500 text-white"
              : "bg-teal-600 hover:bg-teal-500 text-white"
          }`}
        >
          {isSimulatingStream ? (
            <>
              <Square className="w-3 h-3 fill-current" />
              <span>Dừng phát GPS mẫu</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Phát sóng xe di chuyển (Live)</span>
            </>
          )}
        </button>
      </div>

      {/* Telemetry Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/80">
          <div className="text-slate-400 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-teal-400" />
            <span>Cách điểm đích</span>
          </div>
          <div className="font-mono tabular-nums font-bold text-white text-xs mt-0.5">
            {remainingKm} km (~{etaMinutes} phút)
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/80">
          <div className="text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-emerald-400" />
            <span>Tốc độ & Tọa độ</span>
          </div>
          <div className="font-mono tabular-nums font-bold text-emerald-400 text-xs mt-0.5 truncate">
            {driverLoc.speedKmh || 28} km/h · {driverLoc.lat.toFixed(4)},{" "}
            {driverLoc.lng.toFixed(4)}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/80">
          <div className="text-slate-400 flex items-center gap-1">
            {isDeliveringToCustomer ? (
              <MapPin className="w-3 h-3 text-blue-400" />
            ) : (
              <Store className="w-3 h-3 text-amber-400" />
            )}
            <span>Chiều di chuyển</span>
          </div>
          <div className="font-bold text-white text-xs mt-0.5 truncate">
            {isDeliveringToCustomer
              ? "Tiệm → Giao nhà khách"
              : "Nhà khách → Về tiệm"}
          </div>
        </div>
      </div>

      {/* Live Map Canvas */}
      <GoogleMapCanvas
        stores={[storeMarker]}
        selectedStore={storeMarker}
        drivers={[liveDriverMarker]}
        userLoc={customerCoords}
        center={{ lat: driverLoc.lat, lng: driverLoc.lng }}
        zoom={compact ? 14 : 15}
        heightClassName={heightClassName}
        showRouteToSelected={true}
        hideInstructionPill={true}
      />
    </div>
  );
};
