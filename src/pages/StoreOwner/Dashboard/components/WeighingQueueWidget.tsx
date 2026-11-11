import React from "react";
import { ArrowRight } from "lucide-react";
import { LaundryOrder } from "../../../../types";
import { ButtonCustom } from "../../../../components/ButtonCustom";

interface WeighingQueueWidgetProps {
  orders: LaundryOrder[];
  onGoToOrders: (orderId?: string) => void;
}

export const WeighingQueueWidget: React.FC<WeighingQueueWidgetProps> = ({
  orders,
  onGoToOrders,
}) => {
  const queue = orders.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Đơn giặt gần đây cần kiểm & cân
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật khối lượng thực tế sau khi nhận đồ từ tài xế hoặc tại quầy
            </p>
          </div>
          <button
            onClick={() => onGoToOrders()}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Xem tất cả ({orders.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            Tất cả đơn hàng trong ca đã được cân và xác nhận khối lượng.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((order) => {
              const isWeighed =
                order.weightConfirmStatus === "waiting_customer" ||
                order.weightConfirmStatus === "accepted";

              return (
                <div
                  key={order.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-900 tabular-nums">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="font-semibold text-slate-800">
                        {order.customerName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {order.phoneNumber}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{order.items?.length || 1} món đồ</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Tạm tính:{" "}
                        <strong className="font-semibold text-slate-700 tabular-nums">
                          {(order.estimatedSubtotal || order.subtotal || 0).toLocaleString("vi-VN")}đ
                        </strong>
                      </span>
                      {order.actualSubtotal ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            Thực tế:{" "}
                            <strong className="font-semibold text-blue-600 tabular-nums">
                              {order.actualSubtotal.toLocaleString("vi-VN")}đ
                            </strong>
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-medium ${
                        order.weightConfirmStatus === "accepted"
                          ? "text-emerald-600"
                          : order.weightConfirmStatus === "waiting_customer"
                          ? "text-amber-600"
                          : "text-slate-500"
                      }`}
                    >
                      {order.weightConfirmStatus === "accepted"
                        ? "Đã chốt cân"
                        : order.weightConfirmStatus === "waiting_customer"
                        ? "Chờ khách duyệt"
                        : "Chưa cân"}
                    </span>

                    <ButtonCustom
                      onClick={() => onGoToOrders(order.id)}
                      label={isWeighed ? "Chi tiết" : "Cân đồ"}
                      isSecondary={isWeighed}
                      className="!h-8 !px-3 !w-auto !text-xs whitespace-nowrap shrink-0"
                      textClassName="!text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

