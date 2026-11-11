import React from "react";
import {
  Plus,
  Minus,
  Sparkles,
  MapPin,
  Calendar,
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

const TIME_SLOTS = [
  { value: "08:00 - 10:00", label: "Sáng (08:00 - 10:00)" },
  { value: "09:00 - 11:00", label: "Sáng (09:00 - 11:00)" },
  { value: "13:30 - 15:30", label: "Chiều (13:30 - 15:30)" },
  { value: "16:00 - 18:00", label: "Chiều tối (16:00 - 18:00)" },
  { value: "18:30 - 20:30", label: "Tối (18:30 - 20:30)" },
];

const HANOI_DISTRICT_OPTIONS = HANOI_DISTRICTS.map((d) => ({
  value: d.name,
  label: d.name,
}));

const MOBILE_STEPS = [
  { step: 1 as const, label: "1. Chọn tiệm", icon: Store },
  { step: 2 as const, label: "2. Đồ giặt", icon: Shirt },
  { step: 3 as const, label: "3. SP phụ", icon: ShoppingBag },
  { step: 4 as const, label: "4. Đặt lịch", icon: MapPin },
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
    pickupDate,
    setPickupDate,
    pickupTime,
    setPickupTime,
    deliveryDate,
    setDeliveryDate,
    deliveryTime,
    setDeliveryTime,
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
      {/* Non-Skippable 4-Step Wizard Bar with Checkmarks */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">
            Quy Trình Đặt Đơn Tuần Tự (KH-UC4)
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

      {/* Step 1: Select Store (KH-UC4.1) */}
      {activeStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-blue-600">
            <MapPin className="w-4 h-4" />
            <span>Bước 1: Chọn Cửa Hàng Giặt Là Tiếp Nhận (KH-UC4.1)</span>
          </div>
          <InputSelect
            title="Cửa hàng xử lý đơn của bạn"
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
              <span>Xác Nhận Cửa Hàng & Sang Bước 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Loop [Thêm từng dòng đồ giặt] + Opt [AI Kiểm tra chất liệu] (KH-UC4.2, KH-UC4.4) */}
      {activeStep === 2 && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Bước 2: Danh Sách Từng Dòng Đồ Giặt ({lineItems.length} dòng)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tách riêng đồ màu, đồ trắng, lụa hoặc chăn mền. Số kg chính thức
                sẽ được tiệm cân thực tế và gửi bạn duyệt.
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
                <span>Thêm Dòng Đồ</span>
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
              <span>Bước 1</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmStep2}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Xác Nhận Đồ Giặt & Sang Bước 3</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Chọn mua kèm sản phẩm chăm sóc quần áo (KH-UC4.5) */}
      {activeStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600">
              <ShoppingBag className="w-4 h-4" />
              <span>
                Bước 3: Mua Kèm Sản Phẩm Chăm Sóc Quần Áo (KH-UC4.5 - Tùy chọn)
              </span>
            </div>
            {selectedProducts.length > 0 && (
              <span className="text-[11px] font-bold text-emerald-600">
                Đã chọn {selectedProducts.reduce((s, p) => s + p.quantity, 0)}{" "}
                SP
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {careProducts.map((product) => {
              const qty =
                selectedProducts.find((p) => p.productId === product.id)
                  ?.quantity || 0;
              return (
                <div
                  key={product.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                    qty > 0
                      ? "border-blue-500 bg-blue-50/40"
                      : "border-slate-200 bg-slate-50/60"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {product.name}
                    </div>
                    <div className="text-[11px] font-mono text-blue-600 font-bold">
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
              <span>Bước 2</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmStep3}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {selectedProducts.length > 0
                  ? "Xác Nhận SP & Sang Bước 4"
                  : "Bỏ Qua & Sang Bước 4"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Customer Pickup & Delivery Address + Time Slots + Summary (KH-UC4.3, KH-UC4.6) */}
      {activeStep === 4 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-blue-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Bước 4: Địa Chỉ & Khung Giờ Shipper Lấy / Trả Đồ (KH-UC4.3)
                </span>
              </div>
              <button
                type="button"
                onClick={handlePrevStep}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại Bước 3</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputText
                title="Họ tên người gửi đồ"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <InputText
                  title="Địa chỉ số nhà, ngõ/đường"
                  required
                  inputProps={{
                    placeholder: "Nhập chi tiết số nhà, tên đường...",
                    value: address,
                    onChange: (e) => setAddress(e.target.value),
                  }}
                />
              </div>
              <InputSelect
                title="Quận / Huyện (TP. Hà Nội)"
                value={district}
                options={HANOI_DISTRICT_OPTIONS}
                onChange={(e) => handleDistrictChange(e.target.value)}
                required
              />
            </div>

            {/* Google Maps Pin Picker for 1km Radius Driver Broadcast */}
            <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Định vị điểm lấy đồ trên Google Maps (Phát đơn bán kính 1km)</span>
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

            {/* Full-Width Pickup & Delivery Schedule Cards so time slots are 100% visible without truncation */}
            <div className="space-y-3 pt-1">
              {/* 1. Pickup Schedule Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-slate-900">
                    1. Lịch hẹn Tài xế đến lấy đồ tận nhà
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {TIME_SLOTS.find((s) => s.value === pickupTime)?.label ||
                      pickupTime}{" "}
                    ·{" "}
                    {pickupDate
                      ? pickupDate.split("-").reverse().join("/")
                      : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <InputText
                    title="Ngày Shipper lấy đồ"
                    inputProps={{
                      type: "date",
                      value: pickupDate,
                      onChange: (e) => setPickupDate(e.target.value),
                    }}
                  />
                  <InputSelect
                    title="Khung giờ lấy đồ"
                    value={pickupTime}
                    options={TIME_SLOTS}
                    onChange={(e) => setPickupTime(e.target.value)}
                  />
                </div>

                {/* Quick-Tap Full-Visibility Time Slot Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {TIME_SLOTS.map((slot) => {
                    const active = pickupTime === slot.value;
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setPickupTime(slot.value)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          active
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Delivery Return Schedule Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-slate-900">
                    2. Lịch hẹn Tài xế giao trả đồ sạch
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {TIME_SLOTS.find((s) => s.value === deliveryTime)?.label ||
                      deliveryTime}{" "}
                    ·{" "}
                    {deliveryDate
                      ? deliveryDate.split("-").reverse().join("/")
                      : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <InputText
                    title="Ngày nhận lại đồ sạch"
                    inputProps={{
                      type: "date",
                      value: deliveryDate,
                      onChange: (e) => setDeliveryDate(e.target.value),
                    }}
                  />
                  <InputSelect
                    title="Khung giờ giao trả"
                    value={deliveryTime}
                    options={TIME_SLOTS}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                  />
                </div>

                {/* Quick-Tap Full-Visibility Time Slot Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {TIME_SLOTS.map((slot) => {
                    const active = deliveryTime === slot.value;
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setDeliveryTime(slot.value)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          active
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <InputArea
              title="Dặn dò thêm cho Shipper hoặc Chủ tiệm"
              rows={2}
              placeholder="VD: Gọi trước 10 phút, gửi đồ ở sảnh lễ tân..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Promo Code & Estimated Summary (Sequence 1 Step 22) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600">
              <Tag className="w-4 h-4" />
              <span>Tổng Chi Phí Tạm Tính & Xác Nhận Đặt Đơn (KH-UC4.6)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputText
                title="Mã giảm giá (Nhập GIATMOI15 giảm 15%)"
                inputProps={{
                  placeholder: "Nhập mã khuyến mãi nếu có",
                  value: promoCode,
                  onChange: (e) => setPromoCode(e.target.value),
                }}
              />
              <InputSelect
                title="Phương thức thanh toán"
                value={paymentMethod}
                options={[
                  {
                    value: "vietqr",
                    label: "Quét mã VietQR Napas 24/7 (Sau khi cân đồ)",
                  },
                  {
                    value: "cod",
                    label: "Tiền mặt cho Shipper khi nhận đồ sạch",
                  },
                ]}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as "vietqr" | "cod")
                }
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tiền giặt tạm tính ({lineItems.length} dòng đồ):</span>
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
                <span>Phí Shipper thu gom & giao trả 2 chiều:</span>
                <span className="font-mono font-bold text-slate-900">
                  {pricingSummary.deliveryFee === 0
                    ? "Miễn Phí"
                    : `${pricingSummary.deliveryFee.toLocaleString("vi-VN")}đ`}
                </span>
              </div>
              {pricingSummary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Khuyến mãi ({promoCode.toUpperCase()}):</span>
                  <span className="font-mono">
                    -{pricingSummary.discountAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                <span className="font-black text-slate-900 text-sm">
                  Tổng tạm tính:
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
