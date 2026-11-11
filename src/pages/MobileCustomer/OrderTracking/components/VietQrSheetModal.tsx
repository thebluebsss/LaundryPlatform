import React from "react";
import { X, QrCode, CheckCircle2 } from "lucide-react";
import { LaundryOrder } from "../../../../types";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";

interface VietQrSheetModalProps {
  order: LaundryOrder | null;
  processing: boolean;
  onClose: () => void;
  onConfirmPaid: (orderId: string) => void;
}

export const VietQrSheetModal: React.FC<VietQrSheetModalProps> = ({
  order,
  processing,
  onClose,
  onConfirmPaid,
}) => {
  if (!order) return null;

  const qrUrl =
    order.vietQrUrl ||
    `https://img.vietqr.io/image/MB-0988776655-compact2.png?amount=${
      order.totalPrice
    }&addInfo=${encodeURIComponent(
      `GIATLA ${order.id}`
    )}&accountName=${encodeURIComponent("TIEM GIAT SACH SE")}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl border border-slate-200 p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Thanh Toán VietQR Napas 24/7
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Mã đơn: #{order.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center space-y-3">
          <img
            src={qrUrl}
            alt={`VietQR ${order.id}`}
            className="w-48 h-48 mx-auto rounded-xl border border-slate-200 bg-white object-contain p-2"
          />
          <div className="space-y-1">
            <div className="text-xs text-slate-500">Số tiền cần thanh toán</div>
            <div className="text-xl font-black text-blue-600 font-mono">
              {order.totalPrice.toLocaleString("vi-VN")} VNĐ
            </div>
            <div className="text-[11px] text-slate-600 font-mono">
              Nội dung CK: <strong>GIATLA {order.id}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <ButtonOutLine
            type="button"
            onClick={onClose}
            label="Đóng"
            className="!h-11 !text-xs"
            textClassName="!text-xs"
          />
          <ButtonCustom
            type="button"
            loading={processing}
            onClick={() => onConfirmPaid(order.id)}
            iconStart={<CheckCircle2 className="w-4 h-4" />}
            label="Tôi Đã Chuyển Khoản"
            className="!h-11 !text-xs"
            textClassName="!text-xs"
          />
        </div>
      </div>
    </div>
  );
};
