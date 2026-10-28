import React from "react";
import { Scale, ArrowRight, Sparkles, CheckCircle2, Clock } from "lucide-react";
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              Hàng Đợi Cân Đo & Phân Loại Đồ Giặt
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy trình chuẩn: Nhận giỏ đồ từ tài xế · Bóc tách từng dòng vải · Cân thực tế & gửi báo giá
            </p>
          </div>
          <button
            onClick={() => onGoToOrders()}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Xem tất cả ({orders.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            Tất cả đơn hàng trong ca đã được cân đo và xác nhận khối lượng thực tế.
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
                      <span className="font-mono font-black text-slate-900">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="font-bold text-slate-800">
                        {order.customerName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {order.phoneNumber}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{order.items?.length || 1} dòng đồ giặt</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Tạm tính:{" "}
                        <strong className="font-mono text-slate-700 tabular-nums">
                          {(order.estimatedSubtotal || order.subtotal || 0).toLocaleString("vi-VN")}đ
                        </strong>
                      </span>
                      {order.actualSubtotal ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            Thực tế:{" "}
                            <strong className="font-mono text-blue-600 tabular-nums">
                              {order.actualSubtotal.toLocaleString("vi-VN")}đ
                            </strong>
                          </span>
                        </>
                      ) : null}
                      {order.items?.some((i: any) => i.aiInspectionResult) && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-indigo-600 font-semibold inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Có ghi chú AI Vision
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${
                        order.weightConfirmStatus === "accepted"
                          ? "text-emerald-600"
                          : order.weightConfirmStatus === "waiting_customer"
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}
                    >
                      {order.weightConfirmStatus === "accepted" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Khách đã duyệt cân
                        </>
                      ) : order.weightConfirmStatus === "waiting_customer" ? (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Chờ khách xác nhận
                        </>
                      ) : (
                        <>
                          <Scale className="w-3.5 h-3.5" /> Chưa cân thực tế
                        </>
                      )}
                    </span>

                    <ButtonCustom
                      onClick={() => onGoToOrders(order.id)}
                      label={isWeighed ? "Cập Nhật Cân" : "Cân & Kiểm Đồ"}
                      isSecondary={isWeighed}
                      className="!h-9 !px-3.5 !w-auto !text-xs whitespace-nowrap shrink-0"
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
