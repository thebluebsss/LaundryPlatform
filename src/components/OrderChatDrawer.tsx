import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Send,
  MessageSquare,
  Zap,
  User,
  Bike,
  Store,
  ShieldCheck,
} from "lucide-react";
import { OrderChatMessage } from "../types";
import { laundryOrdersAPI } from "../services/api";
import { useRealtimeOrders } from "../utils/realtimeClient";
import { useToast } from "./Toast";

export interface OrderChatDrawerProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: "customer" | "driver" | "store";
  currentSenderName?: string;
  customerName?: string;
  storeName?: string;
  shipperName?: string;
  initialMessages?: OrderChatMessage[];
  onMessagesChanged?: (orderId: string, messages: OrderChatMessage[]) => void;
}

const QUICK_REPLIES_BY_ROLE: Record<
  "customer" | "driver" | "store",
  string[]
> = {
  driver: [
    "Tôi đang đứng dưới sảnh chờ nhận đồ",
    "Khoảng 5 phút nữa tài xế tới điểm hẹn nhé",
    "Tôi đã nhận túi đồ và đang chạy về tiệm giặt",
    "Tôi đang giao đồ sạch tới trước cửa nhà bạn",
  ],
  store: [
    "Tiệm đã nhận yêu cầu lấy gấp của quý khách",
    "Tiệm đã cân đồ xong, mời quý khách kiểm tra xác nhận",
    "Đồ giặt đã sấy thơm và ủi phẳng, chuẩn bị giao trả",
    "Shipper của tiệm đã xuất phát đi giao đồ cho quý khách",
  ],
  customer: [
    "Tôi đang đứng dưới sảnh",
    "Tôi gửi túi đồ ở quầy lễ tân / bảo vệ nhé",
    "Nhờ tiệm giặt kỹ cổ áo và giao đúng giờ hẹn giúp tôi",
    "Khi nào tới nơi tài xế gọi điện giúp tôi nhé",
  ],
};

const ROLE_BADGE_CONFIG: Record<
  "customer" | "driver" | "store" | "system",
  { label: string; badgeClass: string; bubbleClass: string }
> = {
  customer: {
    label: "Khách hàng",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    bubbleClass: "bg-blue-600 text-white",
  },
  driver: {
    label: "Tài xế",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bubbleClass: "bg-emerald-600 text-white",
  },
  store: {
    label: "Chủ tiệm",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    bubbleClass: "bg-slate-900 text-white",
  },
  system: {
    label: "Hệ thống",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    bubbleClass: "bg-teal-50 text-teal-900 border border-teal-200",
  },
};

export const OrderChatDrawer: React.FC<OrderChatDrawerProps> = ({
  orderId,
  isOpen,
  onClose,
  currentRole,
  currentSenderName,
  customerName,
  storeName,
  shipperName,
  initialMessages = [],
  onMessagesChanged,
}) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<OrderChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await laundryOrdersAPI.getMessages(orderId);
      const list = res.data?.data?.messages || [];
      setMessages(list);
      if (onMessagesChanged) {
        onMessagesChanged(orderId, list);
      }
    } catch {
      // keep existing messages
    } finally {
      setLoading(false);
    }
  }, [orderId, onMessagesChanged]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchMessages();
    }
  }, [isOpen, orderId, fetchMessages]);

  // Listen to real-time SSE chat messages
  useRealtimeOrders(
    useCallback(
      (event) => {
        if (!orderId) return;
        if (
          event.type === "ORDER_CHAT_MESSAGE" &&
          event.data?.orderId === orderId &&
          Array.isArray(event.data?.messages)
        ) {
          setMessages(event.data.messages);
          if (onMessagesChanged) {
            onMessagesChanged(orderId, event.data.messages);
          }
        } else if (
          event.type === "ORDER_PAYMENT_RECONCILED" &&
          event.data?.order?.id === orderId &&
          Array.isArray(event.data?.order?.messages)
        ) {
          setMessages(event.data.order.messages);
          if (onMessagesChanged) {
            onMessagesChanged(orderId, event.data.order.messages);
          }
        }
      },
      [orderId, onMessagesChanged]
    ),
    orderId || undefined
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [messages.length, isOpen]);

  if (!isOpen || !orderId) return null;

  const hasDriverAssigned =
    Boolean(shipperName && shipperName.trim().length > 0) ||
    currentRole === "driver";

  const resolvedSenderName =
    currentSenderName ||
    (currentRole === "driver"
      ? shipperName || "Tài xế Sạch Sẽ"
      : currentRole === "store"
        ? storeName || "Chủ Tiệm Giặt Sạch Sẽ"
        : customerName || "Khách hàng");

  const handleSend = async (textToSend: string, isQuickReply = false) => {
    if (!hasDriverAssigned) {
      showToast(
        "Chưa có tài xế nhận chuyến nên chưa thể nhắn tin trong đơn hàng này",
        "warning"
      );
      return;
    }
    const trimmed = textToSend.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const res = await laundryOrdersAPI.sendMessage(orderId, {
        senderRole: currentRole,
        senderName: resolvedSenderName,
        text: trimmed,
        isQuickReply,
      });
      const updatedList: OrderChatMessage[] =
        res.data?.data?.messages || [];
      setMessages(updatedList);
      if (onMessagesChanged) {
        onMessagesChanged(orderId, updatedList);
      }
      if (!isQuickReply) {
        setInputText("");
      }
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Không thể gửi tin nhắn lúc này",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  const quickReplies = QUICK_REPLIES_BY_ROLE[currentRole] || [];

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-teal-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">
                  Kênh Chat Nội Bộ Đơn Hàng
                </h3>
                <span className="font-mono text-xs font-extrabold text-teal-300 bg-teal-950/80 border border-teal-700/60 px-2 py-0.5 rounded-lg shrink-0">
                  #{orderId.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">
                Kết nối trực tiếp: Khách hàng · Tài xế · Chủ tiệm giặt
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Participant Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-[11px] text-slate-600 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <User className="w-3.5 h-3.5 text-blue-600" />
              {customerName || "Khách hàng"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <Bike className="w-3.5 h-3.5 text-emerald-600" />
              {hasDriverAssigned
                ? shipperName || "Tài xế đã nhận chuyến"
                : "Chưa có tài xế nhận chuyến"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <Store className="w-3.5 h-3.5 text-amber-600" />
              {storeName || "Tiệm Giặt Sạch Sẽ"}
            </span>
          </div>
          {hasDriverAssigned ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Đồng bộ trực tuyến
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              Chờ tài xế nhận đơn
            </span>
          )}
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 min-h-[260px] max-h-[420px]">
          {!hasDriverAssigned ? (
            <div className="py-10 px-4 text-center space-y-2.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <Bike className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-black text-amber-900">
                Đơn #{orderId} chưa có tài xế nhận chuyến
              </p>
              <p className="text-[11px] text-amber-800 max-w-xs mx-auto leading-relaxed">
                Kênh nhắn tin nội bộ sẽ tự động mở khóa ngay sau khi có tài xế tiếp nhận chuyến giao nhận này.
              </p>
            </div>
          ) : loading && messages.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Đang tải lịch sử hội thoại đơn #{orderId}...
            </div>
          ) : messages.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                Chưa có tin nhắn nào trong đơn #{orderId}
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Hãy bấm một câu trả lời nhanh bên dưới hoặc nhập lời nhắn cho{" "}
                {currentRole === "customer"
                  ? "Tài xế & Chủ tiệm"
                  : currentRole === "driver"
                    ? "Khách hàng & Chủ tiệm"
                    : "Khách hàng & Tài xế"}
                .
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === currentRole;
              const isSystem = msg.senderRole === "system";
              const roleCfg =
                ROLE_BADGE_CONFIG[msg.senderRole] || ROLE_BADGE_CONFIG.customer;

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl bg-teal-50/90 border border-teal-200 text-teal-950 text-xs flex items-start gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-[11px] text-teal-800">
                        {msg.senderName}
                      </div>
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleCfg.badgeClass}`}
                    >
                      {roleCfg.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                      isMe
                        ? `${roleCfg.bubbleClass} rounded-br-xs`
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 1-Tap Quick Reply Chips */}
        {hasDriverAssigned && (
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>
                Trả lời nhanh 1 chạm ({ROLE_BADGE_CONFIG[currentRole].label}):
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={sending}
                  onClick={() => handleSend(reply, true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 text-slate-700 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 active:scale-95"
                >
                  “{reply}”
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText, false);
          }}
          className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            disabled={!hasDriverAssigned}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              hasDriverAssigned
                ? `Nhắn tin với tư cách ${resolvedSenderName}...`
                : "Chưa có tài xế nhận chuyến — Chưa thể nhắn tin..."
            }
            className="flex-1 h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!hasDriverAssigned || sending || !inputText.trim()}
            className="h-11 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
};
