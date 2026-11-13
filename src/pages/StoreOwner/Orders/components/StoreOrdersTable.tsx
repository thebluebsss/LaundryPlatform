import React, { useState } from "react";
import {
  Scale,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Star,
  MessageSquareReply,
  MessageSquare,
  Navigation,
  QrCode,
  RotateCcw,
  Coins,
} from "lucide-react";
import { LaundryOrder, OrderReview, OrderStatus } from "../../../../types";
import { ButtonCustom } from "../../../../components/ButtonCustom";
import { CustomPagination } from "../../../../components/CustomPagination";
import { ORDER_STATUS_LABELS } from "../../../../utils/orderStatusLabels";

const STATUS_LABELS: Record<string, string> = ORDER_STATUS_LABELS;

interface StoreOrdersTableProps {
  loading: boolean;
  orders: LaundryOrder[];
  paginatedOrders: LaundryOrder[];
  reviewsMap: Record<string, OrderReview>;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onOpenPosModal: () => void;
  onWeighOrder: (order: LaundryOrder) => void;
  onOpenChat: (order: LaundryOrder) => void;
  onOpenGps: (order: LaundryOrder) => void;
  onOpenPayment: (order: LaundryOrder) => void;
  onDeleteOrder: (order: LaundryOrder) => void;
  onBroadcastPickup: (order: LaundryOrder) => void;
  onBroadcastDelivery: (order: LaundryOrder) => void;
  onConfirmHandoverFromShipper: (order: LaundryOrder) => void;
  onUpdateOrderStatus: (order: LaundryOrder, status: OrderStatus) => void;
  onReplyOrderReview: (orderId: string, replyText: string) => Promise<void>;
}

export const StoreOrdersTable: React.FC<StoreOrdersTableProps> = ({
  loading,
  orders,
  paginatedOrders,
  reviewsMap,
  currentPage,
  pageSize,
  onPageChange,
  onOpenPosModal,
  onWeighOrder,
  onOpenChat,
  onOpenGps,
  onOpenPayment,
  onDeleteOrder,
  onBroadcastPickup,
  onBroadcastDelivery,
  onConfirmHandoverFromShipper,
  onUpdateOrderStatus,
  onReplyOrderReview,
}) => {
  const [replyOpenOrderId, setReplyOpenOrderId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Đang tải danh sách đơn giặt của cửa hàng...
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <p className="text-slate-500 text-sm font-semibold">
            Không có đơn giặt nào khớp với bộ lọc hiện tại.
          </p>
          <ButtonCustom
            onClick={onOpenPosModal}
            label="+ Tạo Đơn Giặt Đầu Tiên Tại Quầy"
            className="!w-auto !h-10 !px-5 mx-auto"
            textClassName="!text-xs"
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                <th className="py-3.5 px-4">Mã Đơn & Khách Hàng</th>
                <th className="py-3.5 px-4">Chi Tiết Đồ Giặt & Yêu Cầu</th>
                <th className="py-3.5 px-4 text-right">Tạm Tính vs Thực Tế</th>
                <th className="py-3.5 px-4">Trạng Thái Cân</th>
                <th className="py-3.5 px-4">Tiến Độ Giặt</th>
                <th className="py-3.5 px-4 text-right">Thao Tác Nghiệp Vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedOrders.map((order) => {
                const wStatus = order.weightConfirmStatus || "not_weighed";
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 transition-colors align-top"
                  >
                    {/* Col 1: Customer */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-black text-slate-900 text-xs">
                        #{order.id.toUpperCase()}
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {order.customerName}
                      </div>
                      <div className="font-mono text-slate-500 tabular-nums">
                        {order.phoneNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] truncate">
                        {order.address}, {order.district}
                      </div>
                    </td>

                    {/* Col 2: Multi-fabric items + Customer Special Request */}
                    <td className="py-4 px-4">
                      <div className="space-y-1.5 max-w-md">
                        {order.customerSpecialRequest && (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start justify-between gap-2">
                            <div className="flex items-start gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-black">
                                  Yêu cầu của khách:{" "}
                                </span>
                                <span className="font-semibold">
                                  “{order.customerSpecialRequest}”
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onWeighOrder(order)}
                              className="px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shrink-0 cursor-pointer"
                            >
                              + Phụ phí
                            </button>
                          </div>
                        )}

                        {(order.items || []).map((it: any, idx: number) => (
                          <div
                            key={idx}
                            className="text-xs text-slate-700 leading-snug"
                          >
                            <span className="font-bold text-slate-900">
                              {it.serviceName}
                            </span>{" "}
                            <span aria-hidden="true">·</span>{" "}
                            <span className="text-slate-600">
                              {it.fabricType || "Cotton hỗn hợp"}
                            </span>{" "}
                            <span aria-hidden="true">·</span>{" "}
                            <span className="font-mono tabular-nums text-slate-500">
                              Tạm tính: {it.estimatedQuantity ?? it.quantity}{" "}
                              {it.unitName}
                            </span>
                            {it.actualQuantity !== undefined &&
                              it.actualQuantity !== null && (
                                <>
                                  {" "}
                                  <span aria-hidden="true">→</span>{" "}
                                  <strong className="font-mono tabular-nums text-blue-600">
                                    Thực tế: {it.actualQuantity} {it.unitName}
                                  </strong>
                                </>
                              )}
                          </div>
                        ))}

                        {Number(order.extraFee || 0) > 0 && (
                          <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1 pt-0.5">
                            <Coins className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Phụ phí yêu cầu: +
                              {Number(order.extraFee).toLocaleString("vi-VN")}đ
                              {order.extraFeeReason
                                ? ` (${order.extraFeeReason})`
                                : ""}
                            </span>
                          </div>
                        )}

                        {reviewsMap[order.id] && (
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-black text-amber-800 flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                Khách đánh giá: Tiệm{" "}
                                {reviewsMap[order.id].storeRating}★ · Shipper{" "}
                                {reviewsMap[order.id].shipperRating}★
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyOpenOrderId(
                                    replyOpenOrderId === order.id
                                      ? null
                                      : order.id
                                  );
                                  setReplyText(
                                    reviewsMap[order.id].storeReply || ""
                                  );
                                }}
                                className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <MessageSquareReply className="w-3 h-3" />
                                <span>
                                  {reviewsMap[order.id].storeReply
                                    ? "Sửa phản hồi"
                                    : "Phản hồi khách"}
                                </span>
                              </button>
                            </div>
                            {reviewsMap[order.id].storeComment && (
                              <p className="text-slate-700">
                                “{reviewsMap[order.id].storeComment}”
                              </p>
                            )}
                            {reviewsMap[order.id].storeReply &&
                              replyOpenOrderId !== order.id && (
                                <div className="text-blue-700 bg-blue-50/80 border border-blue-200/60 px-2 py-1 rounded-lg">
                                  <strong>Chủ tiệm phản hồi:</strong>{" "}
                                  {reviewsMap[order.id].storeReply}
                                </div>
                              )}
                            {replyOpenOrderId === order.id && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Nhập phản hồi của cửa hàng..."
                                  className="flex-1 h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await onReplyOrderReview(
                                      order.id,
                                      replyText
                                    );
                                    setReplyOpenOrderId(null);
                                  }}
                                  className="h-8 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
                                >
                                  Gửi
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Col 3: Financials */}
                    <td className="py-4 px-4 text-right font-mono tabular-nums">
                      <div className="text-slate-500">
                        Tạm:{" "}
                        {(
                          order.estimatedSubtotal ||
                          order.subtotal ||
                          0
                        ).toLocaleString("vi-VN")}
                        đ
                      </div>
                      {Number(order.extraFee || 0) > 0 && (
                        <div className="text-[11px] text-amber-700 font-bold">
                          Phụ phí: +
                          {Number(order.extraFee).toLocaleString("vi-VN")}đ
                        </div>
                      )}
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        Tổng: {(order.totalPrice || 0).toLocaleString("vi-VN")}đ
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {order.paymentMethod?.toUpperCase() || "VIETQR"} ·{" "}
                        <span
                          className={
                            order.paymentStatus === "paid"
                              ? "text-emerald-600 font-bold"
                              : "text-amber-600 font-bold"
                          }
                        >
                          {order.paymentStatus === "paid"
                            ? "Đã đối soát"
                            : "Chờ thu tiền"}
                        </span>
                      </div>
                      {order.paymentTransactionId && (
                        <div className="text-[10px] text-teal-700 font-bold mt-0.5">
                          GD: {order.paymentTransactionId}
                        </div>
                      )}
                    </td>

                    {/* Col 4: Weighing Status */}
                    <td className="py-4 px-4">
                      <div
                        className={`text-xs font-bold flex items-center gap-1.5 ${
                          wStatus === "accepted"
                            ? "text-emerald-600"
                            : wStatus === "waiting_customer"
                              ? "text-amber-600"
                              : wStatus === "rejected_return"
                                ? "text-rose-600"
                                : "text-slate-600"
                        }`}
                      >
                        {wStatus === "accepted" ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Đã chốt cân</span>
                          </>
                        ) : wStatus === "waiting_customer" ? (
                          <>
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>Chờ khách duyệt</span>
                          </>
                        ) : wStatus === "rejected_return" ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                            <span>Khách từ chối cân</span>
                          </>
                        ) : (
                          <>
                            <Scale className="w-3.5 h-3.5 shrink-0" />
                            <span>Chưa cân thực tế</span>
                          </>
                        )}
                      </div>
                      {order.actualWeighedAt && (
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-1">
                          Cân lúc:{" "}
                          {new Date(order.actualWeighedAt).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </div>
                      )}
                    </td>

                    {/* Col 5: Stage Selector */}
                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onUpdateOrderStatus(
                            order,
                            e.target.value as OrderStatus
                          )
                        }
                        className="py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                      {order.shipperName && (
                        <div className="text-[11px] text-emerald-700 font-bold mt-1">
                          Shipper: {order.shipperName}
                        </div>
                      )}
                    </td>

                    {/* Col 6: Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {order.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => onBroadcastPickup(order)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                            title="Phát sóng yêu cầu tìm Shipper lấy đồ tận nhà"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Tìm Shipper Lấy Đồ</span>
                          </button>
                        )}

                        {order.status === "picking_up" && (
                          <button
                            type="button"
                            onClick={() => onConfirmHandoverFromShipper(order)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                            title="Xác nhận Shipper đã bàn giao đồ cho tiệm & mở bảng cân thực tế"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>Nhận Đồ & Cân Ngay</span>
                          </button>
                        )}

                        {order.status === "washing" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateOrderStatus(order, "ironing")
                              }
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                              title="Chuyển sang khâu Ủi hơi nước & Đóng gói"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Xong Giặt → Ủi Đồ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onBroadcastDelivery(order)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                              title="Hoàn thành quy trình giặt & Phát sóng tìm Shipper giao trả đồ sạch cho khách"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Tìm Shipper Giao Trả Đồ</span>
                            </button>
                          </>
                        )}

                        {(order.status === "ironing" ||
                          order.status === "delivering") && (
                          <button
                            type="button"
                            onClick={() => onBroadcastDelivery(order)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                            title="Phát sóng tìm Shipper đến tiệm nhận đồ sạch giao trả tận nhà khách"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>
                              {order.status === "delivering"
                                ? "Phát Lại Sóng Tìm Shipper Giao Đồ"
                                : "Tìm Shipper Giao Trả Đồ"}
                            </span>
                          </button>
                        )}

                        {(order.status === "returning" ||
                          wStatus === "rejected_return") && (
                          <button
                            type="button"
                            onClick={() => onBroadcastDelivery(order)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                            title="Phát sóng tìm Shipper hoàn trả đồ về cho khách"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Tìm Shipper Hoàn Trả Đồ</span>
                          </button>
                        )}

                        <ButtonCustom
                          onClick={() => onWeighOrder(order)}
                          label="Cân & Kiểm Đồ"
                          className="!w-auto !h-8 !px-3 !text-xs whitespace-nowrap"
                          textClassName="!text-xs"
                        />

                        {/* Live GPS Button */}
                        {Boolean(
                          (order.shipperId && order.shipperId.trim()) ||
                            (order.shipperName && order.shipperName.trim())
                        ) && (
                          <button
                            type="button"
                            onClick={() => onOpenGps(order)}
                            className="h-8 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Xem vị trí tài xế di chuyển thời gian thực (Live GPS)"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Live GPS</span>
                          </button>
                        )}

                        {/* In-App Order Chat Button (Disabled if no driver accepted yet) */}
                        {(() => {
                          const hasDriverAssigned = Boolean(
                            (order.shipperId && order.shipperId.trim()) ||
                              (order.shipperName && order.shipperName.trim())
                          );
                          return (
                            <button
                              type="button"
                              disabled={!hasDriverAssigned}
                              onClick={() =>
                                hasDriverAssigned && onOpenChat(order)
                              }
                              className={`h-8 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                                hasDriverAssigned
                                  ? "bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200 cursor-pointer"
                                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                              }`}
                              title={
                                hasDriverAssigned
                                  ? "Mở kênh Chat nội bộ theo mã đơn (Khách - Tài xế - Tiệm)"
                                  : "Chưa có tài xế nhận chuyến nên chưa thể nhắn tin"
                              }
                            >
                              <MessageSquare
                                className={`w-3.5 h-3.5 ${
                                  hasDriverAssigned
                                    ? "text-teal-600"
                                    : "text-slate-400"
                                }`}
                              />
                              <span>
                                {hasDriverAssigned ? "Chat" : "Chờ TX nhận"}
                              </span>
                              {hasDriverAssigned &&
                                Array.isArray(order.messages) &&
                                order.messages.length > 0 && (
                                  <span className="px-1.5 py-0.2 rounded bg-teal-600 text-white font-mono text-[10px] font-black">
                                    {order.messages.length}
                                  </span>
                                )}
                            </button>
                          );
                        })()}

                        {/* Electronic Payment & Auto-Reconciliation Button */}
                        {order.paymentStatus !== "paid" &&
                          order.status !== "cancelled" && (
                            <button
                              type="button"
                              onClick={() => onOpenPayment(order)}
                              className="h-8 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Cổng thanh toán điện tử & Đối soát tự động Webhook"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Đối Soát QR</span>
                            </button>
                          )}

                        <button
                          onClick={() => onDeleteOrder(order)}
                          title="Xóa đơn hàng"
                          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {orders.length > pageSize && (
        <div className="p-4 border-t border-slate-100 flex justify-end">
          <CustomPagination
            totalItems={orders.length}
            itemsPerPage={pageSize}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
