import React from "react";
import {
  RefreshCw,
  CheckCircle2,
  Star,
} from "lucide-react";
import { useMobileDriverWallet } from "./hook";

export const MobileDriverWallet: React.FC = () => {
  const { completedTasks, driverReviews, stats, loading, fetchWalletTasks } =
    useMobileDriverWallet();

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Clean Earnings & Rating Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Tổng thu nhập đã nhận
            </p>
            <h2 className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight mt-0.5">
              {stats.totalEarnings.toLocaleString("vi-VN")}đ
            </h2>
          </div>

          <button
            type="button"
            onClick={fetchWalletTasks}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-500">Đã hoàn thành</div>
            <div className="text-sm font-semibold text-slate-900 tabular-nums mt-0.5">
              {stats.completedCount} chuyến
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Cước vận chuyển</div>
            <div className="text-sm font-semibold text-emerald-700 tabular-nums mt-0.5">
              {stats.totalShippingFee.toLocaleString("vi-VN")}đ
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Đánh giá sao</div>
            <div className="text-sm font-semibold text-slate-900 tabular-nums flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span>{stats.avgShipperRating.toFixed(1)}</span>
              <span className="text-xs font-normal text-slate-400">
                ({stats.reviewCount})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Trips History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Lịch sử chuyến giao nhận ({completedTasks.length})
          </h3>
        </div>

        {completedTasks.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {completedTasks.map((task) => {
              const isPickup = task.taskType === "pickup_from_customer";
              return (
                <div
                  key={task.id}
                  className="py-3 first:pt-1 last:pb-0 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-700 tabular-nums">
                        #{task.orderId}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {isPickup ? "Lấy đồ giặt" : "Giao trả đồ sạch"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{task.distanceKm} km</span>
                    </div>
                    <div className="font-medium text-slate-900 truncate">
                      {task.customerName} — {task.storeName}
                    </div>
                  </div>

                  <div className="text-right tabular-nums shrink-0">
                    <div className="text-sm font-semibold text-emerald-600">
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
          </div>
        ) : (
          !loading && (
            <div className="py-6 text-center text-xs text-slate-400">
              Chưa có chuyến hoàn tất nào trong phiên làm việc này.
            </div>
          )
        )}
      </div>

      {/* Customer Reviews for Driver */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Nhận xét từ khách hàng ({driverReviews.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Đánh giá của khách hàng sau khi hoàn tất chuyến giao nhận
          </p>
        </div>

        {driverReviews.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {driverReviews.map((rev) => (
              <div
                key={rev.id}
                className="py-3 first:pt-1 last:pb-0 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {rev.customerName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums text-slate-500">
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
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  {rev.storeName}
                </div>

                {rev.shipperComment ? (
                  <p className="text-slate-700 leading-relaxed pt-0.5">
                    “{rev.shipperComment}”
                  </p>
                ) : (
                  <p className="text-slate-400">
                    Khách hàng đánh giá {rev.shipperRating} sao.
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="py-6 text-center text-xs text-slate-400">
              Chưa có nhận xét nào từ khách hàng.
            </div>
          )
        )}
      </div>
    </div>
  );
};

