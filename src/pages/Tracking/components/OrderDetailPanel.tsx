import React from "react";
import {
  Clock,
  MapPin,
  Phone,
  User,
  CalendarCheck,
  PackageX,
  PlusCircle,
} from "lucide-react";
import { LaundryOrder, OrderStatus } from "../../../types";
import { Box, Button } from "@mui/material";

interface OrderDetailPanelProps {
  selectedOrder: LaundryOrder;
  statuses: {
    value: OrderStatus;
    label: string;
    desc: string;
    icon: any;
    color: string;
  }[];
  handleCancelOrder: (id: string) => void;
  handleUpdateOrderStatus: (id: string, status: OrderStatus) => void;
}

export const OrderDetailPanel = ({
  selectedOrder,
  statuses,
  handleCancelOrder,
  handleUpdateOrderStatus,
}: OrderDetailPanelProps) => {
  const getStatusStepIndex = (status: OrderStatus) => {
    if (status === "cancelled") return -1;
    return statuses.findIndex((s) => s.value === status);
  };

  const currentStepIdx = getStatusStepIndex(selectedOrder.status);

  const formatPrice = (num: number) => {
    return num.toLocaleString("vi-VN") + " đ";
  };

  return (
    <Box
      id="tracking-detail-panel"
      className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6"
    >
      {/* Header review */}
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-slate-100 gap-4">
        <Box>
          <Box className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full tracking-wider inline-block">
              Vị trí vận đơn: #{selectedOrder.id.toUpperCase()}
            </span>
            {selectedOrder.status === "cancelled" && (
              <span className="text-[10px] font-black uppercase bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded tracking-wider inline-block">
                Đã hủy
              </span>
            )}
          </Box>
          <h3 className="text-base md:text-lg font-black text-slate-800 m-0 mt-2">
            Mã Vận Đơn: {selectedOrder.customerName}
          </h3>
          <p className="text-xs text-slate-400 m-0 mt-1 flex items-center gap-1.5">
            <Clock style={{ width: "14px", height: "14px" }} />
            Yêu cầu lập:{" "}
            {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")} lúc{" "}
            {new Date(selectedOrder.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </Box>

        {selectedOrder.status !== "completed" &&
          selectedOrder.status !== "cancelled" && (
            <Button
              onClick={() => {
                if (
                  window.confirm(
                    "Quý khách có thực sự muốn hủy đơn hẹn giặt là này không?",
                  )
                ) {
                  handleCancelOrder(selectedOrder.id);
                }
              }}
              variant="outlined"
              sx={{
                py: 0.8,
                px: 2,
                fontSize: "11px",
                fontStyle: "normal",
                fontWeight: "700",
                fontFamily: "var(--font-sans)",
                textTransform: "none",
                borderRadius: "12px",
                color: "error.main",
                borderColor: "error.light",
                "&:hover": {
                  bgcolor: "error.50",
                  borderColor: "error.main",
                },
              }}
            >
              Hủy đặt lịch này
            </Button>
          )}
      </Box>

      {/* Vertical timeline visualization */}
      {selectedOrder.status === "cancelled" ? (
        <Box className="p-8 text-center bg-rose-50/30 border border-rose-100 rounded-2xl flex flex-col items-center gap-4 text-slate-650">
          <PackageX
            style={{
              width: "44px",
              height: "44px",
              color: "#f43f5e",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          <Box>
            <h4 className="text-sm font-bold text-slate-800 m-0">
              Đơn hàng này đã bị hủy bỏ
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed m-0 mt-1.5">
              Đơn dịch vụ đã được ghi nhận tình trạng hủy. Sự cố này thường do
              lỗi đặt trùng lặp thời gian hoặc điều chỉnh quần áo trực tiếp. Nếu
              có thắc mắc, vui lòng liên hệ hotline tổng đài hỗ trợ 24/7.
            </p>
          </Box>
        </Box>
      ) : (
        <Box>
          <Box className="relative border-l border-slate-100 pl-8 ml-3 flex flex-col gap-6">
            {statuses.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <Box key={step.value} className="relative">
                  <Box
                    className={`absolute -left-[45px] top-[2px] w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isCurrent
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 animate-pulse"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <Icon style={{ width: "12px", height: "12px" }} />
                  </Box>

                  <Box className="flex flex-col gap-1">
                    <div
                      className={`text-xs md:text-sm font-bold transition-colors flex items-center gap-2 ${
                        isDone
                          ? "text-slate-400 line-through font-normal"
                          : isCurrent
                            ? "text-blue-600"
                            : "text-slate-700"
                      }`}
                    >
                      <span>{step.label}</span>
                      {isCurrent && (
                        <span className="text-[8px] font-black tracking-wider uppercase bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">
                          Đang thực hiện
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal m-0 max-w-lg">
                      {step.desc}
                    </p>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Sub garment lists receipt content */}
      <Box className="border-t border-slate-100 pt-5 flex flex-col gap-4">
        <h4 className="text-[11px] font-black text-slate-450 text-slate-400 uppercase tracking-widest flex items-center gap-1.5 m-0 header-title">
          <CalendarCheck
            style={{ width: "16px", height: "16px", color: "#94a3b8" }}
          />
          Thông tin chi tiết gói vận đơn
        </h4>

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="flex flex-col gap-2.5 p-4 bg-slate-50 border border-slate-200/40 rounded-2xl">
            <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200/50 m-0 mb-1">
              Giao Nhận Tại Nhà
            </h5>
            <p className="flex items-center gap-2 text-xs text-slate-600 m-0 leading-relaxed">
              <User
                style={{
                  width: "14px",
                  height: "14px",
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              />
              Người đặt:{" "}
              <span className="font-semibold text-slate-800">
                {selectedOrder.customerName}
              </span>
            </p>
            <p className="flex items-center gap-2 text-xs text-slate-600 m-0 leading-relaxed">
              <Phone
                style={{
                  width: "14px",
                  height: "14px",
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              />
              Điện thoại:{" "}
              <span className="font-semibold text-slate-800">
                {selectedOrder.phoneNumber}
              </span>
            </p>
            <p className="flex items-start gap-2 text-xs text-slate-600 m-0 leading-relaxed">
              <MapPin
                style={{
                  width: "14px",
                  height: "14px",
                  color: "#94a3b8",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              />
              <span>
                Địa chỉ gom:{" "}
                <span className="font-semibold text-slate-800">
                  {selectedOrder.address}, {selectedOrder.district}
                </span>
              </span>
            </p>
          </Box>

          <Box className="flex flex-col gap-2.5 p-4 bg-slate-50 border border-slate-200/40 rounded-2xl">
            <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200/50 m-0 mb-1">
              Thời Gian Khớp Lịch
            </h5>
            <p className="text-xs text-slate-600 m-0 leading-relaxed">
              Thu gom:{" "}
              <span className="font-semibold text-slate-800">
                {selectedOrder.pickupTime}
              </span>{" "}
              ngày{" "}
              <span className="font-semibold text-slate-800">
                {new Date(selectedOrder.pickupDate).toLocaleDateString("vi-VN")}
              </span>
            </p>
            <p className="text-xs text-slate-600 m-0 leading-relaxed">
              Trả sạch:{" "}
              <span className="font-semibold text-slate-800">
                {selectedOrder.deliveryTime}
              </span>{" "}
              ngày{" "}
              <span className="font-semibold text-slate-800">
                {new Date(selectedOrder.deliveryDate).toLocaleDateString(
                  "vi-VN",
                )}
              </span>
            </p>
            {selectedOrder.notes && (
              <div className="text-[11px] text-orange-700 bg-orange-50/50 border border-orange-100/40 p-2.5 rounded-xl leading-normal font-medium mt-1">
                <strong>Ghi chú thợ:</strong> &ldquo;{selectedOrder.notes}
                &rdquo;
              </div>
            )}
          </Box>
        </Box>

        {/* Pricing and list checkout */}
        <Box className="border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
          <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider m-0">
            Sản phẩm & dịch vụ bao gồm
          </h5>

          {/* Core services */}
          {selectedOrder.items && selectedOrder.items.length > 0 && (
            <Box className="flex flex-col gap-2">
              {selectedOrder.items.map((item) => (
                <Box
                  key={item.serviceId}
                  className="flex justify-between items-center text-xs pb-1.5 border-b border-dashed border-slate-100/80 last:border-0 last:pb-0"
                >
                  <span className="text-slate-600">
                    {item.serviceName}{" "}
                    <span className="text-slate-400">
                      ({item.quantity} {item.unitName})
                    </span>
                  </span>
                  <span className="font-bold text-slate-850 text-slate-800">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </Box>
              ))}
            </Box>
          )}

          {/* Purchased Utility Products */}
          {selectedOrder.products && selectedOrder.products.length > 0 && (
            <Box className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" />
                SẢN PHẨM MUA KÈM:
              </span>
              {selectedOrder.products.map((p) => (
                <Box
                  key={p.productId}
                  className="flex justify-between items-center text-xs pb-1.5 border-b border-dashed border-slate-100/80 last:border-0 last:pb-0"
                >
                  <span className="text-slate-600">
                    {p.productName}{" "}
                    <span className="text-slate-400 font-mono">
                      (x{p.quantity} {p.unit})
                    </span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatPrice(p.unitPrice * p.quantity)}
                  </span>
                </Box>
              ))}
            </Box>
          )}

          {/* Delivery Fee, Discounts */}
          <Box className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            {selectedOrder.deliveryFee !== undefined &&
              selectedOrder.deliveryFee > 0 && (
                <Box className="flex justify-between">
                  <span>Phí giao nhận thu gom:</span>
                  <span>{formatPrice(selectedOrder.deliveryFee)}</span>
                </Box>
              )}
            {selectedOrder.discountAmount !== undefined &&
              selectedOrder.discountAmount > 0 && (
                <Box className="flex justify-between text-emerald-600 font-bold">
                  <span>Khuyến mại đã áp dụng{selectedOrder.promoCode ? ` (${selectedOrder.promoCode})` : ""}:</span>
                  <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                </Box>
              )}
          </Box>

          <Box className="border-t border-slate-100 pt-3 flex justify-between items-baseline gap-2">
            <span className="text-xs font-bold text-slate-650">
              Cần thanh toán khi nhận đồ sạch:
            </span>
            <span className="text-lg font-black text-blue-600">
              {formatPrice(selectedOrder.totalPrice)}
            </span>
          </Box>
        </Box>

        {/* Customer Review Section (Stored in `reviews` collection) */}
        <Box className="border border-amber-200 bg-amber-50/40 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5 m-0">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Đánh Giá Chất Lượng Cửa Hàng & Tài Xế (Lưu tại bảng `reviews`)
              </h5>
              <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                Đánh giá của bạn giúp cập nhật điểm Ranking cửa hàng và điểm thưởng tài xế giao nhận.
              </p>
            </div>

            {selectedOrder.status === "completed" ? (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>
                  {orderReview ? "Chỉnh Sửa Đánh Giá" : "Gửi Đánh Giá Đơn Này"}
                </span>
              </button>
            ) : (
              selectedOrder.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateOrderStatus(selectedOrder.id, "completed")
                  }
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  Xác Nhận Đã Nhận Đồ Sạch Để Đánh Giá
                </button>
              )
            )}
          </div>

          {orderReview ? (
            <div className="space-y-2.5 pt-2 border-t border-amber-200/70 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-amber-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">
                      Cửa hàng ({orderReview.storeName}):
                    </span>
                    <span className="font-black text-amber-600">
                      {orderReview.storeRating} ★ / 5
                    </span>
                  </div>
                  {orderReview.storeComment && (
                    <p className="text-slate-600 m-0">
                      “{orderReview.storeComment}”
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5 text-emerald-600" />
                      Tài xế ({orderReview.shipperName || "Shipper"}):
                    </span>
                    <span className="font-black text-emerald-600">
                      {orderReview.shipperRating} ★ / 5
                    </span>
                  </div>
                  {orderReview.shipperComment && (
                    <p className="text-slate-600 m-0">
                      “{orderReview.shipperComment}”
                    </p>
                  )}
                </div>
              </div>

              {orderReview.storeReply && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-xs">
                  <div className="font-black text-blue-700 flex items-center gap-1.5 mb-1">
                    <MessageSquareReply className="w-3.5 h-3.5" />
                    <span>Phản hồi từ Chủ tiệm giặt:</span>
                  </div>
                  <p className="text-slate-700 m-0">{orderReview.storeReply}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              {selectedOrder.status === "completed"
                ? "Đơn hàng đã hoàn thành. Hãy bấm 'Gửi Đánh Giá Đơn Này' để chấm sao cho tiệm giặt và tài xế!"
                : "Chức năng đánh giá sẽ mở ngay sau khi đơn giặt hoàn tất giao trả đồ sạch."}
            </div>
          )}
        </Box>
      </Box>

      <OrderReviewModal
        order={isReviewModalOpen ? selectedOrder : null}
        existingReview={orderReview}
        onClose={() => setIsReviewModalOpen(false)}
        onSaved={(saved) => setOrderReview(saved)}
      />
    </Box>
  );
};

