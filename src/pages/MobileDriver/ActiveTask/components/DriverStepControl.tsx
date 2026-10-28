import React from "react";
import { Phone, MapPin, CheckCircle2, Bike, Store, User } from "lucide-react";
import { DeliveryTask } from "../../../../types";
import { ButtonCustom } from "../../../../components/ButtonCustom";

interface DriverStepControlProps {
  task: DeliveryTask;
  updatingId: string | null;
  onAdvanceStatus: (task: DeliveryTask, nextStatus: string) => void;
}

const STEP_LABELS: Record<
  string,
  {
    currentText: string;
    nextStatus: string;
    buttonLabel: string;
  }
> = {
  accepted: {
    currentText: "Đã nhận chuyến — Đang di chuyển tới điểm lấy",
    nextStatus: "arrived_pickup",
    buttonLabel: "Xác Nhận Đã Tới Điểm Lấy Hàng",
  },
  picking_up: {
    currentText: "Đang lấy giỏ đồ",
    nextStatus: "arrived_pickup",
    buttonLabel: "Xác Nhận Đã Tới Điểm Lấy Hàng",
  },
  arrived_pickup: {
    currentText: "Đã tới điểm lấy — Kiểm tra giỏ đồ niêm phong",
    nextStatus: "in_transit",
    buttonLabel: "Đã Nhận Giỏ Đồ · Bắt Đầu Giao Đi",
  },
  in_transit: {
    currentText: "Đang trên đường vận chuyển tới điểm đích",
    nextStatus: "completed",
    buttonLabel: "Xác Nhận Đã Bàn Giao Thành Công (Hoàn Tất)",
  },
};

export const DriverStepControl: React.FC<DriverStepControlProps> = ({
  task,
  updatingId,
  onAdvanceStatus,
}) => {
  const isPickup = task.taskType === "pickup_from_customer";
  const stepConfig = STEP_LABELS[task.status] || STEP_LABELS.accepted;

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
            +{(task.shippingFee + (task.tipAmount || 0)).toLocaleString("vi-VN")}đ
          </div>
        </div>
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

      {/* Customer Phone Call Action */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
        <div>
          <span className="text-slate-600">Khách hàng: </span>
          <strong className="text-slate-900">{task.customerName}</strong>
        </div>
        <a
          href={`tel:${task.customerPhone}`}
          className="font-mono font-black text-blue-600 flex items-center gap-1.5 hover:underline"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Gọi {task.customerPhone}</span>
        </a>
      </div>

      {/* Primary 1-Tap Progression Button */}
      <ButtonCustom
        type="button"
        loading={updatingId === task.id}
        onClick={() => onAdvanceStatus(task, stepConfig.nextStatus)}
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
