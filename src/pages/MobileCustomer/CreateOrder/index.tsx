import React from "react";
import {
  Plus,
  Minus,
  Sparkles,
  MapPin,
  Tag,
  ShieldCheck,
  ShoppingBag,
  Check,
  Lock,
  ArrowRight,
  ArrowLeft,
  Store,
  Shirt,
} from "lucide-react";
import { useMobileCustomerCreateOrder } from "./hook";
import { OrderLineItemCard } from "./components/OrderLineItemCard";
import { AiFabricScannerModal } from "./components/AiFabricScannerModal";
import { InputText } from "../../../components/InputText";
import { InputSelect } from "../../../components/InputSelect";
import { InputArea } from "../../../components/InputArea";
import { ButtonCustom } from "../../../components/ButtonCustom";
import { GoogleMapCanvas } from "../../../components/GoogleMapCanvas";
import { HANOI_DISTRICTS } from "../../../data";

const HANOI_DISTRICT_OPTIONS = HANOI_DISTRICTS.map((d) => ({
  value: d.name,
  label: d.name,
}));

const MOBILE_STEPS = [
  { step: 1 as const, label: "1. Chọn tiệm", icon: Store },
  { step: 2 as const, label: "2. Đồ giặt", icon: Shirt },
  { step: 3 as const, label: "3. SP phụ", icon: ShoppingBag },
  { step: 4 as const, label: "4. Địa chỉ", icon: MapPin },
];

export const MobileCustomerCreateOrder: React.FC = () => {
  const {
    activeStep,
    maxCompletedStep,
    handleStepClick,
    handleConfirmStep1,
    handleConfirmStep2,
    handleConfirmStep3,
    handlePrevStep,
    stores,
    services,
    careProducts,
    selectedProducts,
    handleUpdateProductQuantity,
    selectedStoreId,
    setSelectedStoreId,
    lineItems,
    handleAddLineItem,
    handleUpdateLineItem,
    handleRemoveLineItem,
    aiModalOpen,
    setAiModalOpen,
    activeLineIndexForAi,
    handleOpenAiScanner,
    handleApplyAiResult,
    customerName,
    setCustomerName,
    phoneNumber,
    setPhoneNumber,
    address,
    setAddress,
    district,
    handleDistrictChange,
    customerCoords,
    setCustomerCoords,
    promoCode,
    setPromoCode,
    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes,
    pricingSummary,
    submitting,
    handleSubmitOrder,
  } = useMobileCustomerCreateOrder();

  const storeOptions = stores.map((s) => ({
    value: s.id,
    label: `${s.name} — ${s.district}`,
  }));

  return (
    <form
      onSubmit={handleSubmitOrder}
      className="space-y-4 pb-8 animate-in fade-in duration-200"
    >
      {/* 4-Step Wizard Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">
            Đặt Dịch Vụ Giặt Sấy Tận Nơi
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            Bước {activeStep}/4
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {MOBILE_STEPS.map((item) => {
            const isCompleted = item.step <= maxCompletedStep;
            const isActive = item.step === activeStep;
            const isLocked = item.step > maxCompletedStep + 1;
            const Icon = item.icon;

            return (
              <button
                key={item.step}
                type="button"
                disabled={isLocked}
                onClick={() => handleStepClick(item.step)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-black shadow-2xs cursor-pointer"
                    : isCompleted
                      ? "border-emerald-300 bg-emerald-50/70 text-emerald-700 font-bold cursor-pointer"
                      : isLocked
                        ? "border-slate-200 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed"
                        : "border-slate-200 bg-white text-slate-600 cursor-pointer"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-[10px] leading-tight text-center truncate w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 1: Select Store */}
      {activeStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-blue-600">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Bước 1: Chọn Tiệm Giặt Gần Bạn</span>
          </div>
          <InputSelect
            title="Cửa hàng tiếp nhận đồ giặt của bạn"
            value={selectedStoreId}
            options={storeOptions}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleConfirmStep1}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Tiếp Tục Chọn Đồ Giặt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Danh sách đồ giặt */}
      {activeStep === 2 && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Bước 2: Danh Sách Đồ Cần Giặt ({lineItems.length} món)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bạn có thể tách riêng đồ màu, đồ trắng, lụa hoặc chăn mền. Khối lượng thực tế sẽ được tiệm cân lại và báo bạn xác nhận.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenAiScanner(0)}
                className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quét AI</span>
              </button>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Món Đồ</span>
              </button>
            </div>
          </div>

          {lineItems.map((item, idx) => (
            <OrderLineItemCard
              key={`${item.serviceId}-${idx}`}
              index={idx}
              item={item}
              services={services}
              canRemove={lineItems.length > 1}
              onUpdateItem={handleUpdateLineItem}
              onRemoveItem={handleRemoveLineItem}
              onOpenAiScanner={handleOpenAiScanner}
            />
          ))}

          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmStep2}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Xác Nhận Đồ Giặt & Tiếp Tục</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Chọn mua kèm sản phẩm chăm sóc quần áo */}
      {activeStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600">
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>
                Bước 3: Sản Phẩm Chăm Sóc Quần Áo Mua Kèm (Không bắt buộc)
              </span>
            </div>
            {selectedProducts.length > 0 && (
              <span className="text-[11px] font-bold text-emerald-600 shrink-0">
                Đã chọn {selectedProducts.reduce((s, p) => s + p.quantity, 0)}{" "}
                SP
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {careProducts.map((product) => {
              const qty =
                selectedProducts.find((p) => p.productId === product.id)
                  ?.quantity || 0;
              return (
                <div
                  key={product.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    qty > 0
                      ? "border-blue-500 bg-blue-50/40"
                      : "border-slate-200 bg-slate-50/60"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 break-words leading-snug">
                      {product.name}
                    </div>
                    <div className="text-[11px] font-mono text-blue-600 font-bold mt-0.5">
                      {product.price.toLocaleString("vi-VN")}đ / {product.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {qty > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateProductQuantity(product, -1)
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono font-black w-5 text-center">
                          {qty}
                        </span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleUpdateProductQuantity(product, 1)}
                      className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmStep3}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {selectedProducts.length > 0
                  ? "Xác Nhận & Sang Bước 4"
                  : "Bỏ Qua & Sang Bước 4"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Customer Pickup & Delivery Address + Summary */}
      {activeStep === 4 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-blue-600">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Bước 4: Thông Tin Liên Hệ & Địa Chỉ Nhận / Trả Đồ</span>
              </div>
              <button
                type="button"
                onClick={handlePrevStep}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại</span>
              </button>
            </div>

            {/* Each input is on its own full-width row so users can read all text clearly */}
            <div className="space-y-3">
              <InputText
                title="Họ và tên người gửi đồ"
                required
                inputProps={{
                  placeholder: "Nhập họ và tên người nhận/gửi",
                  value: customerName,
                  onChange: (e) => setCustomerName(e.target.value),
                }}
              />

              <InputText
                title="Số điện thoại liên hệ"
                required
                inputProps={{
                  placeholder: "Ví dụ: 0912345678",
                  value: phoneNumber,
                  onChange: (e) => setPhoneNumber(e.target.value),
                }}
              />

              <InputSelect
                title="Quận / Huyện tại Hà Nội"
                value={district}
                options={HANOI_DISTRICT_OPTIONS}
                onChange={(e) => handleDistrictChange(e.target.value)}
                required
              />

              <InputText
                title="Địa chỉ chi tiết (Số nhà, ngõ/ngách, tên đường)"
                required
                inputProps={{
                  placeholder: "VD: Số 14 ngõ 68 Cầu Giấy, Phường Quan Hoa...",
                  value: address,
                  onChange: (e) => setAddress(e.target.value),
                }}
              />
            </div>

            {/* Google Maps Pin Picker for 1km Radius Driver Broadcast */}
            <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Ghim vị trí lấy đồ trên bản đồ (Tìm tài xế quanh 1km)</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200">
                  GPS: {customerCoords.lat.toFixed(4)}, {customerCoords.lng.toFixed(4)}
                </span>
              </div>
              <GoogleMapCanvas
                center={customerCoords}
                pickedCoords={customerCoords}
                onPickLocation={(lat, lng) => setCustomerCoords({ lat, lng })}
                zoom={15}
                heightClassName="h-[220px]"
                showRouteToSelected={false}
              />
            </div>

            <InputArea
              title="Lời nhắn cho Tài xế hoặc Cửa hàng"
              rows={2}
              placeholder="VD: Gọi trước khi đến 10 phút, gửi đồ tại quầy lễ tân..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Promo Code & Estimated Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600">
              <Tag className="w-4 h-4 shrink-0" />
              <span>Thanh Toán & Chi Phí Tạm Tính</span>
            </div>

            <div className="space-y-3">
              <InputText
                title="Mã ưu đãi (Nhập GIATMOI15 để giảm 15%)"
                inputProps={{
                  placeholder: "Nhập mã giảm giá nếu có",
                  value: promoCode,
                  onChange: (e) => setPromoCode(e.target.value),
                }}
              />
              <InputSelect
                title="Hình thức thanh toán"
                value={paymentMethod}
                options={[
                  {
                    value: "vietqr",
                    label: "Chuyển khoản qua mã VietQR (Sau khi tiệm cân đồ)",
                  },
                  {
                    value: "cod",
                    label: "Thanh toán tiền mặt cho Tài xế khi nhận đồ sạch",
                  },
                ]}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as "vietqr" | "cod")
                }
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tiền giặt tạm tính ({lineItems.length} món đồ):</span>
                <span className="font-mono font-bold text-slate-900">
                  {pricingSummary.estimatedSubtotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {pricingSummary.productsTotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Sản phẩm chăm sóc mua kèm:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {pricingSummary.productsTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Phí giao nhận 2 chiều tận nơi:</span>
                <span className="font-mono font-bold text-slate-900">
                  {pricingSummary.deliveryFee === 0
                    ? "Miễn Phí"
                    : `${pricingSummary.deliveryFee.toLocaleString("vi-VN")}đ`}
                </span>
              </div>
              {pricingSummary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Ưu đãi ({promoCode.toUpperCase()}):</span>
                  <span className="font-mono">
                    -{pricingSummary.discountAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                <span className="font-black text-slate-900 text-sm">
                  Tổng cộng tạm tính:
                </span>
                <span className="font-mono font-black text-blue-600 text-base">
                  {pricingSummary.totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Cam kết minh bạch: Khi Shipper mang giỏ đồ về tiệm, Chủ cửa hàng
                sẽ cân thực tế từng dòng đồ và gửi thông báo để bạn bấm xác nhận
                trước khi giặt.
              </span>
            </div>

            <ButtonCustom
              type="submit"
              loading={submitting}
              label={`Xác Nhận Đặt Lịch Giặt Sấy (${pricingSummary.totalPrice.toLocaleString(
                "vi-VN",
              )}đ)`}
            />
          </div>
        </div>
      )}

      {/* Optional AI Garment Scanner Modal */}
      <AiFabricScannerModal
        isOpen={aiModalOpen}
        declaredServiceName={
          lineItems[activeLineIndexForAi]?.serviceName || "Giặt Sấy Thường"
        }
        onClose={() => setAiModalOpen(false)}
        onApplyAiResult={handleApplyAiResult}
      />
    </form>
  );
};
