import React from "react";
import { MapPin, Navigation, Store, User, ArrowRight, XCircle } from "lucide-react";
import { DeliveryTask } from "../../../../types";
import { ButtonCustom } from "../../../../components/ButtonCustom";

interface BroadcastTaskCardProps {
  task: DeliveryTask;
  acceptingId: string | null;
  onAcceptTask: (taskId: string) => void;
  onSkipTask?: (taskId: string) => void;
}

export const BroadcastTaskCard: React.FC<BroadcastTaskCardProps> = ({
  task,
  acceptingId,
  onAcceptTask,
  onSkipTask,
}) => {
  const isPickup = task.taskType === "pickup_from_customer";
  const dispatchDistKm = Number(
    isPickup
      ? (task as any).customerToDriverKm ?? (task as any).driverToPickupKm ?? 0.35
      : (task as any).storeToDriverKm ?? (task as any).driverToPickupKm ?? 0.35,
  ).toFixed(2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 transition-colors hover:border-emerald-300">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            <span
              className={`font-black ${
                isPickup ? "text-blue-600" : "text-emerald-600"
              }`}
            >
              {isPickup
                ? "Lấy đồ bẩn (Khách → Tiệm)"
                : "Giao đồ sạch (Tiệm → Khách)"}
            </span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span className="font-mono text-slate-500">Đơn #{task.orderId}</span>
          </div>
          <h4 className="font-black text-slate-900 text-sm truncate">
            {task.storeName}
          </h4>
          <p className="text-[11px] font-semibold text-teal-700">
            {isPickup
              ? `Cách khách đặt đơn: ${dispatchDistKm} km`
              : `Cách cửa hàng lấy đồ sạch: ${dispatchDistKm} km`}
          </p>
        </div>

        <div className="text-right font-mono shrink-0">
          <div className="text-base font-black text-emerald-600">
            +{(task.shippingFee + (task.tipAmount || 0)).toLocaleString("vi-VN")}đ
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-end gap-0.5">
            <Navigation className="w-3 h-3 text-blue-600" />
            <span>Lộ trình {task.distanceKm} km</span>
          </div>
        </div>
      </div>

      {/* Route From -> To */}
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          {isPickup ? (
            <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          ) : (
            <Store className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <span className="text-slate-400">Điểm lấy: </span>
            <strong className="text-slate-800 break-words">
              {isPickup
                ? `${task.customerName} — ${task.customerAddress}`
                : `${task.storeName} — ${task.storeAddress}`}
            </strong>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-slate-400">Điểm giao: </span>
            <strong className="text-slate-800 break-words">
              {isPickup
                ? `${task.storeName} (${task.storeAddress})`
                : `${task.customerName} (${task.customerAddress})`}
            </strong>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-1 text-[11px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-600 font-semibold">Khung giờ lấy đồ:</span>
            <strong className="text-blue-700">
              {task.pickupTime || "09:00 - 11:00"}
              {task.pickupDate
                ? ` (${task.pickupDate.split("-").reverse().join("/")})`
                : ""}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-600 font-semibold">Khung giờ trả đồ:</span>
            <strong className="text-emerald-700">
              {task.deliveryTime || "16:00 - 18:00"}
              {task.deliveryDate
                ? ` (${task.deliveryDate.split("-").reverse().join("/")})`
                : ""}
            </strong>
          </div>
        </div>

        {task.notes && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{task.notes}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {onSkipTask && (
          <button
            type="button"
            onClick={() => onSkipTask(task.id)}
            className="h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Bỏ qua</span>
          </button>
        )}
        <div className="flex-1">
          <ButtonCustom
            type="button"
            loading={acceptingId === task.id}
            onClick={() => onAcceptTask(task.id)}
            label="Nhận Chuyến Ngay (1-Chạm)"
            className="!h-11 !text-xs !bg-emerald-600 hover:!bg-emerald-700"
            textClassName="!text-xs"
          />
        </div>
      </div>
    </div>
  );
};
