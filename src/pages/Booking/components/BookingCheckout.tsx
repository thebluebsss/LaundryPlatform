import { ShoppingBag, Info, Coins, QrCode, Banknote } from "lucide-react";
import { CartItem, PromoCode } from "../../../types";
import { CartProduct } from "../../../data/products";
import { Box, Button } from "@mui/material";

interface BookingCheckoutProps {
  cartItems: CartItem[];
  selectedProducts: CartProduct[];
  subtotal: number;
  productsTotal: number;
  deliveryFee: number;
  preAppliedPromo: PromoCode | undefined;
  discountAmount: number;
  grandTotal: number;
  paymentMethod?: "vietqr" | "cod";
  setPaymentMethod?: (method: "vietqr" | "cod") => void;
  selectedStoreName?: string;
  canSubmit?: boolean;
  activeStep?: number;
}

export const BookingCheckout = ({
  cartItems,
  selectedProducts,
  subtotal,
  productsTotal,
  deliveryFee,
  preAppliedPromo,
  discountAmount,
  grandTotal,
  paymentMethod = "vietqr",
  setPaymentMethod,
  selectedStoreName,
  canSubmit = true,
  activeStep = 4,
}: BookingCheckoutProps) => {
  const formatPrice = (num: number) => {
    return num.toLocaleString("vi-VN") + " đ";
  };

  const isSubmitDisabled = cartItems.length === 0 || !canSubmit;

  return (
    <Box
      id="booking-checkout-container"
      className="bg-slate-50/60 border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col gap-5 sticky top-24"
    >
      <div>
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
          <ShoppingBag
            style={{ width: "16px", height: "16px", color: "#2563eb" }}
          />
          Kiểm Tra Đơn Trước Khi Đặt
        </h4>
        {selectedStoreName && (
          <div className="mt-2.5 px-3 py-2 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] font-bold text-blue-800">
            Cửa hàng xử lý: {selectedStoreName}
          </div>
        )}
      </div>

      {/* Selected garments review (Order_Details) */}
      <Box className="max-h-52 overflow-y-auto flex flex-col gap-3 pr-1 custom-scrollbar">
        {cartItems.length === 0 ? (
          <Box className="text-center py-6 text-slate-400 text-xs">
            Chưa có dòng đồ giặt nào được thêm
          </Box>
        ) : (
          cartItems.map((item, idx) => {
            const qty = item.estimatedQuantity ?? item.quantity;
            return (
              <Box
                key={`${item.serviceId}-${idx}`}
                className="flex justify-between items-start text-xs border-b border-slate-100/60 pb-2.5 last:border-b-0"
              >
                <Box className="pr-2">
                  <div className="text-xs font-bold text-slate-800">
                    #{idx + 1}. {item.serviceName}
                  </div>
                  {item.fabricType && (
                    <div className="text-[10px] font-semibold text-blue-600 mt-0.5">
                      Chất liệu: {item.fabricType}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Tạm tính: {qty} {item.unitName} ×{" "}
                    {formatPrice(item.unitPrice)}
                  </div>
                </Box>
                <div className="text-xs font-black text-slate-800 shrink-0">
                  {formatPrice(item.unitPrice * qty)}
                </div>
              </Box>
            );
          })
        )}
      </Box>

      {/* Products section */}
      {selectedProducts.length > 0 && (
        <Box className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-black text-slate-700 mb-3">
            Sản phẩm chăm sóc đi kèm:
          </h4>
          <Box className="flex flex-col gap-2">
            {selectedProducts.map((item) => (
              <Box
                key={item.product.id}
                className="flex justify-between items-start text-xs border-b border-slate-100/30 pb-2 last:border-b-0"
              >
                <Box>
                  <div className="text-xs font-bold text-slate-800">
                    {item.product.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {item.quantity} {item.product.unit} ×{" "}
                    {formatPrice(item.product.price)}
                  </div>
                </Box>
                <div className="text-xs font-black text-slate-800">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Payment Method Selection (KH-UC5: COD vs VietQR) */}
      {setPaymentMethod && (
        <Box className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2.5">
            Phương thức thanh toán (KH-UC5)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("vietqr")}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                paymentMethod === "vietqr"
                  ? "border-blue-600 bg-blue-50/70 text-blue-900"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="text-[11px] font-black">VietQR 24/7</div>
                <div className="text-[9px] text-slate-500">Quét mã Napas</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                paymentMethod === "cod"
                  ? "border-emerald-600 bg-emerald-50/70 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[11px] font-black">Tiền mặt (COD)</div>
                <div className="text-[9px] text-slate-500">Trả cho Shipper</div>
              </div>
            </button>
          </div>
        </Box>
      )}

      {/* Calculations break */}
      <Box className="flex flex-col gap-2 pt-3 border-t border-slate-100">
        <Box className="flex justify-between text-xs text-slate-500">
          <span>Phí dịch vụ giặt sấy (tạm tính):</span>
          <span className="font-bold text-slate-800">
            {formatPrice(subtotal)}
          </span>
        </Box>

        {productsTotal > 0 && (
          <Box className="flex justify-between text-xs text-slate-500">
            <span>Tiền sản phẩm đi kèm:</span>
            <span className="font-bold text-slate-800">
              {formatPrice(productsTotal)}
            </span>
          </Box>
        )}

        <Box className="flex justify-between text-xs text-slate-500">
          <span>Phí giao nhận thu gom 2 chiều:</span>
          <span className="font-bold text-slate-800">
            {deliveryFee === 0 ? "Miễn Phí" : formatPrice(deliveryFee)}
          </span>
        </Box>

        {preAppliedPromo && (
          <Box className="flex justify-between text-xs text-emerald-600 font-bold">
            <span>Khuyến mãi ({preAppliedPromo.code}):</span>
            <span>- {formatPrice(discountAmount)}</span>
          </Box>
        )}
      </Box>

      <Box className="flex flex-col gap-2 p-4 rounded-2xl bg-blue-50/30 border border-blue-100/80">
        <Box className="flex justify-between items-baseline">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
            Tổng tạm tính (Bước 22 Sequence 1):
          </span>
          <span className="text-xl font-black text-blue-600">
            {formatPrice(grandTotal)}
          </span>
        </Box>
        <p className="text-[10px] text-slate-500 leading-normal m-0 pt-1 border-t border-blue-100/40">
          * Cửa hàng sẽ cân thực tế từng dòng đồ sau khi Shipper thu gom. Nếu có
          chênh lệch khối lượng, hệ thống sẽ gửi thông báo để bạn duyệt trước khi
          giặt.
        </p>
      </Box>

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        fullWidth
        variant="contained"
        sx={{
          py: 1.5,
          borderRadius: "12px",
          fontWeight: "700",
          fontSize: "13px",
          textTransform: "none",
          fontFamily: "var(--font-sans)",
          bgcolor: isSubmitDisabled ? "#cbd5e1" : "#2563eb",
          boxShadow: isSubmitDisabled
            ? "none"
            : "0 10px 15px -3px rgba(37, 99, 235, 0.2)",
          color: isSubmitDisabled ? "#94a3b8" : "#ffffff",
          cursor: isSubmitDisabled ? "not-allowed" : "pointer",
          "&:hover": {
            bgcolor: isSubmitDisabled ? "#cbd5e1" : "#1d4ed8",
            boxShadow: isSubmitDisabled
              ? "none"
              : "0 10px 15px -3px rgba(37, 99, 235, 0.3)",
            transform: isSubmitDisabled ? "none" : "scale(1.02)",
          },
          "&.Mui-disabled": {
            bgcolor: "#e2e8f0",
            color: "#94a3b8",
          },
        }}
        startIcon={<Coins style={{ width: "18px", height: "18px" }} />}
      >
        {canSubmit
          ? "Xác Nhận Đặt Lịch Giặt Sấy (KH-UC4.6)"
          : `Hoàn tất Bước ${activeStep}/4 để Đặt Lịch`}
      </Button>

      <Box className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80">
        <div className="text-[11px] font-black text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <Info style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
          Quy trình chuẩn Sequence:
        </div>
        <div className="text-[10px] text-slate-400 leading-normal">
          • Bước 1: Tạo đơn chờ xác nhận (Pending) → Cửa hàng phát sóng gọi Shipper.
        </div>
        <div className="text-[10px] text-slate-400 leading-normal">
          • Bước 2: Shipper lấy đồ bàn giao tiệm → Cân thực tế & xác nhận chênh lệch.
        </div>
      </Box>
    </Box>
  );
};
