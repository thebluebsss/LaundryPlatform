import React from "react";
import { MapPin, Star, Navigation, WashingMachine, Truck, MessageSquare } from "lucide-react";
import { LaundryStore } from "../../../../types";
import { ButtonCustom } from "../../../../components/ButtonCustom";

interface NearbyStoreCardProps {
  store: LaundryStore & { distanceKm?: number };
  onSelectStore: (store: LaundryStore) => void;
  onViewReviews?: (store: LaundryStore) => void;
}

export const NearbyStoreCard: React.FC<NearbyStoreCardProps> = ({
  store,
  onSelectStore,
  onViewReviews,
}) => {
  const statusLabel =
    store.status === "open"
      ? "Đang nhận đơn"
      : store.status === "busy"
        ? "Đang quá tải"
        : "Tạm đóng cửa";

  const statusColor =
    store.status === "open"
      ? "text-emerald-600"
      : store.status === "busy"
        ? "text-amber-600"
        : "text-rose-600";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 transition-colors hover:border-blue-300">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`font-bold ${statusColor}`}>{statusLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{store.code}</span>
            {store.distanceKm !== undefined && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-bold text-blue-600 flex items-center gap-0.5">
                  <Navigation className="w-3 h-3" />
                  {store.distanceKm} km
                </span>
              </>
            )}
          </div>
          <h4 className="font-black text-slate-900 text-sm truncate">
            {store.name}
          </h4>
          <p className="text-xs text-slate-500 flex items-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{store.address}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => onViewReviews && onViewReviews(store)}
          className="text-right shrink-0 p-1.5 -m-1.5 rounded-xl hover:bg-amber-50 transition-colors cursor-pointer"
          title="Xem đánh giá khách hàng từ bảng reviews"
        >
          <div className="flex items-center justify-end gap-1 text-xs font-black text-slate-900 font-mono">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{store.rating.toFixed(1)}</span>
          </div>
          <p className="text-[11px] text-blue-600 font-bold mt-0.5 flex items-center gap-0.5">
            <MessageSquare className="w-3 h-3" />
            <span>{store.reviewCount} đánh giá</span>
          </p>
        </button>
      </div>

      {/* Store Live Capacity Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono">
            <WashingMachine className="w-3.5 h-3.5 text-blue-600" />
            {store.activeMachinesCount} máy trống
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 font-mono">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            {store.activeShippersCount} shipper trực
          </span>
        </div>
        <span className="font-mono font-bold text-slate-800">
          {store.priceRange}
        </span>
      </div>

      <ButtonCustom
        type="button"
        disabled={store.status === "closed"}
        onClick={() => onSelectStore(store)}
        label={
          store.status === "closed"
            ? "Cửa Hàng Đang Đóng Cửa"
            : "Chọn Tiệm Này & Tạo Đơn Giặt →"
        }
        className="!h-11 !text-xs"
        textClassName="!text-xs"
      />
    </div>
  );
};
