import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useBooking } from "./hook";
import { BookingForm } from "./components/BookingForm";
import { BookingCheckout } from "./components/BookingCheckout";
import { ProductSelection } from "./components/ProductSelection";
import { SuccessModal } from "./components/SuccessModal";
import { useLoading } from "../../context/LoadingContext";
import { Box, Button } from "@mui/material";

export const Booking = () => {
  const navigate = useNavigate();
  const {
    cartItems,
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

  // Dialog state
  const [showSuccess, setShowSuccess] = useState(false);
  const [justCreatedId, setJustCreatedId] = useState("");

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
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-slate-100 mb-6 gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 m-0 leading-tight">
            <Calendar
              style={{ color: "#2563eb", width: "22px", height: "22px" }}
            />
            Nhập Thông Tin Đăng Ký Đặt Lịch Hẹn
          </h2>
          <p className="text-xs text-slate-400 m-0 mt-1 leading-normal">
            Vui lòng điền địa chỉ, số điện thoại & chọn khung thời gian thu nhận
            phù hợp.
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
          ← Quay Lại Chọn Dịch Vụ
        </Button>
      </Box>

      <form
        onSubmit={handleRegisterOrder}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Registration form inputs */}
        <Box className="lg:col-span-8">
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

          <Box className="mt-6">
            <ProductSelection
              selectedProducts={selectedProducts}
              onUpdateProduct={handleUpdateProduct}
            />
          </Box>
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
