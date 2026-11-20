import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Radio,
  CreditCard,
} from "lucide-react";
import { LaundryOrder } from "../../../../types";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";
import { laundryOrdersAPI } from "../../../../services/api";
import { useRealtimeOrders } from "../../../../utils/realtimeClient";
import { useToast } from "../../../../components/Toast";

interface VietQrSheetModalProps {
  order: LaundryOrder | null;
  processing: boolean;
  onClose: () => void;
  onConfirmPaid: (orderId: string) => void;
}

type PaymentGateway = "vietqr" | "payos" | "vnpay";

const GATEWAY_CONFIG: Record<
  PaymentGateway,
  {
    label: string;
    subtitle: string;
    bankName: string;
    bankId: string;
    accountNo: string;
    accountName: string;
    badgeColor: string;
  }
> = {
  vietqr: {
    label: "VietQR 24/7",
    subtitle: "Chuyển khoản nhanh Napas247",
    bankName: "MBBank - Ngân Hàng Quân Đội",
    bankId: "MB",
    accountNo: "0988776655",
    accountName: "CONG TY GIAT LA SACH SE",
    badgeColor: "bg-blue-600 text-white",
  },
  payos: {
    label: "PayOS",
    subtitle: "Cổng đối soát tự động Webhook",
    bankName: "ACB - Ngân Hàng Á Châu (PayOS)",
    bankId: "ACB",
    accountNo: "8899668899",
    accountName: "CONG TY GIAT LA SACH SE",
    badgeColor: "bg-emerald-600 text-white",
  },
  vnpay: {
    label: "VNPay QR",
    subtitle: "Cổng thanh toán VNPay-QR",
    bankName: "Vietcombank - Cổng VNPay",
    bankId: "VCB",
    accountNo: "0011009988776",
    accountName: "CONG TY GIAT LA SACH SE",
    badgeColor: "bg-indigo-600 text-white",
  },
};

export const VietQrSheetModal: React.FC<VietQrSheetModalProps> = ({
  order,
  processing,
  onClose,
  onConfirmPaid,
}) => {
  const { showToast } = useToast();
  const [gateway, setGateway] = useState<PaymentGateway>("payos");
  const [copiedField, setCopiedField] = useState<"acc" | "memo" | null>(null);
  const [reconcilingWebhook, setReconcilingWebhook] = useState(false);
  const [reconciledTxId, setReconciledTxId] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setReconciledTxId(order.paymentTransactionId || null);
      if (
        order.paymentMethod === "vietqr" ||
        order.paymentMethod === "payos" ||
        order.paymentMethod === "vnpay"
      ) {
        setGateway(order.paymentMethod);
      }
      laundryOrdersAPI.createPaymentLink(order.id, gateway).catch(() => {});
    }
  }, [order?.id]);

  // Listen for real-time webhook reconciliation
  useRealtimeOrders(
    useCallback(
      (event) => {
        if (
          order &&
          event.type === "ORDER_PAYMENT_RECONCILED" &&
          event.data?.orderId === order.id
        ) {
          const txId = event.data.paymentTransactionId || "FT-AUTO";
          setReconciledTxId(txId);
          showToast(
            `Đối soát tự động thành công đơn #${order.id} (Mã GD: ${txId})!`,
            "success"
          );
          setTimeout(() => {
            onConfirmPaid(order.id);
          }, 800);
        }
      },
      [order, onConfirmPaid, showToast]
    ),
    order?.id
  );

  if (!order) return null;

  const cfg = GATEWAY_CONFIG[gateway];
  const cleanCode = String(order.id)
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const transferContent = `SACHSE ${cleanCode}`;
  const amount = Math.round(Number(order.totalPrice || 0));

  const qrUrl = `https://img.vietqr.io/image/${cfg.bankId}-${cfg.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(cfg.accountName)}`;

  const handleCopy = (text: string, field: "acc" | "memo") => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTriggerWebhookReconcile = async () => {
    setReconcilingWebhook(true);
    try {
      const res = await laundryOrdersAPI.reconcilePaymentWebhook(order.id, {
        gateway,
        amount,
      });
      const txId =
        res.data?.data?.paymentTransactionId ||
        `FT-${gateway.toUpperCase()}-${Date.now()}`;
      setReconciledTxId(txId);
      showToast(
        `Webhook ${cfg.label} đã đối soát tự động ${amount.toLocaleString(
          "vi-VN"
        )}đ (Mã GD: ${txId})!`,
        "success"
      );
      setTimeout(() => {
        onConfirmPaid(order.id);
      }, 600);
    } catch {
      showToast("Không thể thực hiện đối soát tự động", "error");
    } finally {
      setReconcilingWebhook(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl border border-slate-200 p-5 pb-6 space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[86dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Thanh toán chuyển khoản QR
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Mã đơn: #{order.id.toUpperCase()}
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

        {/* Gateway Switcher Tabs (VietQR / PayOS / VNPay) */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(["payos", "vietqr", "vnpay"] as PaymentGateway[]).map((gw) => {
            const active = gateway === gw;
            return (
              <button
                key={gw}
                type="button"
                onClick={() => {
                  setGateway(gw);
                  laundryOrdersAPI.createPaymentLink(order.id, gw).catch(() => {});
                }}
                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  active
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 font-medium"
                }`}
              >
                <div className="text-xs flex items-center justify-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                  <span>{GATEWAY_CONFIG[gw].label}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  {GATEWAY_CONFIG[gw].subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* QR & Bank Details Card */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-700">{cfg.bankName}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              <Radio className="w-3 h-3 text-emerald-500" />
              Tự động xác nhận
            </span>
          </div>

          <img
            src={qrUrl}
            alt={`QR ${cfg.label} ${order.id}`}
            className="w-48 h-48 mx-auto rounded-xl border border-slate-200 bg-white object-contain p-2 shadow-2xs"
          />

          <div className="text-center space-y-0.5">
            <div className="text-[11px] text-slate-500">
              Số tiền thanh toán (đã gồm phí ship & phụ phí)
            </div>
            <div className="text-xl font-bold text-teal-700 tabular-nums">
              {amount.toLocaleString("vi-VN")}đ
            </div>
            {Number(order.extraFee || 0) > 0 && (
              <div className="text-[11px] text-amber-700 font-medium">
                Đã bao gồm phụ phí yêu cầu: +
                {Number(order.extraFee).toLocaleString("vi-VN")}đ
              </div>
            )}
          </div>

          {/* Copyable Account & Transfer Memo */}
          <div className="space-y-1.5 pt-1 border-t border-slate-200/80 text-xs">
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200">
              <div>
                <div className="text-[10px] text-slate-400">Số tài khoản nhận tiền</div>
                <div className="font-mono font-bold text-slate-900">
                  {cfg.accountNo} · {cfg.accountName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(cfg.accountNo, "acc")}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedField === "acc" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200">
              <div>
                <div className="text-[10px] text-slate-400">
                  Nội dung chuyển khoản (giữ nguyên để xác nhận tự động)
                </div>
                <div className="font-mono font-bold text-teal-700">
                  {transferContent}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(transferContent, "memo")}
                className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedField === "memo" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Auto-Confirmation Note */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2.5">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-slate-200">
              <strong className="text-white">Tự động xác nhận ({cfg.label}):</strong>{" "}
              Khi bạn chuyển đúng số tiền và nội dung{" "}
              <code className="text-teal-300 font-mono font-bold">
                {transferContent}
              </code>
              , đơn hàng sẽ được cập nhật đã thanh toán ngay và thông báo đến tiệm giặt.
            </div>
          </div>

          {reconciledTxId && (
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Đã xác nhận mã giao dịch: {reconciledTxId}</span>
            </div>
          )}

          {(import.meta as any).env?.DEV && (
            <button
              type="button"
              disabled={reconcilingWebhook || processing}
              onClick={handleTriggerWebhookReconcile}
              className="w-full py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>
                {reconcilingWebhook
                  ? "Đang xác nhận giao dịch..."
                  : `[Dev] Mô phỏng nhận tiền qua ${cfg.label}`}
              </span>
            </button>
          )}
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
            label="Tôi đã chuyển khoản"
            className="!h-11 !text-xs"
            textClassName="!text-xs"
          />
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
