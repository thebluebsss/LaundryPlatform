import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Store,
  Shirt,
  Plus,
  Star,
  Check,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  MapPin,
} from "lucide-react";
import { useBooking } from "./hook";
import { BookingForm } from "./components/BookingForm";
import { BookingCheckout } from "./components/BookingCheckout";
import { ProductSelection } from "./components/ProductSelection";
import { SuccessModal } from "./components/SuccessModal";
import { OrderLineItemCard } from "../MobileCustomer/CreateOrder/components/OrderLineItemCard";
import { useLoading } from "../../context/LoadingContext";
import { Box, Button } from "@mui/material";

const BOOKING_STEPS = [
  {
    step: 1 as const,
    code: "Bước 1",
    title: "Bước 1: Chọn Tiệm Giặt",
    subtitle: "Chọn chi nhánh phục vụ",
    icon: Store,
  },
  {
    step: 2 as const,
    code: "Bước 2",
    title: "Bước 2: Kê Khai Đồ Giặt",
    subtitle: "Chi tiết từng món đồ",
    icon: Shirt,
  },
  {
    step: 3 as const,
    code: "Bước 3",
    title: "Bước 3: Sản Phẩm Đi Kèm",
    subtitle: "Chăm sóc vải tùy chọn",
    icon: ShoppingBag,
  },
  {
    step: 4 as const,
    code: "Bước 4",
    title: "Bước 4: Địa Chỉ & Đặt Đơn",
    subtitle: "Lịch hẹn & Thanh toán",
    icon: MapPin,
  },
];

export const Booking = () => {
  const navigate = useNavigate();
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
    catalogProducts,
    selectedStoreId,
    setSelectedStoreId,
    cartItems,
    handleAddLineItem,
    handleUpdateLineItem,
    handleRemoveLineItem,
    paymentMethod,
    setPaymentMethod,
    preAppliedPromo,
    fullname,
    setFullname,
    phoneNumber,
    setPhoneNumber,
    city,
    setCity,
    district,
    setDistrict,
    addressDetail,
    setAddressDetail,
    notes,
    setNotes,
    customerSpecialRequest,
    setCustomerSpecialRequest,
    pickupDateStr,
    setPickupDateStr,
    pickupTimeSlot,
    setPickupTimeSlot,
    deliveryDateStr,
    setDeliveryDateStr,
    deliveryTimeSlot,
    setDeliveryTimeSlot,
    errors,
    timeSlots,
    subtotal,
    productsTotal,
    deliveryFee,
    discountAmount,
    grandTotal,
    selectedProducts,
    handleUpdateProduct,
    handleFormSubmit,
  } = useBooking();

  const { setLoading } = useLoading();

  const [showSuccess, setShowSuccess] = useState(false);
  const [justCreatedId, setJustCreatedId] = useState("");

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  const handleRegisterOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await handleFormSubmit();
      if (created) {
        setJustCreatedId(created.id);
        setShowSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      id="booking-page-root"
      className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 my-4 relative"
    >
      {/* Header */}
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-slate-100 mb-6 gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 m-0 leading-tight">
            <Calendar
              style={{ color: "#2563eb", width: "22px", height: "22px" }}
            />
            Đặt Lịch Dịch Vụ Giặt Sấy Tận Nhà
          </h2>
          <p className="text-xs text-slate-500 m-0 mt-1 leading-normal">
            Hoàn thành tuần tự từng bước từ Bước 1 đến Bước 4. Các bước hoàn tất
            sẽ hiển thị dấu tích xanh (✓) và mở khóa bước kế tiếp.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate("/")}
          sx={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#2563eb",
            bgcolor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "12px",
            px: 2,
            py: 1,
            textTransform: "none",
            alignSelf: "flex-start",
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#dbeafe",
              transform: "translateX(-2px)",
            },
          }}
        >
          ← Quay Lại Trang Chủ
        </Button>
      </Box>

      {/* Non-Skippable 4-Step Progress Bar with Checkmarks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {BOOKING_STEPS.map((item) => {
          const isCompleted = item.step <= maxCompletedStep;
          const isActive = item.step === activeStep;
          const isLocked = item.step > maxCompletedStep + 1;
          const IconComponent = item.icon;

          return (
            <button
              key={item.step}
              type="button"
              disabled={isLocked}
              onClick={() => handleStepClick(item.step)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                isActive
                  ? "border-blue-600 bg-blue-50/90 shadow-sm ring-2 ring-blue-500/20 cursor-pointer"
                  : isCompleted
                    ? "border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50 cursor-pointer"
                    : isLocked
                      ? "border-slate-200 bg-slate-100/70 opacity-60 cursor-not-allowed"
                      : "border-slate-200 bg-white hover:border-blue-300 cursor-pointer"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs transition-colors ${
                  isCompleted
                    ? "bg-emerald-600 text-white shadow-sm"
                    : isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <IconComponent className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : isActive
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {item.code}
                  </span>
                  {isCompleted && (
                    <span className="text-[10px] font-black text-emerald-700">
                      ✓ Đã xong
                    </span>
                  )}
                </div>
                <div className="text-xs font-black text-slate-900 truncate mt-1">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {item.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={handleRegisterOrder}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <Box className="lg:col-span-8 flex flex-col gap-6">
          {/* BƯỚC 1: CHỌN CỬA HÀNG GIẶT SẤY */}
          {activeStep === 1 && (
            <div className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-slate-900 m-0">
                      Bước 1: Chọn Tiệm Giặt Sấy Phục Vụ
                    </h3>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">
                      Chọn cơ sở giặt sấy gần bạn nhất để hệ thống điều phối
                      Shipper thu gom nhanh chóng.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/stores-map")}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer shrink-0"
                >
                  Xem bản đồ tiệm giặt →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {stores.map((store) => {
                  const isSelected = store.id === selectedStoreId;
                  return (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => setSelectedStoreId(store.id)}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/80 shadow-sm ring-2 ring-blue-500/15"
                          : "border-slate-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-slate-900">
                            {store.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {store.rating}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 mb-0">
                          {store.address}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-slate-500">
                        <span>Giờ mở cửa: {store.openHours}</span>
                        <span
                          className={
                            isSelected
                              ? "text-blue-600 font-black flex items-center gap-1"
                              : "text-slate-400"
                          }
                        >
                          {isSelected ? "✓ Đang chọn" : "Chọn tiệm này"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-200/70">
                <button
                  type="button"
                  onClick={handleConfirmStep1}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Xác Nhận Tiệm Giặt & Sang Bước 2
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 2: THÊM TỪNG DÒNG CHI TIẾT ĐỒ GIẶT */}
          {activeStep === 2 && (
            <div className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/80 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-slate-900 m-0">
                      Bước 2: Chi Tiết Từng Loại Quần Áo & Chất Liệu Vải
                    </h3>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">
                      Tách riêng từng dòng đồ trắng, đồ màu, lụa/vest hoặc chăn
                      mền để cửa hàng phân loại & cân thực tế chính xác.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Dòng Đồ Giặt
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cartItems.map((item, idx) => (
                  <OrderLineItemCard
                    key={idx}
                    index={idx}
                    item={item}
                    services={services}
                    onUpdateItem={handleUpdateLineItem}
                    onRemoveItem={handleRemoveLineItem}
                    canRemove={cartItems.length > 1}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/70">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại Bước 1
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStep2}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Xác Nhận Chi Tiết Đồ Giặt & Sang Bước 3
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 3: CHỌN MUA KÈM SẢN PHẨM CHĂM SÓC QUẦN ÁO */}
          {activeStep === 3 && (
            <div className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/80 space-y-5">
              <ProductSelection
                products={catalogProducts}
                selectedProducts={selectedProducts}
                onUpdateProduct={handleUpdateProduct}
              />

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/70">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại Bước 2
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStep3}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {selectedProducts.length > 0
                    ? `Xác Nhận ${selectedProducts.length} Sản Phẩm & Sang Bước 4`
                    : "Bỏ Qua Sản Phẩm Phụ & Sang Bước 4"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 4: NHẬP ĐỊA CHỈ & YÊU CẦU ĐẶC BIỆT */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <BookingForm
                fullname={fullname}
                setFullname={setFullname}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                city={city}
                setCity={setCity}
                district={district}
                setDistrict={setDistrict}
                addressDetail={addressDetail}
                setAddressDetail={setAddressDetail}
                notes={notes}
                setNotes={setNotes}
                customerSpecialRequest={customerSpecialRequest}
                setCustomerSpecialRequest={setCustomerSpecialRequest}
                pickupDateStr={pickupDateStr}
                setPickupDateStr={setPickupDateStr}
                pickupTimeSlot={pickupTimeSlot}
                setPickupTimeSlot={setPickupTimeSlot}
                deliveryDateStr={deliveryDateStr}
                setDeliveryDateStr={setDeliveryDateStr}
                deliveryTimeSlot={deliveryTimeSlot}
                setDeliveryTimeSlot={setDeliveryTimeSlot}
                errors={errors}
                timeSlots={timeSlots}
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại Bước 3
                </button>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  ✓ Đã mở khóa nút Xác Nhận Đặt Lịch ở cột tổng kết bên phải
                </span>
              </div>
            </div>
          )}
        </Box>

        {/* Invoice Summary and Submit */}
        <Box className="lg:col-span-4">
          <BookingCheckout
            cartItems={cartItems}
            selectedProducts={selectedProducts}
            subtotal={subtotal}
            productsTotal={productsTotal}
            deliveryFee={deliveryFee}
            preAppliedPromo={preAppliedPromo}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            selectedStoreName={selectedStore?.name}
            canSubmit={activeStep === 4 && maxCompletedStep >= 3}
            activeStep={activeStep}
          />
        </Box>
      </form>

      {/* Success Popup */}
      <SuccessModal
        showSuccess={showSuccess}
        justCreatedId={justCreatedId}
        fullname={fullname}
        phoneNumber={phoneNumber}
        pickupTimeSlot={pickupTimeSlot}
        pickupDateStr={pickupDateStr}
        grandTotal={grandTotal}
        onClose={() => {
          setShowSuccess(false);
          navigate("/tracking");
        }}
      />
    </Box>
  );
};
