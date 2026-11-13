import React from "react";
import {
  MapPin,
  Star,
  Bike,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { LaundryStore } from "../../../types";

interface StoreBranchCardProps {
  store: LaundryStore & { distance?: number };
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onBookFromStore: (store: LaundryStore) => void;
}

export const StoreBranchCard: React.FC<StoreBranchCardProps> = ({
  store,
  index,
  isSelected,
  onSelect,
  onBookFromStore,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
        isSelected
          ? "bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20"
          : "bg-white border-slate-200/80 hover:border-blue-300 shadow-sm"
      }`}
    >
      {index === 0 && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-2xl flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          GẦN BẠN NHẤT
        </div>
      )}

      <div className="flex gap-3.5">
        <img
          src={
            store.image ||
            "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=300"
          }
          alt={store.name}
          className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                store.status === "open"
                  ? "bg-emerald-100 text-emerald-700"
                  : store.status === "busy"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
              }`}
            >
              {store.status === "open" ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              {store.status === "open"
                ? "Mở cửa đón đơn"
                : store.status === "busy"
                  ? "Đang tải cao"
                  : "Tạm đóng"}
            </span>

            {store.distance !== undefined && (
              <span className="text-[11px] font-black text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full">
                Cách {store.distance} km
              </span>
            )}
          </div>

          <h3 className="font-black text-slate-900 text-sm md:text-base mt-1 truncate">
            {store.name}
          </h3>

          <p className="text-xs text-slate-500 flex items-start gap-1 mt-1 line-clamp-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{store.address}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-slate-600 font-semibold">
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {store.rating || 5.0} ({store.reviewCount || 0})
          </span>
          <span className="flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 text-blue-500" />
            {store.activeShippersCount || 5} Shipper
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBookFromStore(store);
          }}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
        >
          Đặt Giặt Tại Đây
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
