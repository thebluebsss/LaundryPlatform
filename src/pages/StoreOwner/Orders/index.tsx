import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale,
  Search,
  Plus,
  Sparkles,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Star,
  MessageSquareReply,
} from "lucide-react";
import { useStoreOwnerOrders } from "./hook";
import { WeighAndInspectModal } from "./components/WeighAndInspectModal";
import { CreatePosOrderModal } from "./components/CreatePosOrderModal";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";
import { InputSelect } from "../../../components/InputSelect";
import { DialogConfirm } from "../../../components/DialogConfirm";
import { CustomPagination } from "../../../components/CustomPagination";
import { OrderStatus } from "../../../types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ lấy đồ",
  picking_up: "Tài xế đang lấy",
  sorting: "Đang phân loại / Chờ cân",
  waiting_confirm: "Chờ khách duyệt cân",
  washing: "Đang giặt sấy",
  ironing: "Đang ủi & đóng gói",
  delivering: "Đang giao trả khách",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const StoreOwnerOrders: React.FC = () => {
  const navigate = useNavigate();
  const {
    orders,
    reviewsMap,
    services,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    weightFilter,
    setWeightFilter,
    weighingOrder,
    setWeighingOrder,
    isPosModalOpen,
    setIsPosModalOpen,
    orderToDelete,
    setOrderToDelete,
    handleSaveWeighOrder,
    handleUpdateOrderStatus,
    handleCreatePosOrder,
    handleDeleteOrder,
    handleRunAiInspect,
    handleReplyOrderReview,
  } = useStoreOwnerOrders();

  const [replyOpenOrderId, setReplyOpenOrderId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const paginatedOrders = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
            <Scale className="w-4 h-4" />
            <span>Quản Lý Đơn Giặt · Bóc Tách Dòng Đồ & Cân Thực Tế</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            Danh Sách Đơn Giặt Tại Cửa Hàng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hỗ trợ đơn hàng nhiều chất liệu vải (Order_Details), đối chiếu cân nặng tạm tính & thực tế, tích hợp AI kiểm tra vải.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ButtonOutLine
            onClick={() => navigate("/store-owner/dashboard")}
            iconStart={<ArrowLeft className="w-4 h-4" />}
            label="Tổng Quan Tiệm"
            className="!w-auto !h-10 !px-4 whitespace-nowrap"
            textClassName="!text-xs"
          />
          <ButtonCustom
            onClick={() => setIsPosModalOpen(true)}
            iconStart={<Plus className="w-4 h-4" />}
            label="Tạo Đơn Tại Quầy (POS)"
            className="!w-auto !h-10 !px-4 whitespace-nowrap"
            textClassName="!text-xs"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-5">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Tìm kiếm đơn giặt
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Mã đơn (ORD-8821), tên khách, SĐT, địa chỉ..."
              className="w-full py-3 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="md:col-span-4">
          <InputSelect
            title="Trạng thái xác nhận cân nặng"
            value={weightFilter}
            options={[
              { value: "all", label: "Tất cả trạng thái cân" },
              { value: "not_weighed", label: "Chưa cân thực tế (Cần cân ngay)" },
              { value: "waiting_customer", label: "Chờ khách xác nhận trên App" },
              { value: "accepted", label: "Đã chốt cân thực tế" },
            ]}
            onChange={(e) => {
              setWeightFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="md:col-span-3">
          <InputSelect
            title="Tiến độ xử lý"
            value={statusFilter}
            options={[
              { value: "all", label: "Tất cả tiến độ" },
              { value: "pending", label: "Chờ lấy đồ" },
              { value: "sorting", label: "Đang phân loại / Chờ cân" },
              { value: "waiting_confirm", label: "Chờ khách duyệt cân" },
              { value: "washing", label: "Đang giặt sấy" },
              { value: "ironing", label: "Đang ủi & đóng gói" },
              { value: "delivering", label: "Đang giao trả khách" },
              { value: "completed", label: "Đã hoàn thành" },
            ]}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* High-Density Orders Table */}
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
              onClick={() => setIsPosModalOpen(true)}
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
                  <th className="py-3.5 px-4">Chi Tiết Dòng Đồ (Order_Details)</th>
                  <th className="py-3.5 px-4 text-right">Tạm Tính vs Thực Tế</th>
                  <th className="py-3.5 px-4">Trạng Thái Cân</th>
                  <th className="py-3.5 px-4">Tiến Độ Giặt</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
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

                      {/* Col 2: Multi-fabric items */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5 max-w-md">
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
                              {it.aiInspectionResult && (
                                <div className="text-[11px] text-indigo-600 flex items-center gap-1 mt-0.5">
                                  <Sparkles className="w-3 h-3 shrink-0" />
                                  <span className="truncate max-w-xs">
                                    {it.aiInspectionResult}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Customer Review Badge from `reviews` table */}
                          {reviewsMap[order.id] && (
                            <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-[11px]">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-black text-amber-800 flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  Khách đánh giá: Tiệm {reviewsMap[order.id].storeRating}★ · Shipper{" "}
                                  {reviewsMap[order.id].shipperRating}★
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyOpenOrderId(
                                      replyOpenOrderId === order.id ? null : order.id
                                    );
                                    setReplyText(reviewsMap[order.id].storeReply || "");
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
                                      await handleReplyOrderReview(order.id, replyText);
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
                              ? "Đã thanh toán"
                              : "Chờ thu tiền"}
                          </span>
                        </div>
                      </td>

                      {/* Col 4: Weighing Status */}
                      <td className="py-4 px-4">
                        <div
                          className={`text-xs font-bold flex items-center gap-1.5 ${
                            wStatus === "accepted"
                              ? "text-emerald-600"
                              : wStatus === "waiting_customer"
                              ? "text-amber-600"
                              : "text-rose-600"
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
                            handleUpdateOrderStatus(
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
                      </td>

                      {/* Col 6: Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <ButtonCustom
                            onClick={() => setWeighingOrder(order)}
                            label="Cân & Kiểm Đồ"
                            className="!w-auto !h-8 !px-3 !text-xs whitespace-nowrap"
                            textClassName="!text-xs"
                          />

                          {order.status === "ironing" && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(order, "delivering")
                              }
                              title="Gọi Shipper giao trả đồ sạch"
                              className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setOrderToDelete(order)}
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
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Weigh & AI Inspect Modal */}
      <WeighAndInspectModal
        order={weighingOrder}
        services={services}
        onClose={() => setWeighingOrder(null)}
        onSave={handleSaveWeighOrder}
        onRunAiInspect={handleRunAiInspect}
      />

      {/* Walk-in POS Order Modal */}
      <CreatePosOrderModal
        isOpen={isPosModalOpen}
        services={services}
        onClose={() => setIsPosModalOpen(false)}
        onCreate={handleCreatePosOrder}
      />

      {/* Delete Confirmation Dialog */}
      <DialogConfirm
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onSubmit={handleDeleteOrder}
        isDelete
        textTitle="Xác nhận xóa đơn giặt"
        textContent={`Bạn có chắc chắn muốn xóa đơn giặt #${orderToDelete?.id} của khách hàng "${orderToDelete?.customerName}" khỏi danh sách cửa hàng?`}
        textCancel="Hủy bỏ"
        textButton="Xóa đơn"
      />
    </div>
  );
};
