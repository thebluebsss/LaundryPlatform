import React from "react";
import {
  Wallet,
  RefreshCw,
  CheckCircle2,
  Navigation,
  Star,
  Bike,
  MessageSquare,
} from "lucide-react";
import { useMobileDriverWallet } from "./hook";

export const MobileDriverWallet: React.FC = () => {
  const { completedTasks, driverReviews, stats, loading, fetchWalletTasks } =
    useMobileDriverWallet();

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Earnings & Driver Rating Summary Hero */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
            <Wallet className="w-4 h-4" />
            <span>Ví Thu Nhập & Uy Tín Tài Xế</span>
          </div>
          <button
            type="button"
            onClick={fetchWalletTasks}
            className="h-8 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Cập nhật</span>
          </button>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">
              Tổng thu nhập đã hoàn tất
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {stats.totalEarnings.toLocaleString("vi-VN")} VNĐ
            </div>
          </div>

          <div className="bg-amber-500/15 border border-amber-400/30 rounded-xl px-3 py-2 text-right">
            <div className="text-[10px] text-amber-300 font-bold uppercase">
              Điểm Tài Xế (`reviews`)
            </div>
            <div className="text-sm font-black text-amber-400 flex items-center justify-end gap-1 font-mono mt-0.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{stats.avgShipperRating.toFixed(1)} / 5.0</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs">
          <div>
            <div className="text-slate-400">Số chuyến xong</div>
            <div className="font-mono font-black text-white text-sm mt-0.5">
              {stats.completedCount} chuyến
            </div>
          </div>
          <div>
            <div className="text-slate-400">Cước vận chuyển</div>
            <div className="font-mono font-black text-white text-sm mt-0.5">
              {stats.totalShippingFee.toLocaleString("vi-VN")}đ
            </div>
          </div>
          <div>
            <div className="text-slate-400">Lượt đánh giá</div>
            <div className="font-mono font-black text-amber-400 text-sm mt-0.5">
              {stats.reviewCount} đánh giá
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews for Shipper/Driver from `reviews` collection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Nhận Xét Của Khách Hàng Về Tài Xế ({driverReviews.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Trích xuất trực tiếp trường `shipperRating` & `shipperComment` từ bảng `reviews`
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {driverReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/70 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-black text-slate-900">
                    {rev.shipperName || "Tài xế giao nhận"}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] font-bold text-blue-600">
                    Đơn #{rev.orderId}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.shipperRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                Khách hàng: <strong className="text-slate-700">{rev.customerName}</strong> ·{" "}
                <span>{rev.storeName}</span>
              </div>

              {rev.shipperComment ? (
                <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-emerald-100 leading-relaxed flex items-start gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>“{rev.shipperComment}”</span>
                </p>
              ) : (
                <p className="text-slate-500 italic">
                  Khách hàng chấm {rev.shipperRating} sao cho chuyến giao nhận.
                </p>
              )}
            </div>
          ))}

          {!loading && driverReviews.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              Chưa có nhận xét nào từ khách hàng.
            </div>
          )}
        </div>
      </div>

      {/* Completed Trips History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-black text-slate-900">
          Lịch Sử Bàn Giao Thành Công ({completedTasks.length})
        </h3>

        <div className="space-y-2.5">
          {completedTasks.map((task) => {
            const isPickup = task.taskType === "pickup_from_customer";
            return (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-mono font-bold text-slate-800">
                      #{task.orderId}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {isPickup
                        ? "Thu gom về tiệm"
                        : "Giao trả đồ sạch"}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 truncate">
                    {task.customerName} ↔ {task.storeName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Navigation className="w-3 h-3" />
                    <span>{task.distanceKm} km</span>
                  </div>
                </div>

                <div className="text-right font-mono shrink-0">
                  <div className="text-sm font-black text-emerald-600">
                    +
                    {(
                      task.shippingFee + (task.tipAmount || 0)
                    ).toLocaleString("vi-VN")}
                    đ
                  </div>
                  <div className="text-[11px] text-slate-400">Đã cộng ví</div>
                </div>
              </div>
            );
          })}

          {!loading && completedTasks.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              Chưa có chuyến hoàn tất nào trong phiên hiện tại.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
