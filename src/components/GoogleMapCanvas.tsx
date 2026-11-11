import React, { useEffect, useRef, useState } from "react";
import {
  APIProvider,
  Map as GMap,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import L from "leaflet";
import { LaundryStore, CourierDriver } from "../types";
import {
  Navigation,
  Layers,
  ExternalLink,
  MapPin,
  LocateFixed,
} from "lucide-react";

export interface GoogleMapCanvasProps {
  stores?: (LaundryStore & { distance?: number; distanceKm?: number })[];
  drivers?: CourierDriver[];
  selectedStore?:
    | (LaundryStore & { distance?: number; distanceKm?: number })
    | null;
  onSelectStore?: (store: any) => void;
  userLoc?: { lat: number; lng: number } | null;
  onUserLocate?: (lat: number, lng: number) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  heightClassName?: string;
  showRouteToSelected?: boolean;
  pickedCoords?: { lat: number; lng: number } | null;
  onPickLocation?: (lat: number, lng: number) => void;
  hideTopControls?: boolean;
  hideInstructionPill?: boolean;
}

const ENV_GMAPS_KEY =
  ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ||
  "";

export const GoogleMapCanvas: React.FC<GoogleMapCanvasProps> = ({
  stores = [],
  drivers = [],
  selectedStore = null,
  onSelectStore,
  userLoc = null,
  onUserLocate,
  center = { lat: 21.0285, lng: 105.8542 },
  zoom = 13,
  heightClassName = "h-[460px]",
  showRouteToSelected = true,
  pickedCoords = null,
  onPickLocation,
  hideTopControls = false,
  hideInstructionPill = false,
}) => {
  const [mapType, setMapType] = useState<"roadmap" | "hybrid">("roadmap");
  const [sdkError, setSdkError] = useState(false);
  const [detectedUserLoc, setDetectedUserLoc] = useState<{
    lat: number;
    lng: number;
  } | null>(userLoc);
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const useInteractiveGoogleTileEngine = !ENV_GMAPS_KEY || sdkError;

  useEffect(() => {
    if (userLoc && userLoc.lat && userLoc.lng) {
      setDetectedUserLoc(userLoc);
    }
  }, [userLoc?.lat, userLoc?.lng]);

  // Built-in Google Maps "My Location" handler using browser Geolocation API
  const handleLocateCurrentPosition = () => {
    if (!("geolocation" in navigator)) {
      setGpsStatusMsg("Trình duyệt không hỗ trợ định vị GPS");
      setTimeout(() => setGpsStatusMsg(null), 3000);
      return;
    }

    setLocatingGps(true);
    setGpsStatusMsg("Đang xác định vị trí GPS hiện tại...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const coords = { lat, lng };
        setDetectedUserLoc(coords);
        setLocatingGps(false);
        setGpsStatusMsg(
          `Đã định vị GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        );
        setTimeout(() => setGpsStatusMsg(null), 3500);

        if (onUserLocate) {
          onUserLocate(lat, lng);
        }
        if (onPickLocation) {
          onPickLocation(lat, lng);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
        }
      },
      (err) => {
        setLocatingGps(false);
        setGpsStatusMsg(
          err.code === 1
            ? "Vui lòng cấp quyền Vị trí (Location) trên trình duyệt để lấy GPS"
            : "Không thể lấy tín hiệu GPS hiện tại"
        );
        setTimeout(() => setGpsStatusMsg(null), 4000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Initialize Google Maps Tile Engine (mt0-mt3.google.com/vt) with ResizeObserver
  useEffect(() => {
    if (!useInteractiveGoogleTileEngine || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = selectedStore
        ? [selectedStore.lat, selectedStore.lng]
        : pickedCoords
        ? [pickedCoords.lat, pickedCoords.lng]
        : detectedUserLoc
        ? [detectedUserLoc.lat, detectedUserLoc.lng]
        : [center.lat, center.lng];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter as [number, number],
        zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const lyrs = mapType === "hybrid" ? "y" : "m";
      const googleTileLayer = L.tileLayer(
        `https://mt1.google.com/vt/lyrs=${lyrs}&hl=vi&x={x}&y={y}&z={z}`,
        {
          maxZoom: 20,
          attribution: "&copy; Google Maps",
        }
      ).addTo(map);

      tileLayerRef.current = googleTileLayer;
      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 120);
    }

    const containerEl = mapContainerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(containerEl);

    return () => {
      resizeObserver.disconnect();
    };
  }, [useInteractiveGoogleTileEngine]);

  // Cleanup map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch between Google Maps Road (lyrs=m) and Google Satellite Hybrid (lyrs=y)
  useEffect(() => {
    if (!useInteractiveGoogleTileEngine || !mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const lyrs = mapType === "hybrid" ? "y" : "m";
    tileLayerRef.current = L.tileLayer(
      `https://mt1.google.com/vt/lyrs=${lyrs}&hl=vi&x={x}&y={y}&z={z}`,
      {
        maxZoom: 20,
        attribution: "&copy; Google Maps",
      }
    ).addTo(mapInstanceRef.current);
  }, [mapType, useInteractiveGoogleTileEngine]);

  // Handle click to pick GPS coordinates
  useEffect(() => {
    if (!useInteractiveGoogleTileEngine || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (onPickLocation) {
        onPickLocation(
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6))
        );
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [onPickLocation, useInteractiveGoogleTileEngine]);

  // Pan map when center or selectedStore or pickedCoords changes
  useEffect(() => {
    if (!useInteractiveGoogleTileEngine || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.invalidateSize();

    if (selectedStore && selectedStore.lat && selectedStore.lng) {
      map.setView([selectedStore.lat, selectedStore.lng], Math.max(zoom, 14), {
        animate: true,
      });
    } else if (pickedCoords && pickedCoords.lat && pickedCoords.lng) {
      map.setView([pickedCoords.lat, pickedCoords.lng], Math.max(zoom, 15), {
        animate: true,
      });
    } else if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    }
  }, [
    center.lat,
    center.lng,
    selectedStore?.id,
    pickedCoords?.lat,
    pickedCoords?.lng,
    zoom,
    useInteractiveGoogleTileEngine,
  ]);

  // Render Markers & Route Line on Google Maps Tile Engine
  useEffect(() => {
    if (
      !useInteractiveGoogleTileEngine ||
      !mapInstanceRef.current ||
      !markersGroupRef.current
    )
      return;

    const group = markersGroupRef.current;
    group.clearLayers();

    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    const activeUserLoc = detectedUserLoc;

    // 1. User Real GPS Location Marker (only rendered when real GPS is located)
    if (activeUserLoc && activeUserLoc.lat && activeUserLoc.lng) {
      const userIcon = L.divIcon({
        className: "gmap-user-pin",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:32px;height:32px;background:rgba(37,99,235,0.22);border-radius:9999px;position:absolute;animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:16px;height:16px;background:#2563eb;border:3px solid #ffffff;border-radius:9999px;box-shadow:0 2px 8px rgba(0,0,0,0.35);position:relative;z-index:10;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([activeUserLoc.lat, activeUserLoc.lng], { icon: userIcon })
        .addTo(group)
        .bindPopup(
          `<div style="font-family:sans-serif;padding:4px;">
            <strong style="color:#1e40af;font-size:12px;">Vị trí hiện tại của bạn (GPS)</strong>
            <div style="font-size:11px;color:#64748b;">Tọa độ: ${activeUserLoc.lat.toFixed(5)}, ${activeUserLoc.lng.toFixed(5)}</div>
          </div>`
        );
    }

    // 2. Picked Coordinate Marker (when picking store location)
    if (pickedCoords && pickedCoords.lat && pickedCoords.lng) {
      const pickIcon = L.divIcon({
        className: "gmap-pick-pin",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
            <div style="background:#dc2626;color:#fff;font-weight:800;font-size:11px;padding:4px 10px;border-radius:9999px;border:2px solid #fff;box-shadow:0 4px 12px rgba(220,38,38,0.4);white-space:nowrap;">
              Vị trí tiệm (${pickedCoords.lat.toFixed(4)}, ${pickedCoords.lng.toFixed(4)})
            </div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #dc2626;margin-top:-1px;"></div>
          </div>
        `,
        iconSize: [140, 42],
        iconAnchor: [0, 0],
      });
      L.marker([pickedCoords.lat, pickedCoords.lng], { icon: pickIcon }).addTo(
        group
      );
    }

    // 3. Store Markers
    stores.forEach((store) => {
      if (!store.lat || !store.lng) return;
      const isSelected = selectedStore?.id === store.id;
      const distVal = store.distance ?? store.distanceKm;
      const badgeColor =
        store.status === "open"
          ? "#10b981"
          : store.status === "busy"
          ? "#f59e0b"
          : "#ef4444";

      const storeIcon = L.divIcon({
        className: "gmap-store-pin",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:pointer;">
            <div style="padding:5px 10px;border-radius:9999px;font-weight:800;font-size:11px;display:flex;align-items:center;gap:6px;white-space:nowrap;box-shadow:0 6px 16px rgba(15,23,42,0.25);border:2px solid ${
              isSelected ? "#ffffff" : "#2563eb"
            };background:${isSelected ? "#2563eb" : "#0f172a"};color:#ffffff;">
              <span style="width:8px;height:8px;border-radius:9999px;background:${badgeColor};display:inline-block;"></span>
              <span>${store.name.split("-")[0].trim()}</span>
              ${
                distVal !== undefined
                  ? `<span style="background:rgba(255,255,255,0.2);padding:1px 6px;border-radius:9999px;font-size:10px;">${distVal}km</span>`
                  : ""
              }
            </div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${
              isSelected ? "#2563eb" : "#0f172a"
            };margin-top:-1px;"></div>
          </div>
        `,
        iconSize: [160, 42],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([store.lat, store.lng], { icon: storeIcon }).addTo(
        group
      );

      marker.on("click", () => {
        if (onSelectStore) onSelectStore(store);
      });
    });

    // 4. Driver Markers
    drivers.forEach((drv) => {
      if (!drv.lat || !drv.lng) return;
      const driverIcon = L.divIcon({
        className: "gmap-driver-pin",
        html: `
          <div style="width:28px;height:28px;border-radius:9999px;background:#059669;border:2px solid #ffffff;color:#ffffff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;box-shadow:0 4px 10px rgba(0,0,0,0.25);">
            🛵
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([drv.lat, drv.lng], { icon: driverIcon })
        .addTo(group)
        .bindPopup(
          `<div style="font-family:sans-serif;font-size:11px;">
            <strong>Shipper: ${drv.name}</strong><br/>
            <span>SĐT: ${drv.phone}</span>
          </div>`
        );
    });

    // 5. Route Polyline between User and Selected Store (only when real user GPS is known)
    if (
      showRouteToSelected &&
      activeUserLoc &&
      selectedStore &&
      selectedStore.lat &&
      selectedStore.lng
    ) {
      routeLineRef.current = L.polyline(
        [
          [activeUserLoc.lat, activeUserLoc.lng],
          [selectedStore.lat, selectedStore.lng],
        ],
        {
          color: "#2563eb",
          weight: 4,
          dashArray: "8, 8",
          opacity: 0.85,
        }
      ).addTo(mapInstanceRef.current);
    }
  }, [
    stores,
    drivers,
    selectedStore,
    detectedUserLoc,
    pickedCoords,
    showRouteToSelected,
    useInteractiveGoogleTileEngine,
  ]);

  const googleMapsExternalUrl = selectedStore
    ? `https://www.google.com/maps/dir/?api=1&destination=${selectedStore.lat},${selectedStore.lng}`
    : pickedCoords
    ? `https://www.google.com/maps/search/?api=1&query=${pickedCoords.lat},${pickedCoords.lng}`
    : `https://www.google.com/maps/@${center.lat},${center.lng},${zoom}z`;

  return (
    <div
      className={`relative isolate w-full ${heightClassName} rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs`}
    >
      {/* Top Overlay Bar: Google Maps Layer Switcher & External Directions Link */}
      {!hideTopControls && (
        <div className="absolute top-3 right-3 z-[400] flex items-center gap-2 flex-wrap justify-end">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-md flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMapType("roadmap")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                mapType === "roadmap"
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Bản đồ Google</span>
            </button>
            <button
              type="button"
              onClick={() => setMapType("hybrid")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                mapType === "hybrid"
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Vệ tinh
            </button>
          </div>

          <a
            href={googleMapsExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md hover:bg-blue-50 text-blue-700 border border-slate-200 shadow-md text-[11px] font-bold flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Mở Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Native Google Maps Floating "My Location" Crosshair Button (Bottom Right above Zoom Controls) */}
      <button
        type="button"
        onClick={handleLocateCurrentPosition}
        disabled={locatingGps}
        title="Định vị vị trí hiện tại của tôi trên Google Maps"
        className="absolute bottom-24 right-2.5 z-[400] bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-600 border border-slate-300 shadow-lg rounded-xl px-2.5 py-2 flex items-center gap-1.5 text-xs font-extrabold cursor-pointer transition-all active:scale-95"
      >
        <LocateFixed
          className={`w-4 h-4 text-blue-600 ${
            locatingGps ? "animate-spin" : ""
          }`}
        />
        <span className="hidden sm:inline">
          {locatingGps ? "Đang định vị..." : "Vị trí hiện tại"}
        </span>
      </button>

      {/* GPS Status Feedback Pill */}
      {gpsStatusMsg && (
        <div className="absolute top-16 left-3 z-[400] bg-slate-900/90 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-md">
          {gpsStatusMsg}
        </div>
      )}

      {/* Coordinate Picker Instruction Pill */}
      {onPickLocation && !hideInstructionPill && (
        <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 text-white px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 shadow-md pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>
            Chạm vào bản đồ hoặc bấm "Vị trí hiện tại" để lấy tọa độ GPS
          </span>
        </div>
      )}

      {!useInteractiveGoogleTileEngine ? (
        <APIProvider apiKey={ENV_GMAPS_KEY} onLoad={() => setSdkError(false)}>
          <GMap
            defaultCenter={center}
            defaultZoom={zoom}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapType}
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            gestureHandling="greedy"
            disableDefaultUI={false}
            onClick={(ev: any) => {
              if (onPickLocation && ev.detail?.latLng) {
                onPickLocation(
                  Number(ev.detail.latLng.lat.toFixed(6)),
                  Number(ev.detail.latLng.lng.toFixed(6))
                );
              }
            }}
          >
            {stores.map((store) => (
              <AdvancedMarker
                key={store.id}
                position={{ lat: store.lat, lng: store.lng }}
                onClick={() => onSelectStore && onSelectStore(store)}
              />
            ))}
            {selectedStore && (
              <InfoWindow
                position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
              >
                <div className="p-1 text-xs">
                  <div className="font-bold text-slate-900">
                    {selectedStore.name}
                  </div>
                  <div className="text-slate-600">{selectedStore.address}</div>
                </div>
              </InfoWindow>
            )}
          </GMap>
        </APIProvider>
      ) : (
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      )}
    </div>
  );
};
