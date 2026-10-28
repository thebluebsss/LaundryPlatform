import { ShoppingBag, Info, Coins } from "lucide-react";
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
}: BookingCheckoutProps) => {
  const formatPrice = (num: number) => {
    return num.toLocaleString("vi-VN") + " đ";
  };

  return (
    <Box
      id="booking-checkout-container"
      className="bg-slate-50/60 border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col gap-6"
    >
      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100 m-0">
        <ShoppingBag
          style={{ width: "16px", height: "16px", color: "#2563eb" }}
        />
        Kiểm Tra Đơn Trước Khi Đặt
      </h4>

      {/* Selected garments review */}
      <Box className="max-h-40 overflow-y-auto flex flex-col gap-3 pr-1 custom-scrollbar">
        {cartItems.length === 0 ? (
          <Box className="text-center py-6 text-slate-400 text-xs">
            Chưa có dịch vụ nào được chọn
          </Box>
        ) : (
          cartItems.map((item) => (
            <Box
              key={item.serviceId}
              className="flex justify-between items-start text-xs border-b border-slate-100/30 pb-2 last:border-b-0"
            >
              <Box>
                <div className="text-xs font-bold text-slate-800">
                  {item.serviceName}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {item.quantity} {item.unitName} ×{" "}
                  {formatPrice(item.unitPrice)}
                </div>
              </Box>
              <div className="text-xs font-black text-slate-800">
                {formatPrice(item.unitPrice * item.quantity)}
              </div>
            </Box>
          ))
        )}
      </Box>

      {/* Products section */}
      {selectedProducts.length > 0 && (
        <Box className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-black text-slate-700 mb-3">
            Sản phẩm đã chọn:
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

      {/* Calculations break */}
      <Box className="flex flex-col gap-2 pt-4 border-t border-slate-100">
        <Box className="flex justify-between text-xs text-slate-500">
          <span>Phí dịch vụ giặt sấy:</span>
          <span className="font-bold text-slate-800">
            {formatPrice(subtotal)}
          </span>
        </Box>

        {productsTotal > 0 && (
          <Box className="flex justify-between text-xs text-slate-500">
            <span>Tiền sản phẩm:</span>
            <span className="font-bold text-slate-800">
              {formatPrice(productsTotal)}
            </span>
          </Box>
        )}

        <Box className="flex justify-between text-xs text-slate-500">
          <span>Phí giao nhận thu gom:</span>
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

      <Box className="flex flex-col gap-2 p-4 rounded-2xl bg-blue-50/20 border border-blue-100/60">
        <Box className="flex justify-between items-baseline">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
            Tổng thanh toán:
          </span>
          <span className="text-xl font-black text-blue-600">
            {formatPrice(grandTotal)}
          </span>
        </Box>
        <p className="text-[10px] text-slate-400 leading-normal m-0 pt-1 border-t border-blue-100/20">
          * Quý khách thanh toán bằng tiền mặt hoặc chuyển khoản ngân hàng/MoMo
          khi shipper bàn giao quần áo phẳng thơm thành công.
        </p>
      </Box>

      <Button
        type="submit"
        disabled={cartItems.length === 0}
        fullWidth
        variant="contained"
        sx={{
          py: 1.5,
          borderRadius: "12px",
          fontWeight: "700",
          fontSize: "13px",
          textTransform: "none",
          fontFamily: "var(--font-sans)",
          bgcolor: cartItems.length === 0 ? "#cbd5e1" : "#2563eb",
          boxShadow:
            cartItems.length === 0
              ? "none"
              : "0 10px 15px -3px rgba(37, 99, 235, 0.2)",
          color: cartItems.length === 0 ? "#94a3b8" : "#ffffff",
          cursor: "pointer",
          "&:hover": {
            bgcolor: cartItems.length === 0 ? "#cbd5e1" : "#1d4ed8",
            boxShadow:
              cartItems.length === 0
                ? "none"
                : "0 10px 15px -3px rgba(37, 99, 235, 0.3)",
            transform: "scale(1.02)",
          },
          "&.Mui-disabled": {
            bgcolor: "#e2e8f0",
            color: "#94a3b8",
          },
        }}
        startIcon={<Coins style={{ width: "18px", height: "18px" }} />}
      >
        Đặt Lịch Hẹn Giao Nhận
      </Button>

      <Box className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80">
        <div className="text-[11px] font-black text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <Info style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
          Chính sách an tâm giặt là:
        </div>
        <div className="text-[10px] text-slate-400 leading-normal">
          • Cam kết giặt giũ riêng biệt từng mẻ của gia đình bạn độc lập.
        </div>
        <div className="text-[10px] text-slate-400 leading-normal">
          • Cam kết bảo hiểm đền bù lên tới 20 lần giá trị giặt nếu hư hại do
          lỗi kỹ thuật.
        </div>
      </Box>
    </Box>
  );
};
