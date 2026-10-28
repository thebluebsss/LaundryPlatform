import React from "react";
import { Plus, Sparkles, MapPin, Calendar, Tag, ShieldCheck } from "lucide-react";
import { useMobileCustomerCreateOrder } from "./hook";
import { OrderLineItemCard } from "./components/OrderLineItemCard";
import { AiFabricScannerModal } from "./components/AiFabricScannerModal";
import { InputText } from "../../../components/InputText";
import { InputSelect } from "../../../components/InputSelect";
import { InputArea } from "../../../components/InputArea";
import { ButtonCustom } from "../../../components/ButtonCustom";

const TIME_SLOTS = [
  { value: "08:00 - 10:00", label: "Sáng (08:00 - 10:00)" },
  { value: "09:00 - 11:00", label: "Sáng (09:00 - 11:00)" },
  { value: "13:30 - 15:30", label: "Chiều (13:30 - 15:30)" },
  { value: "16:00 - 18:00", label: "Chiều tối (16:00 - 18:00)" },
  { value: "18:30 - 20:30", label: "Tối (18:30 - 20:30)" },
];

export const MobileCustomerCreateOrder: React.FC = () => {
  const {
    stores,
    services,
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
    setDistrict,
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
      {/* Step 1: Select Store */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-blue-600">
          <MapPin className="w-4 h-4" />
          <span>1. Chọn Cửa Hàng Giặt Là Tiếp Nhận</span>
        </div>
        <InputSelect
          title="Cửa hàng xử lý đơn của bạn"
          value={selectedStoreId}
          options={storeOptions}
          onChange={(e) => setSelectedStoreId(e.target.value)}
          required
        />
      </div>

      {/* Step 2: Loop [Thêm từng dòng đồ giặt] + Opt [AI Kiểm tra chất liệu] */}
      <div className="space-y-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              2. Danh Sách Từng Dòng Đồ Giặt ({lineItems.length} dòng)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tách riêng đồ màu, đồ trắng, lụa hoặc chăn mền. Số kg chính thức sẽ được tiệm cân thực tế và gửi bạn duyệt.
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
      </div>

      {/* Step 3: Customer Pickup & Delivery Address + Time Slots */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-blue-600">
          <Calendar className="w-4 h-4" />
          <span>3. Địa Chỉ & Khung Giờ Shipper Lấy / Trả Đồ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputText
            title="Họ tên người gửi đồ"
            required
            inputProps={{
              value: customerName,
              onChange: (e) => setCustomerName(e.target.value),
            }}
          />
          <InputText
            title="Số điện thoại liên hệ"
            required
            inputProps={{
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
                value: address,
                onChange: (e) => setAddress(e.target.value),
              }}
            />
          </div>
          <InputText
            title="Quận / Khu vực"
            required
            inputProps={{
              value: district,
              onChange: (e) => setDistrict(e.target.value),
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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

        <div className="grid grid-cols-2 gap-3">
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

        <InputArea
          title="Dặn dò thêm cho Shipper hoặc Chủ tiệm"
          rows={2}
          placeholder="VD: Gọi trước 10 phút, gửi đồ ở sảnh lễ tân..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Step 4: Promo Code & Estimated Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-blue-600">
          <Tag className="w-4 h-4" />
          <span>4. Ưu Đãi & Tổng Chi Phí Tạm Tính</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputText
            title="Mã giảm giá (Nhập GIATMOI15 giảm 15%)"
            inputProps={{
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
          <div className="flex justify-between text-slate-600">
            <span>Phí Shipper thu gom & giao trả 2 chiều:</span>
            <span className="font-mono font-bold text-slate-900">
              {pricingSummary.deliveryFee.toLocaleString("vi-VN")}đ
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
            Cam kết minh bạch: Khi Shipper mang giỏ đồ về tiệm, Chủ cửa hàng sẽ cân thực tế từng dòng đồ và gửi thông báo để bạn bấm xác nhận trước khi giặt.
          </span>
        </div>

        <ButtonCustom
          type="submit"
          loading={submitting}
          label={`Xác Nhận Đặt Đơn & Gọi Shipper (${pricingSummary.totalPrice.toLocaleString(
            "vi-VN"
          )}đ)`}
        />
      </div>

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
